# Agent E — Stream 7: API Layer & Data Hooks

## Context
You are working on "Avfall Henting", a waste pickup ordering app built with Expo + Tamagui + Supabase. Streams 1 (Foundation) and 2 (Supabase Backend) are complete. Read `PROJECT.md` for full architecture overview.

## Your Mission
Create the API client layer and TanStack Query (React Query) hooks in `lib/api/`. These hooks are the bridge between UI screens and Supabase — every data operation goes through them.

## Rules
- Use 2 spaces for indentation
- Never use `any` as a type
- All types from `lib/types.ts` — import from there, do NOT redefine
- Use `@tanstack/react-query` for all server data (queries & mutations)
- Use the Supabase client from `lib/supabase.ts`
- Norwegian comments where helpful
- Run `npx tsc --noEmit` before marking done

## Existing Infrastructure
```
lib/supabase.ts              # Supabase client — `supabase` export
lib/types.ts                 # All shared interfaces
lib/stores/order-draft.ts    # Zustand store for order wizard state
lib/providers/query-provider.tsx  # QueryClientProvider already wraps the app
```

## Tasks

### 1. Create `lib/api/orders.ts` — Order API functions

Raw API functions (no hooks — pure async functions):

```typescript
// Fetch all orders for current user (with items & images)
export async function fetchOrders(): Promise<Order[]>

// Fetch single order by ID (with items & images)
export async function fetchOrder(id: string): Promise<Order>

// Create a new order (calls the create-order Edge Function)
export async function createOrder(draft: {
  items: AnalyzedItem[];
  pickup_details: PickupDetails;
  image_storage_paths: string[];
  price_breakdown: PriceBreakdown;
}): Promise<Order>

// Cancel an order
export async function cancelOrder(id: string): Promise<void>
```

Implementation notes:
- `fetchOrders`: Query `orders` table with `order by created_at desc`, then for each order fetch `order_items` and `order_images`
- OR use a single query with Supabase's `select('*, items:order_items(*), images:order_images(*)')` syntax
- `createOrder`: Call `supabase.functions.invoke('create-order', { body: ... })`
- `cancelOrder`: Update order status to 'cancelled' via `supabase.from('orders').update(...)`

### 2. Create `lib/api/images.ts` — Image upload functions

```typescript
// Upload images to Supabase Storage
export async function uploadImages(
  userId: string,
  imageUris: string[]
): Promise<string[]>  // Returns storage paths

// Get signed URLs for viewing images
export async function getImageUrls(
  storagePaths: string[]
): Promise<string[]>
```

Implementation notes:
- Upload to bucket `order-images` at path `{userId}/{timestamp}-{index}.jpg`
- Convert local URIs to blobs/files for upload
- Use `supabase.storage.from('order-images').upload(path, file)`
- For signed URLs: `supabase.storage.from('order-images').createSignedUrl(path, 3600)`

### 3. Create `lib/api/analysis.ts` — AI analysis functions

```typescript
// Analyze images via Edge Function
export async function analyzeImages(
  imageUrls: string[]
): Promise<AnalysisResult>
```

Implementation:
- Call `supabase.functions.invoke('analyze-images', { body: { image_urls: imageUrls } })`
- Parse response into `AnalysisResult` type
- Handle errors gracefully

### 4. Create `lib/api/pricing.ts` — Price calculation functions

```typescript
// Calculate price via Edge Function
export async function calculatePrice(
  request: PriceRequest
): Promise<PriceBreakdown>
```

Implementation:
- Call `supabase.functions.invoke('calculate-price', { body: request })`
- Parse response into `PriceBreakdown` type

### 5. Create `lib/api/profile.ts` — Profile functions

```typescript
// Fetch current user's profile
export async function fetchProfile(userId: string): Promise<Profile>

// Update profile
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'phone'>>
): Promise<Profile>
```

### 6. Create `lib/api/hooks.ts` — TanStack Query hooks

All hooks in one file, importing from the API functions above:

```typescript
// Orders
export function useOrders()           // useQuery — fetch all user orders
export function useOrder(id: string)  // useQuery — fetch single order
export function useCreateOrder()      // useMutation — create order, invalidate orders
export function useCancelOrder()      // useMutation — cancel, invalidate orders

// Images
export function useUploadImages()     // useMutation — upload to storage

// Analysis
export function useAnalyzeImages()    // useMutation — call AI analysis

// Pricing
export function useCalculatePrice()   // useMutation — get price breakdown

// Profile
export function useProfile(userId: string)  // useQuery — fetch profile
export function useUpdateProfile()          // useMutation — update profile
```

Each hook should:
- Use proper query keys: `['orders']`, `['orders', id]`, `['profile', userId]`
- Mutations should `invalidateQueries` on success
- Include `enabled` option where needed (e.g., `useOrder` only when `id` is truthy)
- Return proper loading/error states

### 7. Create `lib/api/index.ts` — Barrel export

Re-export everything for clean imports:
```typescript
export * from './hooks';
export * from './orders';
export * from './images';
export * from './analysis';
export * from './pricing';
export * from './profile';
```

## Files You Own
```
lib/api/orders.ts      (create)
lib/api/images.ts      (create)
lib/api/analysis.ts    (create)
lib/api/pricing.ts     (create)
lib/api/profile.ts     (create)
lib/api/hooks.ts       (create)
lib/api/index.ts       (create)
```

## Files to READ (do not modify)
```
lib/types.ts
lib/supabase.ts
lib/stores/order-draft.ts
lib/providers/query-provider.tsx
PROJECT.md
prompts/agent-b-supabase-backend.md  # Edge Function contracts
```

## Do NOT Touch
- `app/` directory
- `components/` directory
- `config/` directory
- `supabase/` directory
- `lib/stores/`, `lib/providers/`

