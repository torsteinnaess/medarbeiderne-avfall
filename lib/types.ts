// ============================================================
// Shared TypeScript types — used by ALL streams/agents
// ============================================================

// --- Waste Categories ---
export const WASTE_CATEGORIES = [
  "fett_vegetabilske_oljer",
  "hageavfall",
  "treverk_ubehandlet",
  "impregnert_treverk_cu",
  "papp_papir",
  "glass_metallemballasje",
  "isolerglassruter",
  "jern_metall",
  "ee_avfall",
  "gips",
  "tunge_masser",
  "blyholdig_avfall",
  "blaasesand",
  "impregnert_treverk_cca",
  "isocyanat",
  "uorg_syrer",
  "rengjoringsmidler",
  "klorparafin_isolerglassruter",
  "gassbeholdere",
  "gassflasker_propanflasker",
  "brannslukkingsapparater",
  "usortert_avfall",
] as const;

export type WasteCategory = (typeof WASTE_CATEGORIES)[number];

export const WASTE_CATEGORY_LABELS: Record<WasteCategory, string> = {
  fett_vegetabilske_oljer: "Fett og vegetabilske oljer kg",
  hageavfall: "Hageavfall maks 15 cm tykkelse",
  treverk_ubehandlet: "Treverk ubehandlet",
  impregnert_treverk_cu: "Impregnert treverk CU (etter 2002)",
  papp_papir: "Papp/papir",
  glass_metallemballasje: "Glass og metallemballasje",
  isolerglassruter: "Isolerglassruter uten farlige stoffer",
  jern_metall: "Jern/metall sams",
  ee_avfall: "EE avfall tonn",
  gips: "Gips",
  tunge_masser: "Tunge masser uten analyse",
  blyholdig_avfall: "Blyholdig avfall",
  blaasesand: "Blåsesand småkolli",
  impregnert_treverk_cca: "Impregnert treverk CCA (før 2003)",
  isocyanat: "Isocyanat småkolli",
  uorg_syrer: "Uorg syrer fast småkolli",
  rengjoringsmidler: "Rengjøringsmidler flyt småkolli",
  klorparafin_isolerglassruter: "Klorparafinholdige isolerglassruter",
  gassbeholdere: "Gassbeholdere små",
  gassflasker_propanflasker: "Gassflasker/propanflasker",
  brannslukkingsapparater: "Brannslukkingsapparater",
  usortert_avfall: "Usortert avfall",
};

// --- Order Status ---
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Venter",
  confirmed: "Bekreftet",
  scheduled: "Planlagt",
  in_progress: "Pågår",
  completed: "Fullført",
  cancelled: "Kansellert",
};

// --- Carry Distance ---
export const CARRY_DISTANCES = ["0-10m", "10-25m", "25-50m", "50m+"] as const;

export type CarryDistance = (typeof CARRY_DISTANCES)[number];

// --- Pickup Time Windows ---
export const TIME_WINDOWS = [
  "08:00-12:00",
  "12:00-16:00",
  "16:00-20:00",
] as const;

export type TimeWindow = (typeof TIME_WINDOWS)[number];

// --- Data Models ---
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  name: string;
  category: WasteCategory;
  estimated_weight_kg: number;
  unit_price: number;
  item_total: number;
}

export interface OrderImage {
  id: string;
  order_id: string;
  storage_path: string;
  uploaded_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  floor: number;
  has_elevator: boolean;
  has_parking: boolean;
  carry_distance: CarryDistance;
  pickup_date: string;
  pickup_time_window: TimeWindow;
  notes: string;
  subtotal: number;
  surcharges: number;
  total_price: number;
  payment_status: "pending" | "paid" | "refunded";
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  images?: OrderImage[];
}

// --- AI Analysis ---
export interface AnalyzedItem {
  name: string;
  category: WasteCategory;
  estimated_weight_kg: number;
}

export interface AnalysisResult {
  items: AnalyzedItem[];
}

// --- Price Calculation ---
export interface PriceRequest {
  items: AnalyzedItem[];
  floor: number;
  has_elevator: boolean;
  has_parking: boolean;
  carry_distance: CarryDistance;
}

export interface PriceLineItem {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  items: PriceLineItem[];
  surcharges: PriceLineItem[];
  subtotal: number;
  surcharges_total: number;
  total: number;
}

// --- Order Draft (Zustand store shape) ---
export interface PickupDetails {
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

export interface OrderDraft {
  imageUris: string[];
  storagePaths: string[];
  analyzedItems: AnalyzedItem[];
  pickupDetails: PickupDetails | null;
  priceBreakdown: PriceBreakdown | null;
}
