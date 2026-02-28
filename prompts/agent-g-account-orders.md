# Agent G — Stream 6: My Account & Orders

## Context
You are working on "Avfall Henting", a waste pickup ordering app built with Expo + Tamagui + Supabase. Streams 1 (Foundation), 2 (Backend), 3 (Auth), and 7 (API Hooks) are complete. Read `PROJECT.md` for full architecture overview.

## Your Mission
Implement the account management and order history screens. The account screen has a basic placeholder with sign-out — you expand it with profile editing. The orders tab and order detail screen are placeholders — you build them fully.

## Rules
- Use 2 spaces for indentation
- Never use `any` as a type
- ALL UI must use Tamagui components (`YStack`, `XStack`, `Text`, `H2`, etc.)
- Use shared UI from `@/components/ui` (Button, Card, Input, Badge/OrderStatusBadge)
- Norwegian (Bokmål) for all user-facing text
- Import types from `lib/types.ts`, hooks from `lib/api/hooks.ts`
- Run `npx tsc --noEmit` before marking done

## Existing State
- `lib/stores/auth.ts` exports `useAuthStore` with: `user`, `profile`, `signOut`
- `lib/api/hooks.ts` exports: `useOrders()`, `useOrder(id)`, `useCancelOrder()`, `useProfile(userId)`, `useUpdateProfile()`
- `components/ui/Badge.tsx` exports `OrderStatusBadge` which shows status with color coding
- `ORDER_STATUS_LABELS` in `lib/types.ts` maps status to Norwegian text

## Tasks

### 1. Orders List Screen — `app/(tabs)/orders.tsx`
**Purpose:** Show all user's orders, sorted by most recent.

**UI:**
- If not logged in: Show login prompt (icon + "Logg inn for å se bestillinger" + login button)
- If logged in but no orders: Show empty state (icon + "Ingen bestillinger ennå" + CTA to order)
- If logged in with orders: Scrollable list of order cards
  - Each card shows:
    - Order date (formatted: "24. feb 2026")
    - Status badge (`OrderStatusBadge` component)
    - Pickup address (truncated)
    - Item count: "3 gjenstander"
    - Total price: "kr 1 249,-"
    - Tap → navigate to `/orders/{id}`
- Pull-to-refresh support
- Loading skeleton/spinner while fetching

**Data:** Use `useOrders()` hook from `lib/api/hooks.ts`

### 2. Order Detail Screen — `app/orders/[id].tsx`
**Purpose:** Full detail view of a single order.

**UI:**
- Header: "Ordre #{id short}" + status badge
- Section "Gjenstander" (Items):
  - List each `OrderItem`: name, category label, weight, price
  - Use `WASTE_CATEGORY_LABELS` for Norwegian category names
- Section "Hentedetaljer" (Pickup Details):
  - Address
  - Floor + elevator info
  - Parking + carry distance
  - Date + time window
  - Notes (if any)
- Section "Pris" (Price):
  - Subtotal
  - Surcharges
  - **Total** (bold)
- Section "Bilder" (Images):
  - Grid of uploaded images (use signed URLs from storage)
  - Tap to view full-size (optional for MVP — can use a simple modal or link)
- If status is "pending": Show "Kanseller bestilling" button
  - Confirm dialog: "Er du sikker?"
  - Call `useCancelOrder()` mutation
  - On success: Refresh order, show updated status
- Timeline/status tracker (optional — nice to have):
  - Visual dots/line showing: Venter → Bekreftet → Planlagt → Pågår → Fullført

**Data:** Use `useOrder(id)` hook

### 3. Account Screen Enhancement — `app/(tabs)/account.tsx`
**Purpose:** Expand the existing account screen with profile editing.

The screen already has:
- Not-logged-in state (login prompt) ✅
- User avatar icon, name, email ✅
- Sign out button ✅

**Add:**
- Editable profile fields:
  - Name (text input, pre-filled from profile)
  - Phone (phone input, pre-filled)
  - Email (read-only, shown as disabled/grey)
- "Lagre endringer" (Save) button — only enabled when fields are dirty
  - Call `useUpdateProfile()` mutation
  - Show success toast/message: "Profil oppdatert"
  - Show error if save fails
- Section divider between profile and actions
- Quick stats (optional):
  - Total orders count
  - Member since date (from profile.created_at)
- Settings section (for future):
  - "Varslinger" (Notifications) — placeholder toggle
  - "Språk" (Language) — show "Norsk" (read-only for now)
- App version at the bottom: "Avfall Henting v1.0.0"

### 4. Date Formatting Utility
Create a small helper (can be inline or a utility):
```typescript
// Format: "24. feb 2026"
function formatDate(dateString: string): string

// Format: "24. feb 2026, 08:00-12:00"
function formatDateWithTime(dateString: string, timeWindow: TimeWindow): string

// Format: "kr 1 249,-"
function formatPrice(amount: number): string
```

If `lib/utils/` doesn't have a formatting file, create `lib/utils/format.ts`.

## Files You Own
```
app/(tabs)/orders.tsx     (implement — replace placeholder)
app/(tabs)/account.tsx    (enhance — keep existing, add profile editing)
app/orders/[id].tsx       (implement — replace placeholder)
lib/utils/format.ts       (create — date/price formatting)
```

## Files to READ (do not modify)
```
lib/types.ts                # Order, OrderItem, Profile, OrderStatus, STATUS_LABELS
lib/stores/auth.ts          # useAuthStore — user, profile, signOut
lib/api/hooks.ts            # useOrders, useOrder, useCancelOrder, useProfile, useUpdateProfile
components/ui/Badge.tsx     # OrderStatusBadge component
components/ui/Button.tsx    # Button component
components/ui/Card.tsx      # Card component
components/ui/Input.tsx     # Input, TextArea, FormField
config/tamagui.config.ts    # Design tokens
lib/theme.ts                # Color constants
PROJECT.md
```

## Do NOT Touch
- `supabase/` directory
- `app/(auth)/` directory (Agent C)
- `app/order/` directory (Agent F)
- `app/(tabs)/index.tsx` (Agent D)
- `lib/api/` directory (Agent E)
- `lib/stores/order-draft.ts`
- `config/tamagui.config.ts`
- `components/ui/` (shared components)

