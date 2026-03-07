// Pris-API — prisberegning via Edge Function
import { supabase } from "../supabase";
import type { PriceBreakdown, PriceRequest } from "../types";
import { withNetworkError } from "../utils/network-error";

// Beregn pris via Edge Function
export function calculatePrice(request: PriceRequest): Promise<PriceBreakdown> {
  return withNetworkError(async () => {
    const { data, error } = await supabase.functions.invoke("calculate-price", {
      body: request,
    });

    if (error) {
      throw new Error(`Feil ved prisberegning: ${error.message}`);
    }

    return data as PriceBreakdown;
  }, "Prisberegning");
}
