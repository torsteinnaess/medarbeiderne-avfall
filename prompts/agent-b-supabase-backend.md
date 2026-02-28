# Agent B — Stream 2: Supabase Backend

## Context
You are working on "Avfall Henting", a waste pickup ordering app built with Expo + Tamagui + Supabase. Stream 1 (Foundation) is complete. Read `PROJECT.md` for full architecture overview.

## Your Mission
Implement the Supabase backend: finalize database schema, add RLS policies, configure storage, and create 3 Edge Functions. You own everything in `supabase/`.

## Rules
- Use 2 spaces for indentation
- Never use `any` as a type
- All TypeScript types are defined in `lib/types.ts` — import from there, do NOT redefine
- Norwegian comments where appropriate
- Run `npx tsc --noEmit` before marking done

## Tasks

### 1. Review & finalize database migrations
Files exist at `supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_pricing.sql`.
- Review the existing schema and verify it matches `lib/types.ts` interfaces
- Ensure all constraints, indexes, and triggers are correct
- The `handle_new_user()` trigger auto-creates profiles on signup

### 2. Row Level Security (RLS)
File: `supabase/migrations/002_rls_policies.sql`
- Enable RLS on ALL tables
- `profiles`: Users can read/update their own profile only
- `orders`: Users can CRUD their own orders only
- `order_items`: Users can read items for their own orders
- `order_images`: Users can read/insert images for their own orders
- `pricing_config` & `surcharge_config`: Anyone can read (public pricing), only service_role can write
- Use `auth.uid()` for user identification

### 3. Storage bucket
Create setup instructions or migration for:
- Bucket name: `order-images`
- Upload policy: Authenticated users can upload to `{user_id}/{order_id}/` path
- Read policy: Users can read their own images
- Max file size: 10MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### 4. Edge Function: `analyze-images`
Path: `supabase/functions/analyze-images/index.ts`

**Input:**
```json
{ "image_urls": ["https://...signed-url-1", "https://...signed-url-2"] }
```

**Logic:**
1. Validate input (1-10 images)
2. Call OpenAI GPT-4o Vision API with all images
3. Prompt: "Analyze these images of waste/trash. For each distinct item, return: name (Norwegian), category (one of: general, furniture, electronics, hazardous, construction, garden, textiles, appliances), estimated_weight_kg (number). Return JSON array."
4. Parse response into `AnalyzedItem[]` (from `lib/types.ts`)
5. Validate categories against `WASTE_CATEGORIES`

**Output:** `{ items: AnalyzedItem[] }`

**Environment:** `OPENAI_API_KEY` (Supabase secret, NOT the expo public one)

### 5. Edge Function: `calculate-price`
Path: `supabase/functions/calculate-price/index.ts`

**Input:** `PriceRequest` (from `lib/types.ts`)
```json
{
  "items": [{ "name": "Sofa", "category": "furniture", "estimated_weight_kg": 40 }],
  "floor": 3,
  "has_elevator": false,
  "has_parking": true,
  "carry_distance": "10-25m"
}
```

**Logic:**
1. For each item: `max(weight * base_price_per_kg, minimum_price)` — read from `pricing_config` table
2. Sum item totals → subtotal
3. Calculate surcharges from `surcharge_config` table:
   - Floor surcharge if `has_elevator === false && floor >= 2`
   - Carry distance surcharge if > 10m
   - No parking surcharge if `has_parking === false`
4. Total = subtotal + surcharges

**Output:** `PriceBreakdown` (from `lib/types.ts`)

### 6. Edge Function: `create-order`
Path: `supabase/functions/create-order/index.ts`

**Input:**
```json
{
  "items": [AnalyzedItem],
  "pickup_details": PickupDetails,
  "image_storage_paths": ["user-id/path/image1.jpg"],
  "price_breakdown": PriceBreakdown
}
```

**Logic:**
1. Authenticate user from JWT (`req.headers.authorization`)
2. Create Supabase client with user's JWT
3. Insert into `orders` table
4. Insert into `order_items` (one per item, with calculated unit_price and item_total)
5. Insert into `order_images` (one per storage path)
6. Return created order with items and images

**Output:** `Order` (with nested `items` and `images`)

## Files You Own
```
supabase/migrations/001_initial_schema.sql  (review/edit)
supabase/migrations/002_rls_policies.sql    (implement)
supabase/migrations/003_seed_pricing.sql    (review/edit)
supabase/functions/analyze-images/index.ts  (create)
supabase/functions/calculate-price/index.ts (create)
supabase/functions/create-order/index.ts    (create)
```

## Files to READ (do not modify)
```
lib/types.ts          # All shared interfaces
PROJECT.md            # Architecture overview
```

## Do NOT Touch
- `app/` directory (any screen files)
- `components/` directory
- `config/` directory
- `lib/stores/`, `lib/providers/`, `lib/supabase.ts`

