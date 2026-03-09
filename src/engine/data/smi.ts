/**
 * 2025 Wisconsin State Median Income (SMI) thresholds.
 * Used by Wisconsin Shares (85% SMI) and WHEAP (60% SMI).
 *
 * Source: Wisconsin DCF (Shares), Wisconsin Home Energy Assistance Program.
 */

/** 60% SMI — monthly limits by household size (WHEAP). */
export const SMI_60: Record<number, number> = {
  1: 3061,
  2: 4003,
  3: 4945,
  4: 5887,
  5: 6829,
  6: 7771,
  7: 8713,
  8: 9655,
}

const SMI_60_PER_ADDITIONAL = 942

/** 85% SMI — monthly limits by household size (Wisconsin Shares exit threshold). */
export const SMI_85: Record<number, number> = {
  2: 5671,
  3: 7005,
  4: 8340,
  5: 9674,
  6: 11008,
  7: 12342,
  8: 13676,
}

const SMI_85_PER_ADDITIONAL = 1334

/**
 * Get 60% SMI monthly limit for a household size.
 */
export function getSmi60(householdSize: number): number {
  if (householdSize <= 8) return SMI_60[householdSize]!
  return SMI_60[8]! + SMI_60_PER_ADDITIONAL * (householdSize - 8)
}

/**
 * Get 85% SMI monthly limit for a household size (minimum 2).
 */
export function getSmi85(householdSize: number): number {
  const size = Math.max(2, householdSize)
  if (size <= 8) return SMI_85[size]!
  return SMI_85[8]! + SMI_85_PER_ADDITIONAL * (size - 8)
}
