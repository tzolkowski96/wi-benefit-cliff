/**
 * 2025 Federal Poverty Level (FPL) guidelines — contiguous 48 states + DC.
 * Source: HHS ASPE, effective January 2025.
 *
 * Base amount for household of 1: $15,060/year ($1,255/month).
 * Each additional person adds $5,380/year ($448.33/month, rounded to $449).
 */

/** Monthly FPL at 100% by household size (1-8). */
export const FPL_100: Record<number, number> = {
  1: 1255,
  2: 1704,
  3: 2152,
  4: 2600,
  5: 3049,
  6: 3497,
  7: 3946,
  8: 4394,
}

/** Per-additional-person increment beyond household size 8 (monthly, 100% FPL). */
const FPL_100_PER_ADDITIONAL = 449

/**
 * Get 100% FPL monthly limit for any household size.
 */
export function getFpl100(householdSize: number): number {
  if (householdSize <= 8) return FPL_100[householdSize] ?? FPL_100[8]
  return FPL_100[8] + FPL_100_PER_ADDITIONAL * (householdSize - 8)
}

/**
 * Get FPL at a given percentage (e.g. 130, 185, 200, 306) for a household size.
 * Returns monthly income limit.
 */
export function getFplAtPercent(percent: number, householdSize: number): number {
  // Use the published lookup tables for common percentages to match
  // official program thresholds exactly (avoids rounding differences).
  const table = FPL_TABLES[percent]
  if (table) {
    if (householdSize <= 8) return table.limits[householdSize] ?? table.limits[8]
    return table.limits[8] + table.perAdditional * (householdSize - 8)
  }
  // Fallback: scale from 100% FPL
  return Math.round(getFpl100(householdSize) * (percent / 100))
}

/**
 * Pre-computed monthly FPL tables at the percentages used by Wisconsin programs.
 * Values match UW-Madison Extension / Wisconsin DHS published thresholds.
 */
const FPL_TABLES: Record<number, { limits: Record<number, number>; perAdditional: number }> = {
  100: {
    limits: { 1: 1255, 2: 1704, 3: 2152, 4: 2600, 5: 3049, 6: 3497, 7: 3946, 8: 4394 },
    perAdditional: 449,
  },
  130: {
    limits: { 1: 1631, 2: 2215, 3: 2795, 4: 3380, 5: 3964, 6: 4548, 7: 5128, 8: 5712 },
    perAdditional: 584,
  },
  185: {
    limits: { 1: 2322, 2: 3152, 3: 3981, 4: 4810, 5: 5640, 6: 6469, 7: 7299, 8: 8128 },
    perAdditional: 830,
  },
  200: {
    limits: { 1: 2510, 2: 3408, 3: 4304, 4: 5200, 5: 6098, 6: 6996, 7: 7896, 8: 8794 },
    perAdditional: 898,
  },
  306: {
    limits: { 1: 3840, 2: 5214, 3: 6585, 4: 7956, 5: 9330, 6: 10701, 7: 12075, 8: 13446 },
    perAdditional: 1374,
  },
}
