// Supabase Edge Function: create-order
// Oppretter en ny ordre med varer og bilder

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
type TimeWindow = "08:00-12:00" | "12:00-16:00" | "16:00-20:00";

interface AnalyzedItem {
  name: string;
  category: WasteCategory;
  estimated_weight_kg: number;
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

interface PickupDetails {
  address: string;
  lat: number;
  lng: number;
  floor: number;
  has_elevator: boolean;
  has_parking: boolean;
  carry_distance: CarryDistance;
  pickup_date: string;
  pickup_time_window: TimeWindow;
  notes: string;
}

interface CreateOrderRequest {
  items: AnalyzedItem[];
  pickup_details: PickupDetails;
  image_storage_paths: string[];
  price_breakdown: PriceBreakdown;
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
    // Autentiser bruker fra JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autentisering kreves" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Opprett klient med brukerens JWT for RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verifiser bruker
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Ugyldig autentisering" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as CreateOrderRequest;
    const { items, pickup_details, image_storage_paths, price_breakdown } =
      body;

    // Valider input
    if (!items?.length || !pickup_details || !price_breakdown) {
      return new Response(
        JSON.stringify({
          error:
            "Mangler påkrevde felter: items, pickup_details, price_breakdown",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Opprett ordre
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        pickup_address: pickup_details.address,
        pickup_lat: pickup_details.lat,
        pickup_lng: pickup_details.lng,
        floor: pickup_details.floor,
        has_elevator: pickup_details.has_elevator,
        has_parking: pickup_details.has_parking,
        carry_distance: pickup_details.carry_distance,
        pickup_date: pickup_details.pickup_date,
        pickup_time_window: pickup_details.pickup_time_window,
        notes: pickup_details.notes || "",
        subtotal: price_breakdown.subtotal,
        surcharges: price_breakdown.surcharges_total,
        total_price: price_breakdown.total,
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError)
      throw new Error(`Feil ved oppretting av ordre: ${orderError.message}`);

    // Beregn enhetspris og sett inn ordrevarer
    const orderItems = items.map((item: AnalyzedItem, index: number) => {
      const priceItem = price_breakdown.items[index];
      const unitPrice = priceItem
        ? priceItem.amount / Math.max(item.estimated_weight_kg, 0.1)
        : 0;
      return {
        order_id: order.id,
        name: item.name,
        category: item.category,
        estimated_weight_kg: item.estimated_weight_kg,
        unit_price: Math.round(unitPrice * 100) / 100,
        item_total: priceItem?.amount ?? 0,
      };
    });

    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select();

    if (itemsError)
      throw new Error(`Feil ved innsetting av varer: ${itemsError.message}`);

    // Sett inn ordrebilder
    let insertedImages: {
      id: string;
      order_id: string;
      storage_path: string;
      uploaded_at: string;
    }[] = [];
    if (image_storage_paths?.length) {
      const imageRows = image_storage_paths.map((path: string) => ({
        order_id: order.id,
        storage_path: path,
      }));

      const { data: images, error: imagesError } = await supabase
        .from("order_images")
        .insert(imageRows)
        .select();

      if (imagesError)
        throw new Error(
          `Feil ved innsetting av bilder: ${imagesError.message}`,
        );
      insertedImages = images ?? [];
    }

    // Returner komplett ordre
    const result = {
      ...order,
      items: insertedItems ?? [],
      images: insertedImages,
    };

    return new Response(JSON.stringify(result), {
      status: 201,
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
