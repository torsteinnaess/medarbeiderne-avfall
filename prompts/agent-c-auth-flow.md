# Agent C — Stream 3: Auth Flow

## Context
You are working on "Avfall Henting", a waste pickup ordering app built with Expo + Tamagui + Supabase. Stream 1 (Foundation) is complete. Read `PROJECT.md` for full architecture overview.

## Your Mission
Implement the complete authentication flow: login, register, social sign-in, and protected route logic. The auth infrastructure (Supabase client, AuthProvider, auth store) already exists — you're building the UI and connecting it.

## Rules
- Use 2 spaces for indentation
- Never use `any` as a type
- ALL UI must use Tamagui components (`YStack`, `XStack`, `Text`, `H1`, etc.) — see `config/tamagui.config.ts`
- Use shared UI components from `@/components/ui` (Button, Input, Card)
- Norwegian (Bokmål) for all user-facing text
- Import types from `lib/types.ts`
- Run `npx tsc --noEmit` before marking done

## Existing Infrastructure (READ these files first)
```
lib/supabase.ts              # Supabase client — use `supabase.auth.*` methods
lib/stores/auth.ts           # Zustand store: session, profile, loading, initialized
lib/providers/auth-provider.tsx  # Already wraps app — listens for auth changes, fetches profile
app/(auth)/_layout.tsx       # Auth layout — already scaffolded (placeholder)
app/(auth)/login.tsx         # Login screen — placeholder, needs implementation
app/(auth)/register.tsx      # Register screen — placeholder, needs implementation
components/ui/Button.tsx     # Shared button (variant: primary/secondary/outline/ghost, size: sm/md/lg)
components/ui/Input.tsx      # Shared input (label, error, placeholder props)
```

## Tasks

### 1. Auth Store Review
File: `lib/stores/auth.ts`
- Review existing store. It should have: `session`, `profile`, `loading`, `initialized`
- Add any missing actions: `signOut`, etc.
- Ensure it exports a `useAuthStore` hook

### 2. Login Screen
File: `app/(auth)/login.tsx`

**UI Layout:**
- App logo/icon at top (use Ionicons "leaf" in a green circle, matching home page)
- `H1`: "Logg inn"
- Email input (keyboard type: email-address, autocapitalize: none)
- Password input (secureTextEntry)
- Error message display (red text)
- "Logg inn" primary button (loading state while authenticating)
- "Glemt passord?" link (can be a placeholder/alert for MVP)
- Divider: "eller"
- Apple sign-in button (outline style)
- Google sign-in button (outline style)
- Bottom: "Har du ikke konto?" + "Registrer deg" link → navigate to register

**Logic:**
- Call `supabase.auth.signInWithPassword({ email, password })`
- On success: AuthProvider auto-detects session change, redirect happens automatically
- On error: Show error message (translate common errors to Norwegian)
- Validate: email not empty, password not empty

### 3. Register Screen
File: `app/(auth)/register.tsx`

**UI Layout:**
- `H1`: "Opprett konto"
- Name input
- Email input
- Phone input (optional, keyboard type: phone-pad)
- Password input (min 6 chars)
- Confirm password input
- Error message display
- "Opprett konto" primary button (loading state)
- Bottom: "Har du allerede konto?" + "Logg inn" link

**Logic:**
- Validate: passwords match, password >= 6 chars, email valid
- Call `supabase.auth.signUp({ email, password, options: { data: { name, phone } } })`
- The database trigger `handle_new_user()` auto-creates the profile
- On success: Show confirmation or auto-redirect
- On error: Display translated error message

### 4. Social Sign-in (Apple + Google)
- For MVP, implement as buttons that call `supabase.auth.signInWithOAuth({ provider: 'apple' | 'google' })`
- Handle the redirect flow for web (`redirectTo` option)
- For native, you may need `expo-auth-session` or `expo-web-browser` — use `supabase.auth.signInWithOAuth` with appropriate redirect
- If full native OAuth is too complex for MVP, show an alert: "Kommer snart" (Coming soon)

### 5. Auth Layout
File: `app/(auth)/_layout.tsx`
- Stack navigator with no header (or minimal header with back button)
- Clean background matching the app theme

### 6. Protected Routes
File: Update or create a hook/wrapper
- Check `useAuthStore` for `initialized` and `session`
- The order flow (`app/order/*`) should require authentication
- The front page and tabs should be accessible without auth
- When user tries to start an order without being logged in → redirect to login
- After login, redirect back to where they were going

### 7. Sign Out
- Add sign out functionality to the account screen (`app/(tabs)/account.tsx`)
- Call `supabase.auth.signOut()`
- Clear any local state
- Redirect to home

## Files You Own
```
app/(auth)/login.tsx         # Implement
app/(auth)/register.tsx      # Implement
app/(auth)/_layout.tsx       # Implement
lib/stores/auth.ts           # Review/extend
app/(tabs)/account.tsx       # Add sign out button
```

## Files to READ (do not modify)
```
lib/supabase.ts
lib/providers/auth-provider.tsx
lib/types.ts
config/tamagui.config.ts
lib/theme.ts
components/ui/Button.tsx
components/ui/Input.tsx
PROJECT.md
```

## Do NOT Touch
- `supabase/` directory (Agent B's territory)
- `app/(tabs)/index.tsx` (Agent D's territory)
- `app/order/` directory
- `config/tamagui.config.ts`
- `lib/types.ts`

