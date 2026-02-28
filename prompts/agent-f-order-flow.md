# Agent F — Stream 5: Order Flow

## Context
You are working on "Avfall Henting", a waste pickup ordering app built with Expo + Tamagui + Supabase. Streams 1 (Foundation), 2 (Backend), and 7 (API Hooks) are complete. Read `PROJECT.md` for full architecture overview.

## Your Mission
Implement the 6-step order wizard UI. All screens exist as placeholders in `app/order/` — you replace them with full implementations. The order draft state lives in `lib/stores/order-draft.ts` (Zustand) and API calls use hooks from `lib/api/hooks.ts`.

## Rules
- Use 2 spaces for indentation
- Never use `any` as a type
- ALL UI must use Tamagui components (`YStack`, `XStack`, `Text`, `H2`, etc.)
- Use shared UI from `@/components/ui` (Button, Card, Input, StepIndicator, Badge)
- Norwegian (Bokmål) for all user-facing text
- Import types from `lib/types.ts`, hooks from `lib/api/hooks.ts`
- Use `useOrderDraftStore` from `lib/stores/order-draft.ts` for wizard state
- Run `npx tsc --noEmit` before marking done

## Flow Overview
```
Upload → Analysis → Pickup Details → Price → Checkout → Confirmation
  (1)       (2)          (3)          (4)      (5)         (6)
```

## Tasks

### 1. Upload Screen — `app/order/upload.tsx` (Step 1)
**Purpose:** User selects/takes photos of their waste.

**UI:**
- `StepIndicator currentStep={1}` at top (already exists)
- "Last opp bilder av avfallet" heading
- Photo grid showing selected images (thumbnails)
- "Ta bilde" button → open camera via `expo-image-picker` (`launchCameraAsync`)
- "Velg fra album" button → open gallery via `expo-image-picker` (`launchImageLibraryAsync`)
- Each image thumbnail has a remove (X) button
- Min 1 image, max 10 images
- "Neste" button → navigates to `/order/analysis` (disabled until ≥1 image)
- Image options: `quality: 0.7`, `maxWidth: 1200`, `maxHeight: 1200`

**State:** Use `useOrderDraftStore` → `addImageUri`, `removeImageUri`, `imageUris`

### 2. Analysis Screen — `app/order/analysis.tsx` (Step 2)
**Purpose:** Show AI analysis results, allow user to edit/remove items.

**UI:**
- `StepIndicator currentStep={2}`
- On mount: Upload images (via `useUploadImages`) → get storage paths → get signed URLs → call `useAnalyzeImages`
- Loading state: Spinner + "Analyserer bildene dine..." text
- Results: List of `AnalyzedItem` cards, each showing:
  - Item name (editable)
  - Category badge (with Norwegian label from `WASTE_CATEGORY_LABELS`)
  - Estimated weight: `{kg} kg` (editable number input)
  - Remove button (X) per item
- "Legg til gjenstand" button to manually add an item
- "Neste" button → `/order/pickup-details` (disabled until ≥1 item)
- Error state: "Kunne ikke analysere bildene. Prøv igjen." + retry button

**State:** `useOrderDraftStore` → `setStoragePaths`, `setAnalyzedItems`, `updateItem`, `removeItem`

### 3. Pickup Details Screen — `app/order/pickup-details.tsx` (Step 3)
**Purpose:** Collect pickup location and logistics info.

**UI:**
- `StepIndicator currentStep={3}`
- Address input (text field — `Input` component). For MVP, a simple text input is fine. Google Places autocomplete can be added later.
- Floor number: Numeric input or stepper (0-20)
- "Har heis?" toggle/switch (boolean)
- "Parkering tilgjengelig?" toggle/switch (boolean)
- Carry distance: Segmented control or radio group (`CARRY_DISTANCES` from types)
  - Labels: "0-10m", "10-25m", "25-50m", "50m+"
- Pickup date: Date picker (minimum: tomorrow)
- Time window: Radio group (`TIME_WINDOWS` from types)
  - Labels: "08:00-12:00", "12:00-16:00", "16:00-20:00"
- Notes: Multiline text area (optional)
- "Neste" button → `/order/price` (disabled until address + date filled)

**State:** `useOrderDraftStore` → `setPickupDetails`

### 4. Price Screen — `app/order/price.tsx` (Step 4)
**Purpose:** Show calculated price breakdown before payment.

**UI:**
- `StepIndicator currentStep={4}`
- On mount: Call `useCalculatePrice` with items + pickup details
- Loading state: "Beregner pris..."
- Price breakdown card:
  - Section "Gjenstander" — list each item with price
  - Section "Tillegg" — list surcharges (if any)
  - Divider
  - Subtotal
  - Surcharges total
  - **Total** (bold, large)
- "Gå til betaling" button → `/order/checkout`
- "Tilbake" to edit details

**State:** `useOrderDraftStore` → `setPriceBreakdown`

### 5. Checkout Screen — `app/order/checkout.tsx` (Step 5)
**Purpose:** Review order summary and confirm/pay.

**UI:**
- `StepIndicator currentStep={5}`
- Order summary: items count, pickup address, date/time, total price
- For MVP (payment TBD): Show a "Bekreft bestilling" button that creates the order
- Call `useCreateOrder` mutation on confirm
- Loading state: "Oppretter bestilling..."
- On success: Navigate to `/order/confirmation`
- On error: Show error + retry

**State:** Read everything from `useOrderDraftStore`, then `reset()` after success

### 6. Confirmation Screen — `app/order/confirmation.tsx` (Step 6)
**Purpose:** Success screen after order is placed.

**UI:** (Already mostly implemented — enhance it)
- `StepIndicator currentStep={6}`
- Green checkmark animation/icon
- "Bestilling bekreftet!" heading
- Order ID display
- "Du vil motta bekreftelse på e-post" message
- Pickup summary (address, date, time)
- "Se mine bestillinger" button → `/(tabs)/orders`
- "Tilbake til forsiden" button → `/(tabs)`
- Call `useOrderDraftStore().reset()` on mount

## Files You Own
```
app/order/upload.tsx          (implement)
app/order/analysis.tsx        (implement)
app/order/pickup-details.tsx  (implement)
app/order/price.tsx           (implement)
app/order/checkout.tsx        (implement)
app/order/confirmation.tsx    (enhance)
app/order/_layout.tsx         (review, minor edits OK)
```

## Files to READ (do not modify)
```
lib/types.ts                  # All data interfaces
lib/stores/order-draft.ts     # Zustand store — your primary state manager
lib/api/hooks.ts              # TanStack Query hooks — your API layer
components/ui/                # Button, Card, Input, StepIndicator, Badge
config/tamagui.config.ts      # Design tokens
lib/theme.ts                  # Color constants
PROJECT.md
```

## Do NOT Touch
- `supabase/` directory
- `app/(auth)/` directory
- `app/(tabs)/` directory
- `lib/api/` directory (Agent E owns this)
- `lib/stores/auth.ts`
- `config/tamagui.config.ts`
- `components/ui/` (shared components)

