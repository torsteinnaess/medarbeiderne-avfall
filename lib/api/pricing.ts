// Pris-API — prisberegning via Edge Function
import { supabase } from '../supabase';
import type { PriceRequest, PriceBreakdown } from '../types';

// Beregn pris via Edge Function
export async function calculatePrice(
  request: PriceRequest
): Promise<PriceBreakdown> {
  const { data, error } = await supabase.functions.invoke('calculate-price', {
    body: request,
  });

  if (error) {
    throw new Error(`Feil ved prisberegning: ${error.message}`);
  }

  return data as PriceBreakdown;
}

