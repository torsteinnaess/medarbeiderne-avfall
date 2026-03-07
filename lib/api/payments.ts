// Betalings-API — Quickpay-integrasjon
import { useAuthStore } from "../stores/auth";
import { supabaseAnonKey, supabaseUrl } from "../supabase";
import { withNetworkError } from "../utils/network-error";

export interface CreatePaymentResponse {
  payment_url: string;
  quickpay_payment_id: number;
}

export type PaymentMethod = "creditcard" | "vipps" | "apple-pay" | "google-pay";

export interface CreatePaymentOptions {
  orderId: string;
  paymentMethod: PaymentMethod;
  continueUrl?: string;
  cancelUrl?: string;
}

// Opprett Quickpay-betaling og hent betalingslenke
// Bruker raw fetch i stedet for supabase.functions.invoke fordi
// invoke-klienten kaller getSession() internt, som henger på native (SecureStore).
export function createPayment(
  options: CreatePaymentOptions,
): Promise<CreatePaymentResponse> {
  return withNetworkError(async () => {
    const accessToken = useAuthStore.getState().session?.access_token;
    if (!accessToken) {
      throw new Error("Du må være innlogget for å betale");
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/create-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        order_id: options.orderId,
        payment_method: options.paymentMethod,
        continue_url: options.continueUrl,
        cancel_url: options.cancelUrl,
      }),
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        // Bruk generisk feilmelding
      }
      throw new Error(`Feil ved opprettelse av betaling: ${message}`);
    }

    const data = (await res.json()) as CreatePaymentResponse;

    if (!data?.payment_url) {
      throw new Error("Ingen betalingslenke mottatt fra serveren");
    }

    return data;
  }, "Opprettelse av betaling");
}
