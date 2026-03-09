/**
 * Wisconsin benefit program definitions — 2025 thresholds.
 *
 * Sources:
 * - UW-Madison Division of Extension, "Benefit Cliffs for Wisconsin Public Programs" (2025)
 * - Wisconsin DHS, DMS Operations Memo 2024-18 (FoodShare)
 * - USDA FNS, FR 07/24/2025 (school meal reimbursement rates SY 2025-26)
 * - Wisconsin DCF (Wisconsin Shares entry/exit thresholds)
 */

import type { CliffType } from '../types/index.ts'
import { getFplAtPercent } from './fpl.ts'
import { getSmi60, getSmi85 } from './smi.ts'

// ---------------------------------------------------------------------------
// FoodShare constants (FFY 2025)
// ---------------------------------------------------------------------------

export function getFoodShareStandardDeduction(householdSize: number): number {
  if (householdSize <= 3) return 198
  if (householdSize === 4) return 213
  if (householdSize === 5) return 249
  return 286
}

/** Maximum monthly FoodShare allotments (FFY 2025). */
export const FOODSHARE_MAX_ALLOTMENT: Record<number, number> = {
  1: 292,
  2: 536,
  3: 768,
  4: 975,
  5: 1158,
  6: 1390,
  7: 1536,
  8: 1756,
}

export function getMaxAllotment(householdSize: number): number {
  if (householdSize <= 8) return FOODSHARE_MAX_ALLOTMENT[householdSize] ?? FOODSHARE_MAX_ALLOTMENT[8]
  // Per-additional estimate: ~$220
  return FOODSHARE_MAX_ALLOTMENT[8] + 220 * (householdSize - 8)
}

// ---------------------------------------------------------------------------
// School meal constants (SY 2025-26, USDA reimbursement rates)
// ---------------------------------------------------------------------------

/** Free meals: amortized monthly value per child ($105). */
export const FREE_MEAL_VALUE_PER_CHILD = 105

/** Reduced meals: amortized monthly value per child ($84). */
export const REDUCED_MEAL_VALUE_PER_CHILD = 84

/** WHEAP: average annual benefit amortized monthly ($55). */
export const WHEAP_MONTHLY_VALUE = 55

// ---------------------------------------------------------------------------
// FoodShare deduction constants (FFY 2025, DHS Operations Memo 2024-18)
// ---------------------------------------------------------------------------

/** Wisconsin Heating Standard Utility Allowance (HSUA) for FFY 2025. */
export const HEATING_STANDARD_UTILITY_ALLOWANCE = 538

/** Maximum excess shelter deduction (FFY 2025). Applies unless household has elderly/disabled member. */
export const MAX_EXCESS_SHELTER_DEDUCTION = 712

// ---------------------------------------------------------------------------
// Program definitions
// ---------------------------------------------------------------------------

export type ProgramKey =
  | 'foodshare'
  | 'badgercare_adult'
  | 'badgercare_children'
  | 'wisconsin_shares'
  | 'wheap'
  | 'school_meals_free'
  | 'school_meals_reduced'

export interface ProgramConfig {
  key: ProgramKey
  name: string
  description: string
  cliffType: CliffType
  basis: string
  color: string
  requiresChildren: boolean
  minHouseholdSize: number
  /** Whether this program has a calculable dollar value for the net impact. */
  calculable: boolean
  /** Get the primary income threshold for a household size. */
  getLimit: (householdSize: number) => number
  /** For Wisconsin Shares: the entry threshold (200% FPL). */
  getEntryLimit?: (householdSize: number) => number
}

export const PROGRAMS: ProgramConfig[] = [
  {
    key: 'foodshare',
    name: 'FoodShare',
    description: 'Food assistance (Wisconsin SNAP)',
    cliffType: 'gradual',
    basis: '200% FPL',
    color: '#2D6A4F',
    requiresChildren: false,
    minHouseholdSize: 1,
    calculable: true,
    getLimit: (hh) => getFplAtPercent(200, hh),
  },
  {
    key: 'badgercare_adult',
    name: 'BadgerCare Plus (Adults)',
    description: 'Health insurance for adults 19-64',
    cliffType: 'hard',
    basis: '100% FPL',
    color: '#1B4965',
    requiresChildren: false,
    minHouseholdSize: 1,
    calculable: false,
    getLimit: (hh) => getFplAtPercent(100, hh),
  },
  {
    key: 'badgercare_children',
    name: 'BadgerCare Plus (Children)',
    description: 'Health insurance for children under 19',
    cliffType: 'hard',
    basis: '306% FPL',
    color: '#3D5A80',
    requiresChildren: true,
    minHouseholdSize: 1,
    calculable: false,
    getLimit: (hh) => getFplAtPercent(306, hh),
  },
  {
    key: 'wisconsin_shares',
    name: 'Wisconsin Shares',
    description: 'Child care subsidy',
    cliffType: 'hard',
    basis: '85% SMI (exit)',
    color: '#774936',
    requiresChildren: true,
    minHouseholdSize: 2,
    calculable: false,
    getLimit: (hh) => getSmi85(hh),
    getEntryLimit: (hh) => getFplAtPercent(200, hh),
  },
  {
    key: 'wheap',
    name: 'WHEAP',
    description: 'Heating & electric bill assistance',
    cliffType: 'hard',
    basis: '60% SMI',
    color: '#9B2226',
    requiresChildren: false,
    minHouseholdSize: 1,
    calculable: true,
    getLimit: (hh) => getSmi60(hh),
  },
  {
    key: 'school_meals_free',
    name: 'Free School Meals',
    description: 'Free breakfast and lunch for children',
    cliffType: 'tier_shift',
    basis: '130% FPL',
    color: '#5F0F40',
    requiresChildren: true,
    minHouseholdSize: 1,
    calculable: true,
    getLimit: (hh) => getFplAtPercent(130, hh),
  },
  {
    key: 'school_meals_reduced',
    name: 'Reduced School Meals',
    description: 'Reduced-price breakfast and lunch for children',
    cliffType: 'hard',
    basis: '185% FPL',
    color: '#823038',
    requiresChildren: true,
    minHouseholdSize: 1,
    calculable: true,
    getLimit: (hh) => getFplAtPercent(185, hh),
  },
]
