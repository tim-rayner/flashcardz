/**
 * Single source of truth for visual tokens. Values (palette, type scale,
 * spacing rhythm, radii, shadows) come from a color-psychology and UX-
 * psychology pass aimed at one emotional target: the user should feel like
 * they're genuinely learning and making a difference to their own intellect
 * - calm/confident as the base rhythm (generous whitespace, soft shadows,
 * mid-size radii), with energy injected locally through the warm accent
 * color and micro-motion rather than through density or saturation
 * everywhere. See the topic-list / empty-state screens for how these tokens
 * are meant to be composed.
 */

export const colors = {
  primary: '#1EAA6B',
  primaryDark: '#158253',
  secondaryAccent: '#FF8A3D',
  success: '#2FBF71',
  warning: '#E5484D',
  info: '#3B82C4',
  neutral: {
    0: '#FFFFFF',
    50: '#F7F8F6',
    100: '#EDEFEA',
    200: '#DBDED6',
    300: '#B7BCB0',
    400: '#8B9186',
    600: '#565C52',
    800: '#2B2F27',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  card: 16,
  button: 28,
  sheet: 24,
  pill: 999,
} as const;

interface TypeStyle {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
}

export const typography = {
  display: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h1: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  title: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyEmph: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 20 },
} satisfies Record<string, TypeStyle>;

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const shadow = {
  card: {
    shadowColor: colors.neutral[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: colors.secondaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
} satisfies Record<string, ShadowStyle>;

export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: typeof shadow;
}

export const theme: Theme = { colors, spacing, radius, typography, shadow };
