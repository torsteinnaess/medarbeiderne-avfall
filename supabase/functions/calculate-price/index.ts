// Supabase Edge Function: calculate-price
// Beregner pris basert på varer, etasje, heis, parkering og bæredistanse

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type WasteCategory =
  | "fett_vegetabilske_oljer"
  | "hageavfall"
  | "treverk_ubehandlet"
  | "impregnert_treverk_cu"
  | "papp_papir"
  | "glass_metallemballasje"
  | "isolerglassruter"
  | "jern_metall"
  | "ee_avfall"
  | "gips"
  | "tunge_masser"
  | "blyholdig_avfall"
  | "blaasesand"
  | "impregnert_treverk_cca"
  | "isocyanat"
  | "uorg_syrer"
  | "rengjoringsmidler"
  | "klorparafin_isolerglassruter"
  | "gassbeholdere"
  | "gassflasker_propanflasker"
  | "brannslukkingsapparater"
  | "usortert_avfall";
type CarryDistance = "0-10m" | "10-25m" | "25-50m" | "50m+";

interface AnalyzedItem {
  name: string;
  category: WasteCategory;
  estimated_weight_kg: number;
}

interface PriceRequest {
  items: AnalyzedItem[];
  floor: number;
  has_elevator: boolean;
  has_parking: boolean;
  carry_distance: CarryDistance;
}

interface PriceLineItem {
  label: string;
  amount: number;
}

interface PriceBreakdown {
  items: PriceLineItem[];
  surcharges: PriceLineItem[];
  subtotal: number;
  surcharges_total: number;
  total: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = (await req.json()) as PriceRequest;
    const { items, floor, has_elevator, has_parking, carry_distance } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Minst én vare kreves" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Hent prisinformasjon fra database
    const { data: pricingRows, error: pricingError } = await supabase
      .from("pricing_config")
      .select("category, base_price_per_kg, minimum_price");

    if (pricingError)
      throw new Error(`Feil ved henting av priser: ${pricingError.message}`);

    const pricingMap = new Map<
      string,
      { base_price_per_kg: number; minimum_price: number }
    >();
    for (const row of pricingRows ?? []) {
      pricingMap.set(row.category, {
        base_price_per_kg: Number(row.base_price_per_kg),
        minimum_price: Number(row.minimum_price),
      });
    }

    // Beregn pris per vare
    const itemLines: PriceLineItem[] = items.map((item: AnalyzedItem) => {
      const pricing = pricingMap.get(item.category) ?? {
        base_price_per_kg: 8,
        minimum_price: 299,
      };
      const weightPrice = item.estimated_weight_kg * pricing.base_price_per_kg;
      const amount = Math.max(weightPrice, pricing.minimum_price);
      return { label: item.name, amount: Math.round(amount * 100) / 100 };
    });

    const subtotal = itemLines.reduce((sum, line) => sum + line.amount, 0);

    // Hent tilleggsavgifter fra database
    const { data: surchargeRows, error: surchargeError } = await supabase
      .from("surcharge_config")
      .select("surcharge_type, condition_description, amount");

    if (surchargeError)
      throw new Error(`Feil ved henting av tillegg: ${surchargeError.message}`);

    const surchargeMap = new Map<
      string,
      { description: string; amount: number }
    >();
    for (const row of surchargeRows ?? []) {
      surchargeMap.set(row.surcharge_type, {
        description: row.condition_description,
        amount: Number(row.amount),
      });
    }

    // Beregn tilleggsavgifter
    const surchargeLines: PriceLineItem[] = [];

    // Etasjetillegg (kun uten heis, fra 2. etasje)
    if (!has_elevator && floor >= 2) {
      const key =
        floor >= 5 ? "no_elevator_floor_5+" : `no_elevator_floor_${floor}`;
      const surcharge = surchargeMap.get(key);
      if (surcharge) {
        surchargeLines.push({
          label: surcharge.description,
          amount: surcharge.amount,
        });
      }
    }

    // Bæredistanse-tillegg
    const carryMap: Record<string, string> = {
      "10-25m": "carry_10_25m",
      "25-50m": "carry_25_50m",
      "50m+": "carry_50m_plus",
    };
    const carryKey = carryMap[carry_distance];
    if (carryKey) {
      const surcharge = surchargeMap.get(carryKey);
      if (surcharge) {
        surchargeLines.push({
          label: surcharge.description,
          amount: surcharge.amount,
        });
      }
    }

    // Parkeringstillegg
    if (!has_parking) {
      const surcharge = surchargeMap.get("no_parking");
      if (surcharge) {
        surchargeLines.push({
          label: surcharge.description,
          amount: surcharge.amount,
        });
      }
    }

    const surcharges_total = surchargeLines.reduce(
      (sum, line) => sum + line.amount,
      0,
    );

    const breakdown: PriceBreakdown = {
      items: itemLines,
      surcharges: surchargeLines,
      subtotal: Math.round(subtotal * 100) / 100,
      surcharges_total,
      total: Math.round((subtotal + surcharges_total) * 100) / 100,
    };

    return new Response(JSON.stringify(breakdown), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ukjent feil";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
