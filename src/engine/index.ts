/**
 * Public API for the benefit-cliff calculation engine.
 *
 * This module is React-free — every export is a pure function, constant, or
 * type. It could be published as a standalone npm package with zero framework
 * dependencies.
 */

// ---------------------------------------------------------------------------
// Core calculations
// ---------------------------------------------------------------------------
export {
  calculateFoodShareBenefit,
  getSchoolMealTier,
  getSchoolMealValue,
  getSchoolMealLoss,
  isEligible,
  getDistanceToCliff,
} from './calculations.ts'

// ---------------------------------------------------------------------------
// Break-even analysis
// ---------------------------------------------------------------------------
export {
  computeTotalLoss,
  computeBreakEvenData,
  getCustomValue,
} from './breakeven.ts'
export type { BreakEvenInputs, BreakEvenData } from './breakeven.ts'

// ---------------------------------------------------------------------------
// Income / benefit sweep
// ---------------------------------------------------------------------------
export { computeRaiseSweep, computeBenefitStack } from './sweep.ts'

// ---------------------------------------------------------------------------
// Wage conversion
// ---------------------------------------------------------------------------
export {
  DEFAULT_HOURS_PER_WEEK,
  WEEKS_PER_MONTH,
  hourlyToMonthly,
  monthlyToHourly,
} from './wage.ts'

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
export { formatMoney, formatMoneyWithSign } from './format.ts'

// ---------------------------------------------------------------------------
// Full cliff analysis
// ---------------------------------------------------------------------------
export { analyzeCliffs } from './analyzeCliffs.ts'
export type { ProgramNameMap } from './analyzeCliffs.ts'

// ---------------------------------------------------------------------------
// State derivation
// ---------------------------------------------------------------------------
export { deriveState, syncIncomeTypeSwitch } from './derive.ts'
export type { FormInputs, DerivedState, FullFormState } from './derive.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type { CustomBenefitValues } from './types.ts'

// ---------------------------------------------------------------------------
// Program data & thresholds
// ---------------------------------------------------------------------------
export {
  PROGRAMS,
  FOODSHARE_MAX_ALLOTMENT,
  FREE_MEAL_VALUE_PER_CHILD,
  REDUCED_MEAL_VALUE_PER_CHILD,
  WHEAP_MONTHLY_VALUE,
  HEATING_STANDARD_UTILITY_ALLOWANCE,
  MAX_EXCESS_SHELTER_DEDUCTION,
  getFoodShareStandardDeduction,
  getMaxAllotment,
} from './data/programs.ts'
export type { ProgramConfig } from './data/programs.ts'

export { FPL_100, getFpl100, getFplAtPercent } from './data/fpl.ts'
export { SMI_60, SMI_85, getSmi60, getSmi85 } from './data/smi.ts'
