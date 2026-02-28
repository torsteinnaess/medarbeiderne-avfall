// TanStack Query hooks — bro mellom UI og API-laget
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    AnalysisResult,
    AnalyzedItem,
    Order,
    PickupDetails,
    PriceBreakdown,
    PriceRequest,
    Profile,
} from "../types";
import { analyzeImages } from "./analysis";
import { uploadImages } from "./images";
import { cancelOrder, createOrder, fetchOrder, fetchOrders } from "./orders";
import { calculatePrice } from "./pricing";
import { fetchProfile, updateProfile } from "./profile";

// --- Ordrer ---

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
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

// --- Bilder ---

export function useUploadImages() {
  return useMutation<string[], Error, { imageUris: string[]; userId?: string }>(
    {
      mutationFn: ({ imageUris, userId }) => uploadImages(imageUris, userId),
    },
  );
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
  return useQuery<Profile>({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
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
