// TanStack Query hooks — bro mellom UI og API-laget
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth";
import type {
    AnalysisResult,
    AnalyzedItem,
    Order,
    OrderStatus,
    PickupDetails,
    PriceBreakdown,
    PriceRequest,
    Profile,
} from "../types";
import {
    type AdminStats,
    type AdminUserWithOrderCount,
    fetchAdminStats,
    fetchAllOrders,
    fetchAllUsers,
    updateOrderStatus,
} from "./admin";
import { analyzeImages } from "./analysis";
import { uploadImages } from "./images";
import {
    cancelOrder,
    createOrder,
    fetchLastPickupDetails,
    fetchOrder,
    fetchOrders,
} from "./orders";
import {
    type CreatePaymentOptions,
    type CreatePaymentResponse,
    createPayment,
} from "./payments";
import { calculatePrice } from "./pricing";
import { fetchProfile, updateProfile } from "./profile";

// --- Ordrer ---

export function useOrders() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: isInitialized,
  });
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    Error,
    {
      items: AnalyzedItem[];
      pickup_details: PickupDetails;
      image_storage_paths: string[];
      price_breakdown: PriceBreakdown;
    }
  >({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useLastPickupDetails() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  return useQuery<PickupDetails | null>({
    queryKey: ["lastPickupDetails"],
    queryFn: fetchLastPickupDetails,
    enabled: isInitialized,
  });
}

// --- Betaling ---

export function useCreatePayment() {
  return useMutation<CreatePaymentResponse, Error, CreatePaymentOptions>({
    mutationFn: createPayment,
  });
}

// --- Bilder ---

export function useUploadImages() {
  return useMutation<string[], Error, { imageUris: string[]; userId: string }>({
    mutationFn: ({ imageUris, userId }) => uploadImages(imageUris, userId),
  });
}

// --- Analyse ---

export function useAnalyzeImages() {
  return useMutation<AnalysisResult, Error, string[]>({
    mutationFn: analyzeImages,
  });
}

// --- Pris ---

export function useCalculatePrice() {
  return useMutation<PriceBreakdown, Error, PriceRequest>({
    mutationFn: calculatePrice,
  });
}

// --- Profil ---

export function useProfile(userId: string) {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  return useQuery<Profile>({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId && isInitialized,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    Profile,
    Error,
    { userId: string; updates: Partial<Pick<Profile, "name" | "phone">> }
  >({
    mutationFn: ({ userId, updates }) => updateProfile(userId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", variables.userId],
      });
    },
  });
}

// --- Admin ---

export function useAdminStats() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    enabled: isInitialized,
  });
}

export function useAdminOrders(statusFilter?: OrderStatus) {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  return useQuery<Order[]>({
    queryKey: ["admin", "orders", statusFilter],
    queryFn: () => fetchAllOrders(statusFilter),
    enabled: isInitialized,
  });
}

export function useAdminUsers() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  return useQuery<AdminUserWithOrderCount[]>({
    queryKey: ["admin", "users"],
    queryFn: fetchAllUsers,
    enabled: isInitialized,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, { orderId: string; status: OrderStatus }>({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
