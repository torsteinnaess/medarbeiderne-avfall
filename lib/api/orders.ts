// Ordre-API — rene async-funksjoner for ordrehåndtering
import { supabase } from "../supabase";
import type {
    AnalyzedItem,
    Order,
    PickupDetails,
    PriceBreakdown,
} from "../types";

interface CreateOrderInput {
  items: AnalyzedItem[];
  pickup_details: PickupDetails;
  image_storage_paths: string[];
  price_breakdown: PriceBreakdown;
}

// Hent alle ordrer for innlogget bruker (med varer og bilder)
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), images:order_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Feil ved henting av ordrer: ${error.message}`);
  }

  return (data ?? []) as Order[];
}

// Hent én ordre med ID (med varer og bilder)
export async function fetchOrder(id: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), images:order_images(*)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Feil ved henting av ordre: ${error.message}`);
  }

  return data as Order;
}

// Opprett ny ordre via Edge Function
export async function createOrder(draft: CreateOrderInput): Promise<Order> {
  // Hent sesjon eksplisitt for å sikre at JWT sendes med
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Du må være innlogget for å opprette en bestilling");
  }

  const { data, error } = await supabase.functions.invoke("create-order", {
    body: draft,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    // Forsøk å hente detaljert feilmelding fra responsen
    let message = error.message;
    if (error.context && typeof error.context.json === "function") {
      try {
        const body = await error.context.json();
        if (body?.error) {
          message = body.error;
        }
      } catch {
        // Bruk generisk feilmelding
      }
    }
    throw new Error(`Feil ved oppretting av ordre: ${message}`);
  }

  return data as Order;
}

// Kanseller en ordre
export async function cancelOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    throw new Error(`Feil ved kansellering av ordre: ${error.message}`);
  }
}
