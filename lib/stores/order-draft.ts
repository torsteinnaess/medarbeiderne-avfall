import { create } from 'zustand';
import type {
  AnalyzedItem,
  CarryDistance,
  OrderDraft,
  PickupDetails,
  PriceBreakdown,
  TimeWindow,
} from '@/lib/types';

interface OrderDraftActions {
  // Images
  addImageUri: (uri: string) => void;
  removeImageUri: (uri: string) => void;
  setStoragePaths: (paths: string[]) => void;

  // AI Analysis
  setAnalyzedItems: (items: AnalyzedItem[]) => void;
  updateItem: (index: number, item: AnalyzedItem) => void;
  removeItem: (index: number) => void;

  // Pickup Details
  setPickupDetails: (details: PickupDetails) => void;

  // Price
  setPriceBreakdown: (breakdown: PriceBreakdown) => void;

  // Reset
  reset: () => void;
}

const initialState: OrderDraft = {
  imageUris: [],
  storagePaths: [],
  analyzedItems: [],
  pickupDetails: null,
  priceBreakdown: null,
};

export const useOrderDraftStore = create<OrderDraft & OrderDraftActions>((set) => ({
  ...initialState,

  addImageUri: (uri) =>
    set((state) => ({ imageUris: [...state.imageUris, uri] })),

  removeImageUri: (uri) =>
    set((state) => ({
      imageUris: state.imageUris.filter((u) => u !== uri),
    })),

  setStoragePaths: (paths) => set({ storagePaths: paths }),

  setAnalyzedItems: (items) => set({ analyzedItems: items }),

  updateItem: (index, item) =>
    set((state) => ({
      analyzedItems: state.analyzedItems.map((existing, i) =>
        i === index ? item : existing
      ),
    })),

  removeItem: (index) =>
    set((state) => ({
      analyzedItems: state.analyzedItems.filter((_, i) => i !== index),
    })),

  setPickupDetails: (details) => set({ pickupDetails: details }),

  setPriceBreakdown: (breakdown) => set({ priceBreakdown: breakdown }),

  reset: () => set(initialState),
}));

