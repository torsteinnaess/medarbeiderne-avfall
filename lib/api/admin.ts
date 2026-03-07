// Admin API — funksjoner for admin-dashbordet
import { supabase } from "../supabase";
import type { Order, OrderStatus, Profile } from "../types";
import { withNetworkError } from "../utils/network-error";

export interface AdminStats {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface AdminUserWithOrderCount extends Profile {
  order_count: number;
}

// Hent dashboard-statistikk
export function fetchAdminStats(): Promise<AdminStats> {
  return withNetworkError(async () => {
    const [ordersRes, usersRes] = await Promise.all([
      supabase.from("orders").select("status, total_price"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    if (ordersRes.error) {
      throw new Error(`Feil ved henting av ordrestatistikk: ${ordersRes.error.message}`);
    }
    if (usersRes.error) {
      throw new Error(`Feil ved henting av brukerstatistikk: ${usersRes.error.message}`);
    }

    const orders = ordersRes.data ?? [];
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total_price), 0);

    return {
      totalOrders: orders.length,
      totalUsers: usersRes.count ?? 0,
      totalRevenue,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      confirmedOrders: orders.filter((o) => o.status === "confirmed").length,
      completedOrders: orders.filter((o) => o.status === "completed").length,
      cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
    };
  }, "Henting av admin-statistikk");
}

// Hent alle ordrer (admin)
export function fetchAllOrders(statusFilter?: OrderStatus): Promise<Order[]> {
  return withNetworkError(async () => {
    let query = supabase
      .from("orders")
      .select("*, items:order_items(*), images:order_images(*)")
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Feil ved henting av alle ordrer: ${error.message}`);
    }

    return (data ?? []) as Order[];
  }, "Henting av alle ordrer");
}

// Hent alle brukere med ordretelling
export function fetchAllUsers(): Promise<AdminUserWithOrderCount[]> {
  return withNetworkError(async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      throw new Error(`Feil ved henting av brukere: ${profilesError.message}`);
    }

    // Hent ordretelling per bruker
    const { data: orderCounts, error: countError } = await supabase
      .from("orders")
      .select("user_id");

    if (countError) {
      throw new Error(`Feil ved henting av ordretelling: ${countError.message}`);
    }

    const countMap = new Map<string, number>();
    for (const row of orderCounts ?? []) {
      countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1);
    }

    return (profiles ?? []).map((p) => ({
      ...(p as Profile),
      order_count: countMap.get(p.id) ?? 0,
    }));
  }, "Henting av alle brukere");
}

// Oppdater ordrestatus (admin)
export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return withNetworkError(async () => {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("*, items:order_items(*), images:order_images(*)")
      .single();

    if (error) {
      throw new Error(`Feil ved oppdatering av ordrestatus: ${error.message}`);
    }

    return data as Order;
  }, "Oppdatering av ordrestatus");
}

