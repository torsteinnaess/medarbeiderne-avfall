# Avfall Henting — MVP

Waste pickup ordering app. Users photograph trash → AI estimates weight & category → price calculated → pickup scheduled & paid.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Expo SDK 55 (React Native 0.83) + Expo Router |
| UI | Tamagui 2.x (`config/tamagui.config.ts`) |
| State | Zustand (order draft), TanStack Query (server data) |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| AI | OpenAI GPT-4o Vision API |
| Language | TypeScript strict, Norwegian (Bokmål) UI |
| Targets | Web, iOS, Android (universal codebase) |

## Project Structure

```
app/
├── _layout.tsx              # Root: TamaguiProvider + QueryProvider + AuthProvider
├── (tabs)/
│   ├── _layout.tsx          # Tab bar: Hjem, Bestillinger, Konto
│   ├── index.tsx            # Front page (hero, how-it-works, categories, pricing)
│   ├── orders.tsx           # Order list
│   └── account.tsx          # Profile & settings
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── order/
│   ├── _layout.tsx          # Step indicator wrapper
│   ├── upload.tsx           # Step 1: Upload photos
│   ├── analysis.tsx         # Step 2: AI results review
│   ├── pickup-details.tsx   # Step 3: Location & details
│   ├── price.tsx            # Step 4: Price summary
│   ├── checkout.tsx         # Step 5: Payment
│   └── confirmation.tsx     # Step 6: Done
├── orders/[id].tsx          # Order detail
└── +not-found.tsx

components/ui/               # Shared UI: Button, Card, Input, Badge, StepIndicator
config/tamagui.config.ts     # Design tokens, themes, fonts
lib/
├── types.ts                 # ALL shared TypeScript interfaces (Order, Item, etc.)
├── theme.ts                 # Color constants for non-Tamagui contexts
├── supabase.ts              # Supabase client
├── stores/
│   ├── order-draft.ts       # Zustand: multi-step order state
│   └── auth.ts              # Zustand: session + profile
├── providers/
│   ├── auth-provider.tsx    # Auth listener, auto-profile fetch
│   └── query-provider.tsx   # TanStack QueryClient
├── api/                     # API call functions (to be implemented)
└── utils/                   # Helpers (to be implemented)

supabase/
├── migrations/
│   ├── 001_initial_schema.sql    # Tables: profiles, orders, order_items, order_images, pricing_config, surcharge_config
│   ├── 002_rls_policies.sql      # Row Level Security
│   └── 003_seed_pricing.sql      # Pricing model seed data
└── functions/
    ├── analyze-images/      # Edge Function: OpenAI Vision → categorized items
    ├── calculate-price/     # Edge Function: pricing engine
    └── create-order/        # Edge Function: order creation
```

## Design System

- **Primary**: `#2D7D46` (green, eco-association)
- **Font**: Inter (heading: 600-800 weight, body: 400-600)
- **Spacing**: xs=4, sm=8, md=12, lg=16, xl=24, 2xl=32, 3xl=48
- **Radius**: sm=4, md=8, lg=12, xl=16, full=9999
- All components MUST use Tamagui primitives (`YStack`, `XStack`, `Text`, `H1`, etc.)
- Import shared components from `@/components/ui`

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for full schema. Key tables:
- `profiles` — extends Supabase Auth users (auto-created via trigger)
- `orders` — pickup orders with status, address, pricing
- `order_items` — AI-categorized waste items per order
- `order_images` — uploaded photos linked to orders
- `pricing_config` — per-category pricing (NOK/kg + minimum)
- `surcharge_config` — floor/elevator/parking/carry surcharges

## Pricing Model

| Category | Per kg | Minimum |
|---|---|---|
| Hageavfall | 6 kr | 249 kr |
| Tekstiler | 5 kr | 199 kr |
| Restavfall | 8 kr | 299 kr |
| Bygningsavfall | 10 kr | 449 kr |
| Møbler | 12 kr | 399 kr |
| Hvitevarer | 14 kr | 449 kr |
| Elektronikk | 15 kr | 499 kr |
| Farlig avfall | 25 kr | 699 kr |

Surcharges: floor without elevator (100-400 kr), carry distance (50-200 kr), no parking (150 kr).

## Key Interfaces

All types in `lib/types.ts`. Key exports: `Order`, `OrderItem`, `OrderImage`, `Profile`, `AnalyzedItem`, `AnalysisResult`, `PriceRequest`, `PriceBreakdown`, `OrderDraft`, `PickupDetails`, `WasteCategory`, `OrderStatus`, `CarryDistance`, `TimeWindow`.

## Auth

- Email/password + Apple/Google social sign-in
- Supabase Auth with session persistence (SecureStore on native, localStorage on web)
- Auto-profile creation via database trigger on signup

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_OPENAI_API_KEY=
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=
```

## Development Streams

| # | Stream | Status | Dependencies |
|---|---|---|---|
| 1 | Foundation & Config | ✅ Done | — |
| 2 | Supabase Backend | 🔲 Ready | Stream 1 |
| 3 | Auth Flow | 🔲 Ready | Stream 1 |
| 4 | Front Page | 🔲 Ready | Stream 1 |
| 5 | Order Flow | 🔲 Blocked | Stream 1+2 |
| 6 | My Account & Orders | 🔲 Blocked | Stream 1+2+3 |
| 7 | API Layer & Hooks | 🔲 Blocked | Stream 1+2 |

## Commands

```bash
npm start          # Start Expo dev server
npm run web        # Start web only
npx tsc --noEmit   # Type check
```

