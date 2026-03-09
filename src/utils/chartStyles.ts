/**
 * Shared Recharts chart styling constants.
 *
 * Centralises the repeated font family, tick sizes, tooltip styles, and legend
 * styles used across IncomeSweepChart, BenefitStackChart, WaterfallChart, and
 * BreakEvenDotPlot. Individual charts can spread these and override as needed.
 */

import type { CSSProperties } from 'react'
import { FONT, NEUTRAL } from '../tokens.ts'

export const CHART_FONT_FAMILY = FONT.mono

/** Default tick style for XAxis / YAxis `tick` prop (spread + override `fill`). */
export const CHART_TICK_STYLE = {
  fontSize: 11,
  fontFamily: CHART_FONT_FAMILY,
} as const

/** Default axis label style (spread + override `fill`, `value`, `position`, etc.). */
export const CHART_AXIS_LABEL_STYLE = {
  fontSize: 10,
  fontFamily: CHART_FONT_FAMILY,
} as const

/** Default Tooltip `contentStyle`. */
export const CHART_TOOLTIP_STYLE: CSSProperties = {
  fontFamily: CHART_FONT_FAMILY,
  fontSize: 12,
  border: `1px solid ${NEUTRAL[300]}`,
  borderRadius: 2,
}

/** Default Legend `wrapperStyle`. */
export const CHART_LEGEND_STYLE: CSSProperties = {
  fontSize: 11,
  fontFamily: CHART_FONT_FAMILY,
}
