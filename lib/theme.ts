// Centralized theme constants for use outside Tamagui components
// (e.g., in React Navigation, StatusBar, etc.)

export const colors = {
  primary: '#2D7D46',
  primaryLight: '#E8F5E9',
  primaryDark: '#1B5E2E',
  secondary: '#1A1A2E',
  secondaryLight: '#2D2D44',
  accent: '#F5A623',
  accentLight: '#FFF3E0',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#E53935',
  success: '#43A047',
  warning: '#F5A623',
  info: '#1E88E5',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

