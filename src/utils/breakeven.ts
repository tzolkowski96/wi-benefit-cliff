/**
 * Break-even analysis: find the minimum raise to offset all benefit losses
 * when crossing each cliff threshold.
 *
 * Uses binary search to find the raise amount R where R >= totalLoss(R),
 * starting from just past each program's cliff distance.
 */

import type { ProgramResult } from '../types/index.ts'
import { getCustomValue, type CustomBenefitValues } from '../hooks/useCliffAnalysis.ts'
import { PROGRAMS, WHEAP_MONTHLY_VALUE } from '../data/programs.ts'
import { calculateFoodShareBenefit, getSchoolMealTier, getSchoolMealLoss, isEligible } from './calculations.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BreakEvenInputs {
  householdSize: number
  numberOfChildren: number
  currentMonthlyIncome: number
  monthlyRent: number
  monthlyChildcareCosts: number
}

interface BreakEvenRow {
  name: string
  cliffDistance: number
  breakEvenMonthly: number
  color: string
}

export interface BreakEvenData {
  rows: BreakEvenRow[]
  clearAllRaise: number | null
}

// ---------------------------------------------------------------------------
// Core: compute total calculable loss for a given raise amount
// ---------------------------------------------------------------------------

export function computeTotalLoss(
  inputs: BreakEvenInputs,
  raiseMonthly: number,
  customValues?: CustomBenefitValues,
): number {
  const { householdSize, numberOfChildren, currentMonthlyIncome, monthlyRent, monthlyChildcareCosts } = inputs
  const newIncome = currentMonthlyIncome + raiseMonthly
  let totalLoss = 0

  for (const prog of PROGRAMS) {
    if (prog.requiresChildren && numberOfChildren === 0) continue
    if (householdSize < prog.minHouseholdSize) continue

    const limit = prog.getLimit(householdSize)

    switch (prog.key) {
      case 'foodshare': {
        const currentBenefit = calculateFoodShareBenefit(currentMonthlyIncome, householdSize, monthlyRent, monthlyChildcareCosts)
        const newBenefit = calculateFoodShareBenefit(newIncome, householdSize, monthlyRent, monthlyChildcareCosts)
        totalLoss += Math.max(0, currentBenefit - newBenefit)
        break
      }
      case 'school_meals_free': {
        const currentTier = getSchoolMealTier(currentMonthlyIncome, householdSize)
        const newTier = getSchoolMealTier(newIncome, householdSize)
        if (currentTier === 'free' && newTier !== 'free') {
          totalLoss += getSchoolMealLoss('free', newTier, numberOfChildren)
        }
        break
      }
      case 'school_meals_reduced': {
        const currentTier = getSchoolMealTier(currentMonthlyIncome, householdSize)
        const newTier = getSchoolMealTier(newIncome, householdSize)
        if (currentTier === 'reduced' && newTier === 'paid') {
          totalLoss += getSchoolMealLoss('reduced', 'paid', numberOfChildren)
        }
        break
      }
      case 'wheap': {
        if (isEligible(currentMonthlyIncome, limit) && !isEligible(newIncome, limit)) {
          totalLoss += WHEAP_MONTHLY_VALUE
        }
        break
      }
      default: {
        if (!prog.calculable && isEligible(currentMonthlyIncome, limit) && !isEligible(newIncome, limit)) {
          const cv = getCustomValue(prog.key, customValues)
          if (cv !== null) totalLoss += cv
        }
        break
      }
    }
  }

  return totalLoss
}

// ---------------------------------------------------------------------------
// Binary search for break-even raise
// ---------------------------------------------------------------------------

function findBreakEven(
  inputs: BreakEvenInputs,
  customValues: CustomBenefitValues | undefined,
  minRaise: number,
): number {
  const lossAtMin = computeTotalLoss(inputs, minRaise, customValues)
  if (minRaise >= lossAtMin) return minRaise

  let lo = minRaise
  let hi = minRaise + 50000

  for (let i = 0; i < 50; i++) {
    const mid = Math.floor((lo + hi) / 2)
    if (mid <= lo) break
    const lossAtMid = computeTotalLoss(inputs, mid, customValues)
    if (mid >= lossAtMid) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return hi
}

// ---------------------------------------------------------------------------
// Public: compute break-even data for all eligible cliffs
// ---------------------------------------------------------------------------

export function computeBreakEvenData(
  programs: ProgramResult[],
  inputs: BreakEvenInputs,
  customValues?: CustomBenefitValues,
): BreakEvenData {
  const rows: BreakEvenRow[] = []

  for (const prog of programs) {
    if (!prog.currentlyEligible) continue

    // Include calculable programs with positive current value
    let include = false
    if (prog.calculable) {
      include = (prog.currentMonthlyValue ?? 0) > 0
    } else {
      // Eligibility-only: include only if user entered a custom value
      const cv = getCustomValue(prog.key, customValues)
      include = cv !== null && cv > 0
    }
    if (!include) continue

    const breakEvenMonthly = findBreakEven(inputs, customValues, prog.distanceToCliff + 1)

    rows.push({
      name: prog.name,
      cliffDistance: prog.distanceToCliff,
      breakEvenMonthly,
      color: prog.color,
    })
  }

  // Sort by cliff distance (nearest first)
  rows.sort((a, b) => a.cliffDistance - b.cliffDistance)

  let clearAllRaise: number | null = null
  if (rows.length > 0) {
    const maxDistance = Math.max(...rows.map(r => r.cliffDistance))
    clearAllRaise = findBreakEven(inputs, customValues, maxDistance + 1)
  }

  return { rows, clearAllRaise }
}
