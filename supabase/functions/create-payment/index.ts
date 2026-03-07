// Supabase Edge Function: create-payment
// Oppretter en Quickpay-betaling og returnerer betalingslenke

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const QUICKPAY_API_URL = "https://api.quickpay.net";

interface CreatePaymentRequest {
  order_id: string;
}

// Hjelpefunksjon for Quickpay API-kall
async function quickpayRequest(
  path: string,
  method: string,
  apiKey: string,
  body?: Record<string, unknown>,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Accept-Version": "v10",
    Accept: "application/json",
    Authorization: `Basic ${btoa(`:${apiKey}`)}`,
  };

  const options: RequestInit = { method, headers };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  return fetch(`${QUICKPAY_API_URL}${path}`, options);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Autentiser bruker
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autentisering kreves" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const quickpayApiKey = Deno.env.get("QUICKPAY_API_KEY")!;

    // Verifiser bruker med brukerens JWT
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      },
    );
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Ugyldig autentisering" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { order_id } = (await req.json()) as CreatePaymentRequest;
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id er påkrevd" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Hent ordre og verifiser eierskap
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Ordre ikke funnet" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.payment_status !== "pending") {
      return new Response(
        JSON.stringify({
          error: "Ordre er allerede betalt eller under behandling",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generer unik order_id for Quickpay (maks 20 tegn)
    const qpOrderId = order_id.replace(/-/g, "").substring(0, 20);

    // 1. Opprett betaling i Quickpay
    const paymentRes = await quickpayRequest(
      "/payments",
      "POST",
      quickpayApiKey,
      {
        order_id: qpOrderId,
        currency: "NOK",
      },
    );

    if (!paymentRes.ok) {
      const errBody = await paymentRes.text();
      throw new Error(
        `Quickpay create payment feilet: ${paymentRes.status} ${errBody}`,
      );
    }

    const payment = await paymentRes.json();
    const quickpayPaymentId = payment.id;

    // 2. Opprett betalingslenke
    // Beløp i øre (1 kr = 100 øre)
    const amountInOere = Math.round(Number(order.total_price) * 100);

    // Callback URL — Supabase Edge Function
    const callbackUrl = `${supabaseUrl}/functions/v1/quickpay-callback`;

    // Continue/cancel URLs — dyp lenke tilbake til appen
    const continueUrl = `avfallhenting://order/confirmation?order_id=${order_id}`;
    const cancelUrl = `avfallhenting://order/checkout?order_id=${order_id}`;

    const linkRes = await quickpayRequest(
      `/payments/${quickpayPaymentId}/link`,
      "PUT",
      quickpayApiKey,
      {
        amount: amountInOere,
        continue_url: continueUrl,
        cancel_url: cancelUrl,
        callback_url: callbackUrl,
        language: "no",
        auto_capture: true,
        payment_methods: "creditcard",
      },
    );

    if (!linkRes.ok) {
      const errBody = await linkRes.text();
      throw new Error(
        `Quickpay create link feilet: ${linkRes.status} ${errBody}`,
      );
    }

    const linkData = await linkRes.json();
    const paymentUrl = linkData.url;

    // 3. Oppdater ordre med Quickpay-data
    const { error: updateError } = await adminClient
      .from("orders")
      .update({
        quickpay_payment_id: quickpayPaymentId,
        quickpay_payment_link: paymentUrl,
      })
      .eq("id", order_id);

    if (updateError) {
      throw new Error(`Feil ved oppdatering av ordre: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        payment_url: paymentUrl,
        quickpay_payment_id: quickpayPaymentId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ukjent feil";
    console.error("[create-payment] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
