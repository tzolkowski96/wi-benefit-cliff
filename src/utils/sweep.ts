/**
 * Sweep functions that compute benefit data across a range of income/raise values.
 * Used by the Recharts data visualization components.
 */

import type { ProgramResult } from '../types/index.ts'
import type { CustomBenefitValues } from '../hooks/useCliffAnalysis.ts'
import type { BreakEvenInputs } from './breakeven.ts'
import { computeTotalLoss } from './breakeven.ts'
import { PROGRAMS, WHEAP_MONTHLY_VALUE } from '../data/programs.ts'
import { calculateFoodShareBenefit, getSchoolMealTier, getSchoolMealValue, isEligible } from './calculations.ts'
import { getSmi60 } from '../data/smi.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RaiseSweepPoint {
  raiseMonthly: number
  totalLoss: number
  netImpact: number
}

interface CliffPoint {
  raiseMonthly: number
  programName: string
  programColor: string
}

interface RaiseSweepResult {
  points: RaiseSweepPoint[]
  cliffPoints: CliffPoint[]
}

interface BenefitStackPoint {
  monthlyIncome: number
  foodshare: number
  schoolMeals: number
  wheap: number
  total: number
}

// ---------------------------------------------------------------------------
// computeRaiseSweep — net impact across a range of raise amounts
// ---------------------------------------------------------------------------

export function computeRaiseSweep(
  inputs: BreakEvenInputs,
  programs: ProgramResult[],
  customValues?: CustomBenefitValues,
  maxRaise?: number,
  steps: number = 200,
): RaiseSweepResult {
  // Determine a sensible max raise from program cliff distances
  const eligibleDistances = programs
    .filter((p) => p.currentlyEligible && p.distanceToCliff > 0)
    .map((p) => p.distanceToCliff)
  const highestCliff = eligibleDistances.length > 0 ? Math.max(...eligibleDistances) : 1000
  const effectiveMax = maxRaise ?? Math.max(highestCliff * 1.5, 2000)

  const stepSize = effectiveMax / steps
  const points: RaiseSweepPoint[] = []

  for (let i = 0; i <= steps; i++) {
    const raiseMonthly = Math.round(i * stepSize)
    const totalLoss = computeTotalLoss(inputs, raiseMonthly, customValues)
    points.push({
      raiseMonthly,
      totalLoss,
      netImpact: raiseMonthly - totalLoss,
    })
  }

  // Identify cliff points: raise amounts where each program is lost
  const cliffPoints: CliffPoint[] = programs
    .filter((p) => p.currentlyEligible && p.distanceToCliff > 0 && p.distanceToCliff <= effectiveMax)
    .map((p) => ({
      raiseMonthly: p.distanceToCliff,
      programName: p.name,
      programColor: p.color,
    }))
    .sort((a, b) => a.raiseMonthly - b.raiseMonthly)

  return { points, cliffPoints }
}

// ---------------------------------------------------------------------------
// computeBenefitStack — total benefit value across income levels
// ---------------------------------------------------------------------------

export function computeBenefitStack(
  householdSize: number,
  numberOfChildren: number,
  monthlyRent: number = 0,
  monthlyChildcareCosts: number = 0,
  maxIncome?: number,
  steps: number = 200,
): BenefitStackPoint[] {
  // Determine highest threshold for this household
  const thresholds = PROGRAMS
    .filter((p) => !p.requiresChildren || numberOfChildren > 0)
    .filter((p) => householdSize >= p.minHouseholdSize)
    .map((p) => p.getLimit(householdSize))
  const highestThreshold = thresholds.length > 0 ? Math.max(...thresholds) : 5000
  const effectiveMax = maxIncome ?? Math.round(highestThreshold * 1.2)

  const stepSize = effectiveMax / steps
  const points: BenefitStackPoint[] = []

  for (let i = 0; i <= steps; i++) {
    const income = Math.round(i * stepSize)

    // FoodShare benefit (gradual phase-out)
    const foodshare = calculateFoodShareBenefit(income, householdSize, monthlyRent, monthlyChildcareCosts)

    // School meals (tier-based)
    let schoolMeals = 0
    if (numberOfChildren > 0) {
      const tier = getSchoolMealTier(income, householdSize)
      schoolMeals = getSchoolMealValue(tier, numberOfChildren)
    }

    // WHEAP (hard cliff at 60% SMI)
    const wheapLimit = getSmi60(householdSize)
    const wheap = isEligible(income, wheapLimit) ? WHEAP_MONTHLY_VALUE : 0

    points.push({
      monthlyIncome: income,
      foodshare,
      schoolMeals,
      wheap,
      total: foodshare + schoolMeals + wheap,
    })
  }

  return points
}
