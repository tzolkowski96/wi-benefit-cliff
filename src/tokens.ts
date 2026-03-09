/**
 * Design tokens — single source of truth for colors, fonts, and spacing.
 *
 * Eliminates magic hex values scattered across components. Import from here
 * instead of hardcoding color strings.
 */

// ---------------------------------------------------------------------------
// Semantic colors
// ---------------------------------------------------------------------------

export const COLOR = {
  /** Near-black text, header background, primary foreground */
  text: '#1a1a1a',
  /** Warm off-white page background */
  bg: '#F8F6F3',
  /** Amber accent — active toggles, post-raise markers, caution */
  accent: '#E8A838',
  /** Dark green — positive outcomes, safe zones, keep status */
  positive: '#2D6A4F',
  /** Dark red — losses, warnings, lost status */
  negative: '#9B2226',
} as const

// ---------------------------------------------------------------------------
// Neutral scale
// ---------------------------------------------------------------------------

export const NEUTRAL = {
  50: '#f5f5f5',
  100: '#f0f0f0',
  200: '#eee',
  300: '#ddd',
  400: '#ccc',
  500: '#999',
  600: '#767676',
  650: '#666',
  700: '#595959',
  800: '#555',
  900: '#333',
  950: '#aaa',
} as const

// ---------------------------------------------------------------------------
// Program-specific colors (from programs.ts, repeated here for UI usage)
// ---------------------------------------------------------------------------

export const PROGRAM_COLOR = {
  foodshare: '#2D6A4F',
  badgercare_adult: '#1B4965',
  badgercare_children: '#3D5A80',
  wisconsin_shares: '#774936',
  wheap: '#9B2226',
  school_meals_free: '#5F0F40',
  school_meals_reduced: '#823038',
} as const

// ---------------------------------------------------------------------------
// Alert / banner backgrounds
// ---------------------------------------------------------------------------

export const ALERT = {
  positiveBg: '#EDF6ED',
  negativeBg: '#FDE8E8',
  warningBg: '#FFF8E1',
  warningBorder: '#E0C97B',
  negativeBorder: '#E5ADAD',
  warningText: '#8B6914',
} as const

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

export const FONT = {
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const
