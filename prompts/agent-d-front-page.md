# Agent D — Stream 4: Front Page

## Context
You are working on "Avfall Henting", a waste pickup ordering app built with Expo + Tamagui + Supabase. Stream 1 (Foundation) is complete. Read `PROJECT.md` for full architecture overview.

## Your Mission
Take the existing front page (`app/(tabs)/index.tsx`) from a functional placeholder to a polished, production-quality landing page. This is the first thing users see — it must be visually compelling, clearly explain the service, and drive users to start an order.

## Rules
- Use 2 spaces for indentation
- Never use `any` as a type
- ALL UI must use Tamagui components (`YStack`, `XStack`, `Text`, `H1`, `H2`, `H3`, etc.)
- Use shared components from `@/components/ui` (Button, Card, Badge)
- Colors from `config/tamagui.config.ts` tokens (e.g., `$primary`, `$primaryLight`, `$textPrimary`)
- For non-Tamagui contexts, use `lib/theme.ts` colors
- Norwegian (Bokmål) for all text
- Must look great on both mobile (small screen) and web (wide screen) — use Tamagui `$media` breakpoints
- Run `npx tsc --noEmit` before marking done

## Current State
The file `app/(tabs)/index.tsx` already has a working layout with:
- Hero section with icon, headline, CTA
- "Slik fungerer det" (How it works) — 3 steps
- "Hva vi henter" (What we pick up) — category grid
- "Priser" (Pricing) — teaser card
- Trust signals (stats)
- Bottom CTA
- Footer

## Tasks

### 1. Hero Section Enhancement
- Make the hero more impactful — larger visual presence
- Consider a gradient background (use `expo-linear-gradient`, already installed)
- Headline: "Vi henter søppelet ditt" (keep or improve)
- Subtext should clearly communicate the value proposition
- Primary CTA: "Bestill henting" → navigates to `/order/upload`
- Secondary subtle CTA: "Se hvordan det fungerer" → scroll to how-it-works section
- The hero should feel premium and trustworthy

### 2. How It Works Section
- 3 steps with numbered circles or connecting visual
- Step 1: 📸 "Ta bilde" — "Fotografer avfallet med mobilen"
- Step 2: 💰 "Få pris" — "AI analyserer og beregner prisen"
- Step 3: 🚛 "Vi henter" — "Vi kommer til deg og henter alt"
- Consider a visual flow/timeline connecting the steps
- Each step should have an icon, title, and description

### 3. Categories Section
- Grid of waste categories (from `WASTE_CATEGORY_LABELS` in `lib/types.ts`)
- Each category: icon + Norwegian label
- Use `Ionicons` for icons (already imported)
- Responsive: 2 columns on mobile, 4 on wider screens
- Consider subtle hover/press effects

### 4. Pricing Teaser
- "Transparent prising" heading
- Show a few example prices from the pricing model:
  - Hageavfall fra 249 kr
  - Møbler fra 399 kr
  - Elektronikk fra 499 kr
- "Endelig pris beregnes av AI basert på bilder" note
- CTA: "Se alle priser" or just link to the order flow

### 5. Trust Signals
- Stats: "500+ hentinger", "4.8 vurdering", "24t levering"
- Consider adding customer quote/testimonial (placeholder)
- "Miljøvennlig" badge — we recycle/sort properly
- These should build confidence

### 6. Responsive Design
- Mobile: Single column, full-width sections, comfortable touch targets
- Tablet/Web: Max-width container (e.g., 800px), centered content
- Use Tamagui's `$media` queries: `$xs`, `$sm`, `$md`, `$lg`
- Example: `$md={{ flexDirection: 'row' }}` for side-by-side on wider screens

### 7. Polish & Micro-interactions
- Smooth scroll behavior
- Consistent spacing using Tamagui tokens ($sm, $md, $lg, $xl, $2xl)
- Proper font hierarchy (H1 for hero, H2 for section titles, Text for body)
- Accessibility: proper semantic structure

## Files You Own
```
app/(tabs)/index.tsx         # Main implementation
```

You may also create helper components if needed, but place them in the same file or in a `components/home/` directory.

## Files to READ (do not modify)
```
config/tamagui.config.ts     # Design tokens, themes, media queries
lib/types.ts                 # WasteCategory, WASTE_CATEGORY_LABELS
lib/theme.ts                 # Color constants
components/ui/Button.tsx     # Button component API
components/ui/Card.tsx       # Card component API
components/ui/Badge.tsx      # Badge component API
app/(tabs)/_layout.tsx       # Tab bar configuration
PROJECT.md                   # Architecture overview
```

## Do NOT Touch
- `supabase/` directory (Agent B)
- `app/(auth)/` directory (Agent C)
- `app/order/` directory
- `lib/stores/`, `lib/providers/`
- `config/tamagui.config.ts`
- `lib/types.ts`
- `components/ui/` (shared components)

