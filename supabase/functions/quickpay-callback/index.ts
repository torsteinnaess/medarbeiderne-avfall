// Supabase Edge Function: quickpay-callback
// Mottar asynkrone callbacks fra Quickpay og oppdaterer ordrestatus

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, quickpay-checksum-sha256, quickpay-resource-type, quickpay-account-id, quickpay-api-version",
};

// HMAC-SHA256 checksum-validering
async function validateChecksum(
  body: string,
  checksum: string,
  privateKey: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(privateKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body),
  );

  const hexHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexHash === checksum;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const privateKey = Deno.env.get("QUICKPAY_PRIVATE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Les rå body for checksum-validering
    const rawBody = await req.text();
    const checksum = req.headers.get("quickpay-checksum-sha256");

    if (!checksum) {
      console.error("[quickpay-callback] Mangler checksum-header");
      return new Response("Missing checksum", { status: 400 });
    }

    // Valider checksum
    const isValid = await validateChecksum(rawBody, checksum, privateKey);
    if (!isValid) {
      console.error("[quickpay-callback] Ugyldig checksum");
      return new Response("Invalid checksum", { status: 403 });
    }

    const payment = JSON.parse(rawBody);
    console.log(
      `[quickpay-callback] Payment ${payment.id}, accepted: ${payment.accepted}, state: ${payment.state}`,
    );

    // Finn siste operasjon
    const operations = payment.operations || [];
    const lastOp = operations[operations.length - 1];

    if (!lastOp) {
      console.log("[quickpay-callback] Ingen operasjoner funnet, ignorerer");
      return new Response("OK", { status: 200 });
    }

    console.log(
      `[quickpay-callback] Siste operasjon: ${lastOp.type}, qp_status: ${lastOp.qp_status_code}`,
    );

    // Finn ordre basert på quickpay_payment_id
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: order, error: findError } = await adminClient
      .from("orders")
      .select("id, payment_status, status")
      .eq("quickpay_payment_id", payment.id)
      .single();

    if (findError || !order) {
      console.error(
        `[quickpay-callback] Ordre ikke funnet for payment ${payment.id}`,
      );
      return new Response("Order not found", { status: 404 });
    }

    // Oppdater basert på operasjonstype
    const isApproved = lastOp.qp_status_code === "20000";

    if (
      (lastOp.type === "authorize" || lastOp.type === "capture") &&
      isApproved &&
      payment.accepted
    ) {
      const newPaymentStatus =
        lastOp.type === "capture" ? "paid" : "authorized";

      const { error: updateError } = await adminClient
        .from("orders")
        .update({
          payment_status: newPaymentStatus,
          payment_reference: String(payment.id),
          status: "confirmed",
        })
        .eq("id", order.id);

      if (updateError) {
        console.error(
          `[quickpay-callback] Feil ved oppdatering: ${updateError.message}`,
        );
        return new Response("Update failed", { status: 500 });
      }

      console.log(
        `[quickpay-callback] Ordre ${order.id} oppdatert til ${newPaymentStatus}`,
      );
    } else {
      console.log(
        `[quickpay-callback] Ignorerer operasjon: ${lastOp.type}, approved: ${isApproved}`,
      );
    }

    return new Response("OK", { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ukjent feil";
    console.error("[quickpay-callback] Error:", message);
    return new Response("Internal error", { status: 500 });
  }
});

