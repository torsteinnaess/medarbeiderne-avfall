// Betalings-API — Quickpay-integrasjon
import { supabase } from "../supabase";
import { withNetworkError } from "../utils/network-error";

export interface CreatePaymentResponse {
  payment_url: string;
  quickpay_payment_id: number;
}

// Opprett Quickpay-betaling og hent betalingslenke
export function createPayment(orderId: string): Promise<CreatePaymentResponse> {
  return withNetworkError(async () => {
    // Forny sesjon for å sikre at JWT ikke er utløpt
    const {
      data: { session },
    } = await supabase.auth.refreshSession();
    if (!session?.access_token) {
      throw new Error("Du må være innlogget for å betale");
    }

    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: { order_id: orderId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new Error(`Feil ved opprettelse av betaling: ${error.message}`);
    }

    if (!data?.payment_url) {
      throw new Error("Ingen betalingslenke mottatt fra serveren");
    }

    return data as CreatePaymentResponse;
  }, "Opprettelse av betaling");
}
