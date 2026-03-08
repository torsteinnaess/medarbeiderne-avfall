// Ordre-API — rene async-funksjoner for ordrehåndtering
import { useAuthStore } from "../stores/auth";
import { supabase, supabaseAnonKey, supabaseUrl } from "../supabase";
import type {
    AnalyzedItem,
    Order,
    PickupDetails,
    PriceBreakdown,
} from "../types";
import { withNetworkError } from "../utils/network-error";

interface CreateOrderInput {
  items: AnalyzedItem[];
  pickup_details: PickupDetails;
  image_storage_paths: string[];
  price_breakdown: PriceBreakdown;
}

// Hent alle ordrer for innlogget bruker (med varer og bilder)
export function fetchOrders(): Promise<Order[]> {
  return withNetworkError(async () => {
    console.log("[fetchOrders] Starting query...");
    const startTime = Date.now();
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*), images:order_images(*)")
      .order("created_at", { ascending: false });

    const elapsed = Date.now() - startTime;
    if (error) {
      console.error(`[fetchOrders] Failed after ${elapsed}ms:`, error.message);
      throw new Error(`Feil ved henting av ordrer: ${error.message}`);
    }

    console.log(
      `[fetchOrders] OK — ${data?.length ?? 0} orders in ${elapsed}ms`,
    );
    return (data ?? []) as Order[];
  }, "Henting av ordrer");
}

// Hent én ordre med ID (med varer og bilder)
export function fetchOrder(id: string): Promise<Order> {
  return withNetworkError(async () => {
    console.log(`[fetchOrder] Fetching order ${id.slice(0, 8)}...`);
    const startTime = Date.now();
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*), images:order_images(*)")
      .eq("id", id)
      .single();

    const elapsed = Date.now() - startTime;
    if (error) {
      console.error(`[fetchOrder] Failed after ${elapsed}ms:`, error.message);
      throw new Error(`Feil ved henting av ordre: ${error.message}`);
    }

    console.log(`[fetchOrder] OK — order ${id.slice(0, 8)} in ${elapsed}ms`);
    return data as Order;
  }, "Henting av ordre");
}

// Opprett ny ordre via Edge Function
// Bruker raw fetch i stedet for supabase.functions.invoke fordi
// invoke-klienten kaller getSession() internt, som henger på native (SecureStore).
export function createOrder(draft: CreateOrderInput): Promise<Order> {
  return withNetworkError(async () => {
    const accessToken = useAuthStore.getState().session?.access_token;
    if (!accessToken) {
      throw new Error("Du må være innlogget for å opprette en bestilling");
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify(draft),
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        // Bruk generisk feilmelding
      }
      throw new Error(`Feil ved oppretting av ordre: ${message}`);
    }

    return (await res.json()) as Order;
  }, "Oppretting av ordre");
}

// Hent hentedetaljer fra siste ordre (for å forhåndsutfylle skjemaet)
export function fetchLastPickupDetails(): Promise<PickupDetails | null> {
  return withNetworkError(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "pickup_address, pickup_lat, pickup_lng, floor, has_elevator, has_parking, carry_distance, pickup_time_window, notes",
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Feil ved henting av siste hentedetaljer: ${error.message}`,
      );
    }

    if (!data) return null;

    return {
      address: data.pickup_address,
      lat: data.pickup_lat,
      lng: data.pickup_lng,
      floor: data.floor,
      has_elevator: data.has_elevator,
      has_parking: data.has_parking,
      carry_distance: data.carry_distance as PickupDetails["carry_distance"],
      pickup_date: "", // Don't reuse date — user must pick a new one
      pickup_time_window:
        data.pickup_time_window as PickupDetails["pickup_time_window"],
      notes: data.notes,
    };
  }, "Henting av siste hentedetaljer");
}

// Kanseller en ordre
export function cancelOrder(id: string): Promise<void> {
  return withNetworkError(async () => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      throw new Error(`Feil ved kansellering av ordre: ${error.message}`);
    }
  }, "Kansellering av ordre");
}
