// Ordre-API — rene async-funksjoner for ordrehåndtering
import { supabase } from '../supabase';
import type {
  Order,
  AnalyzedItem,
  PickupDetails,
  PriceBreakdown,
} from '../types';

interface CreateOrderInput {
  items: AnalyzedItem[];
  pickup_details: PickupDetails;
  image_storage_paths: string[];
  price_breakdown: PriceBreakdown;
}

// Hent alle ordrer for innlogget bruker (med varer og bilder)
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), images:order_images(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Feil ved henting av ordrer: ${error.message}`);
  }

  return (data ?? []) as Order[];
}

// Hent én ordre med ID (med varer og bilder)
export async function fetchOrder(id: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), images:order_images(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Feil ved henting av ordre: ${error.message}`);
  }

  return data as Order;
}

// Opprett ny ordre via Edge Function
export async function createOrder(draft: CreateOrderInput): Promise<Order> {
  const { data, error } = await supabase.functions.invoke('create-order', {
    body: draft,
  });

  if (error) {
    throw new Error(`Feil ved oppretting av ordre: ${error.message}`);
  }

  return data as Order;
}

// Kanseller en ordre
export async function cancelOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    throw new Error(`Feil ved kansellering av ordre: ${error.message}`);
  }
}

