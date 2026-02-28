import {
    tokens as defaultTokens,
    themes as tamaguiThemes,
} from "@tamagui/config/v3";
import { createInterFont } from "@tamagui/font-inter";
import { createMedia } from "@tamagui/react-native-media-driver";
import { shorthands } from "@tamagui/shorthands";
import { createTamagui, createTokens, isWeb } from "tamagui";

// On web, CSS @font-face declarations use font-family: 'Inter' with different
// font-weight values. On native, each weight is a separate font registered
// under a unique name (e.g. InterBold). The face config must match.
const webFontName = "Inter";

const headingFont = createInterFont({
  size: {
    1: 13,
    2: 14,
    3: 16,
    4: 18,
    5: 22,
    6: 28,
    7: 34,
    8: 42,
  },
  weight: {
    4: "600",
    5: "600",
    6: "700",
    7: "700",
    8: "800",
  },
  face: {
    600: { normal: isWeb ? webFontName : "InterSemiBold" },
    700: { normal: isWeb ? webFontName : "InterBold" },
    800: { normal: isWeb ? webFontName : "InterExtraBold" },
  },
});

const bodyFont = createInterFont({
  size: {
    1: 13,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
  },
  weight: {
    1: "400",
    2: "500",
    3: "600",
  },
  face: {
    400: { normal: isWeb ? webFontName : "Inter" },
    500: { normal: isWeb ? webFontName : "InterMedium" },
    600: { normal: isWeb ? webFontName : "InterSemiBold" },
  },
});

const tokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    // Brand colors
    primary: "#2D7D46",
    primaryLight: "#E8F5E9",
    primaryDark: "#1B5E2E",
    secondary: "#1A1A2E",
    secondaryLight: "#2D2D44",
    accent: "#F5A623",
    accentLight: "#FFF3E0",

    // Semantic colors
    background: "#F8F9FA",
    surface: "#FFFFFF",
    surfaceHover: "#F0F0F0",
    textPrimary: "#1A1A2E",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    borderFocus: "#2D7D46",

    // Status colors
    error: "#E53935",
    errorLight: "#FFEBEE",
    success: "#43A047",
    successLight: "#E8F5E9",
    warning: "#F5A623",
    warningLight: "#FFF3E0",
    info: "#1E88E5",
    infoLight: "#E3F2FD",
  },
  space: {
    ...defaultTokens.space,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
    "4xl": 64,
  },
  radius: {
    ...defaultTokens.radius,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
});

const media = createMedia({
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: "none" },
  pointerCoarse: { pointer: "coarse" },
});

export const config = createTamagui({
  defaultFont: "body",
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    ...tamaguiThemes,
    light: {
      ...tamaguiThemes.light,
      background: tokens.color.background,
      color: tokens.color.textPrimary,
    },
    dark: {
      ...tamaguiThemes.dark,
    },
  },
  media,
  shorthands,
  settings: {
    allowedStyleValues: "somewhat-strict-web",
    autocomplete: "series",
  },
});

export default config;

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
