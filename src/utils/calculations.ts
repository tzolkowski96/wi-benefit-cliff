/**
 * Pure functions: eligibility checks, benefit value estimates.
 *
 * FoodShare uses a simplified formula that excludes excess shelter and
 * dependent care deductions because we don't collect those inputs.
 *
 * School meal values use USDA reimbursement rates as an upper-bound proxy
 * for family savings. The UI must label them as "estimated meal subsidy
 * value" and include the disclaimer from the spec.
 */

import { getFplAtPercent } from '../data/fpl.ts'
import {
  getFoodShareStandardDeduction,
  getMaxAllotment,
  FREE_MEAL_VALUE_PER_CHILD,
  REDUCED_MEAL_VALUE_PER_CHILD,
  HEATING_STANDARD_UTILITY_ALLOWANCE,
  MAX_EXCESS_SHELTER_DEDUCTION,
} from '../data/programs.ts'

// ---------------------------------------------------------------------------
// FoodShare
// ---------------------------------------------------------------------------

/**
 * Calculate estimated FoodShare benefit for a given gross monthly income.
 *
 * Checks BOTH the gross income limit (200% FPL) AND the net income limit
 * (100% FPL). A household can be under the gross limit but still receive
 * $0 if their net income exceeds 100% FPL.
 *
 * Optionally accepts monthly rent and childcare costs to compute the
 * dependent care deduction and excess shelter deduction for a more
 * accurate estimate.
 */
export function calculateFoodShareBenefit(
  grossMonthly: number,
  householdSize: number,
  monthlyRent: number = 0,
  monthlyChildcareCosts: number = 0,
): number {
  // 1. Gross income test: 200% FPL
  const grossLimit = getFplAtPercent(200, householdSize)
  if (grossMonthly > grossLimit) return 0

  // 2. Compute deductions
  const standardDeduction = getFoodShareStandardDeduction(householdSize)
  const earnedIncomeDeduction = 0.20 * grossMonthly // assuming all income is earned

  // Dependent care deduction: actual childcare costs, no cap
  const dependentCareDeduction = Math.max(0, monthlyChildcareCosts)

  // Excess shelter deduction (only if rent/housing costs provided)
  let excessShelterDeduction = 0
  if (monthlyRent > 0) {
    const incomeAfterOtherDeductions = grossMonthly - standardDeduction - earnedIncomeDeduction - dependentCareDeduction
    const halfIncome = Math.max(0, incomeAfterOtherDeductions) / 2
    const shelterCosts = monthlyRent + HEATING_STANDARD_UTILITY_ALLOWANCE
    const excessShelter = Math.max(0, shelterCosts - halfIncome)
    // Cap at $712/mo (FFY 2025) unless household has elderly/disabled member
    // (we don't track this, so always apply the cap)
    excessShelterDeduction = Math.min(excessShelter, MAX_EXCESS_SHELTER_DEDUCTION)
  }

  // 3. Net income = gross - all deductions
  const netIncome = Math.max(0,
    grossMonthly - standardDeduction - earnedIncomeDeduction - dependentCareDeduction - excessShelterDeduction
  )

  // 4. Net income test: 100% FPL
  const netLimit = getFplAtPercent(100, householdSize)
  if (netIncome > netLimit) return 0

  // 5. Benefit calculation
  const maxAllotment = getMaxAllotment(householdSize)
  const benefit = maxAllotment - 0.30 * netIncome
  return Math.max(0, Math.round(benefit))
}

// ---------------------------------------------------------------------------
// School meals
// ---------------------------------------------------------------------------

/**
 * Determine school meal tier based on income and household size.
 *   - income <= 130% FPL → "free"
 *   - 130% FPL < income <= 185% FPL → "reduced"
 *   - income > 185% FPL → "paid"
 */
export function getSchoolMealTier(
  grossMonthly: number,
  householdSize: number,
): 'free' | 'reduced' | 'paid' {
  const freeLimit = getFplAtPercent(130, householdSize)
  if (grossMonthly <= freeLimit) return 'free'

  const reducedLimit = getFplAtPercent(185, householdSize)
  if (grossMonthly <= reducedLimit) return 'reduced'

  return 'paid'
}

/**
 * Get the monthly dollar value of a school meal tier per child.
 *   - free:    $105/child/mo (USDA reimbursement rate proxy)
 *   - reduced: $84/child/mo  (reimbursement minus family copay)
 *   - paid:    $0
 */
export function getSchoolMealValue(
  tier: 'free' | 'reduced' | 'paid',
  numberOfChildren: number,
): number {
  if (tier === 'free') return FREE_MEAL_VALUE_PER_CHILD * numberOfChildren
  if (tier === 'reduced') return REDUCED_MEAL_VALUE_PER_CHILD * numberOfChildren
  return 0
}

/**
 * Calculate the tier-aware school meal loss when transitioning between tiers.
 *
 * Important: free → reduced is a $21/child loss (not $105/child), because the
 * family still receives reduced-price meals. The full loss only occurs when
 * transitioning to "paid".
 */
export function getSchoolMealLoss(
  currentTier: 'free' | 'reduced' | 'paid',
  newTier: 'free' | 'reduced' | 'paid',
  numberOfChildren: number,
): number {
  const currentValue = getSchoolMealValue(currentTier, numberOfChildren)
  const newValue = getSchoolMealValue(newTier, numberOfChildren)
  return Math.max(0, currentValue - newValue)
}

// ---------------------------------------------------------------------------
// General eligibility helpers
// ---------------------------------------------------------------------------

/**
 * Simple threshold check: is gross monthly income at or below the limit?
 */
export function isEligible(grossMonthly: number, limit: number): boolean {
  return grossMonthly <= limit
}

/**
 * How many dollars of income remain before hitting the cliff.
 * Returns 0 if already over the limit.
 */
export function getDistanceToCliff(grossMonthly: number, limit: number): number {
  return Math.max(0, limit - grossMonthly)
}
