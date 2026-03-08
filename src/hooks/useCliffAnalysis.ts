/**
 * Core calculation engine hook.
 *
 * Takes HouseholdInputs, returns a full CliffAnalysis covering all 7 programs.
 * - FoodShare: gradual phase-out using the USDA formula
 * - School meals: tier shift (free → reduced → paid)
 * - WHEAP: hard cliff, $55/mo binary value
 * - BadgerCare (adult & children): eligibility only, in uncalculatedLosses
 * - Wisconsin Shares: eligibility only, dual entry/exit thresholds
 */

import { useMemo } from 'react'
import type { HouseholdInputs, CliffAnalysis, ProgramResult, MonthlyImpact } from '../types/index.ts'
import { PROGRAMS, WHEAP_MONTHLY_VALUE } from '../data/programs.ts'
import type { ProgramConfig } from '../data/programs.ts'
import {
  calculateFoodShareBenefit,
  getSchoolMealTier,
  getSchoolMealValue,
  getSchoolMealLoss,
  isEligible,
  getDistanceToCliff,
} from '../utils/calculations.ts'

export interface CustomBenefitValues {
  customBadgerCareAdultValue: number | null
  customBadgerCareChildValue: number | null
  customWisconsinSharesValue: number | null
}

export function useCliffAnalysis(inputs: HouseholdInputs, customValues?: CustomBenefitValues): CliffAnalysis {
  const { householdSize, numberOfChildren, currentMonthlyIncome, raiseMonthly, monthlyRent, monthlyChildcareCosts } = inputs

  return useMemo(() => {
    const newMonthlyIncome = currentMonthlyIncome + raiseMonthly
    const programs: ProgramResult[] = []

    let foodshareLoss = 0
    let schoolMealLoss = 0
    let wheapLoss = 0
    let customLosses = 0
    const uncalculatedLosses: string[] = []

    // Track distances for safeRaiseMax calculation
    const eligibleDistances: number[] = []

    for (const prog of PROGRAMS) {
      // 1. Determine applicability
      if (prog.requiresChildren && numberOfChildren === 0) continue
      if (householdSize < prog.minHouseholdSize) continue

      // 2. Build the result for this program
      const result = analyzeProgram(
        prog,
        currentMonthlyIncome,
        newMonthlyIncome,
        householdSize,
        numberOfChildren,
        monthlyRent,
        monthlyChildcareCosts,
      )

      programs.push(result)

      // 3. Accumulate calculable dollar impacts
      if (result.currentlyEligible) {
        // Track distance to cliff for safeRaiseMax
        eligibleDistances.push(result.distanceToCliff)
      }

      if (result.monthlyLoss !== null && result.monthlyLoss > 0) {
        switch (prog.key) {
          case 'foodshare':
            foodshareLoss = result.monthlyLoss
            break
          case 'school_meals_free':
          case 'school_meals_reduced':
            schoolMealLoss += result.monthlyLoss
            break
          case 'wheap':
            wheapLoss = result.monthlyLoss
            break
        }
      }

      // 4. Track uncalculated losses (or include custom values)
      if (!prog.calculable && result.lost) {
        const customValue = getCustomValue(prog.key, customValues)
        if (customValue !== null) {
          customLosses += customValue
        } else {
          uncalculatedLosses.push(result.name)
        }
      }
    }

    const totalCalculableLoss = foodshareLoss + schoolMealLoss + wheapLoss + customLosses
    const netMonthly = raiseMonthly - totalCalculableLoss

    const calculableImpact: MonthlyImpact = {
      raise: raiseMonthly,
      foodshareLoss,
      schoolMealLoss,
      wheapLoss,
      customLosses,
      totalCalculableLoss,
      netMonthly,
      netAnnual: netMonthly * 12,
      uncalculatedLosses,
    }

    // safeRaiseMax: largest raise where NO currently-eligible program changes status
    const safeRaiseMax = eligibleDistances.length > 0
      ? Math.min(...eligibleDistances)
      : 0

    return {
      programs,
      calculableImpact,
      safeRaiseMax,
      cliffWarning: netMonthly < 0,
    }
  }, [householdSize, numberOfChildren, currentMonthlyIncome, raiseMonthly, monthlyRent, monthlyChildcareCosts,
      customValues?.customBadgerCareAdultValue, customValues?.customBadgerCareChildValue, customValues?.customWisconsinSharesValue])
}

// ---------------------------------------------------------------------------
// Per-program analysis
// ---------------------------------------------------------------------------

function analyzeProgram(
  prog: ProgramConfig,
  currentIncome: number,
  newIncome: number,
  householdSize: number,
  numberOfChildren: number,
  monthlyRent: number,
  monthlyChildcareCosts: number,
): ProgramResult {
  const limit = prog.getLimit(householdSize)

  // Base result shape
  const base = {
    key: prog.key,
    name: prog.name,
    cliffType: prog.cliffType,
    color: prog.color,
    basis: prog.basis,
    limit,
    calculable: prog.calculable,
    currentTier: null as string | null,
    newTier: null as string | null,
    entryLimit: prog.getEntryLimit ? prog.getEntryLimit(householdSize) : undefined,
    exitLimit: prog.key === 'wisconsin_shares' ? limit : undefined,
  }

  // Dispatch by program type
  switch (prog.key) {
    case 'foodshare':
      return analyzeFoodShare(base, currentIncome, newIncome, householdSize, limit, monthlyRent, monthlyChildcareCosts)

    case 'school_meals_free':
      return analyzeSchoolMealsFree(base, currentIncome, newIncome, householdSize, numberOfChildren)

    case 'school_meals_reduced':
      return analyzeSchoolMealsReduced(base, currentIncome, newIncome, householdSize, numberOfChildren)

    case 'wheap':
      return analyzeWheap(base, currentIncome, newIncome, limit)

    default:
      // BadgerCare (adult/children) and Wisconsin Shares: eligibility only
      return analyzeEligibilityOnly(base, currentIncome, newIncome, limit)
  }
}

// ---------------------------------------------------------------------------
// FoodShare: gradual phase-out
// ---------------------------------------------------------------------------

type BaseResult = {
  key: string
  name: string
  cliffType: 'hard' | 'gradual' | 'tier_shift'
  color: string
  basis: string
  limit: number
  calculable: boolean
  currentTier: string | null
  newTier: string | null
  entryLimit?: number
  exitLimit?: number
}

function analyzeFoodShare(
  base: BaseResult,
  currentIncome: number,
  newIncome: number,
  householdSize: number,
  grossLimit: number,
  monthlyRent: number,
  monthlyChildcareCosts: number,
): ProgramResult {
  const currentlyEligible = currentIncome <= grossLimit
  const eligibleAfterRaise = newIncome <= grossLimit

  const currentBenefit = calculateFoodShareBenefit(currentIncome, householdSize, monthlyRent, monthlyChildcareCosts)
  const newBenefit = calculateFoodShareBenefit(newIncome, householdSize, monthlyRent, monthlyChildcareCosts)
  const loss = Math.max(0, currentBenefit - newBenefit)

  return {
    ...base,
    currentlyEligible,
    eligibleAfterRaise,
    lost: currentlyEligible && !eligibleAfterRaise,
    distanceToCliff: getDistanceToCliff(currentIncome, grossLimit),
    currentMonthlyValue: currentBenefit,
    newMonthlyValue: newBenefit,
    monthlyLoss: loss,
  }
}

// ---------------------------------------------------------------------------
// Free School Meals: tier shift (free → reduced, not free → nothing)
// ---------------------------------------------------------------------------

function analyzeSchoolMealsFree(
  base: BaseResult,
  currentIncome: number,
  newIncome: number,
  householdSize: number,
  numberOfChildren: number,
): ProgramResult {
  const currentTier = getSchoolMealTier(currentIncome, householdSize)
  const newTier = getSchoolMealTier(newIncome, householdSize)

  const freeLimit = base.limit // 130% FPL
  const currentlyEligible = currentTier === 'free'
  const eligibleAfterRaise = newTier === 'free'

  // For free meals, loss is only the difference when shifting to reduced.
  // The full tier→paid transition is handled by the reduced meals program.
  let loss = 0
  let currentValue: number | null = null
  let newValue: number | null = null

  if (currentlyEligible) {
    currentValue = getSchoolMealValue('free', numberOfChildren)
    if (newTier === 'free') {
      newValue = currentValue
      loss = 0
    } else if (newTier === 'reduced') {
      // Tier shift: free → reduced. Loss = ($105 - $84) × children
      newValue = getSchoolMealValue('reduced', numberOfChildren)
      loss = getSchoolMealLoss('free', 'reduced', numberOfChildren)
    } else {
      // free → paid: the full free value is lost here, but the reduced→paid
      // loss is tracked by the reduced meals program. For the free program,
      // we report the free→reduced portion only if the reduced tier was
      // also skipped. Since both programs are tracked separately, report
      // the full loss from free tier here.
      newValue = 0
      loss = getSchoolMealLoss('free', 'paid', numberOfChildren)
    }
  }

  return {
    ...base,
    currentlyEligible,
    eligibleAfterRaise,
    lost: currentlyEligible && !eligibleAfterRaise,
    distanceToCliff: getDistanceToCliff(currentIncome, freeLimit),
    currentMonthlyValue: currentValue,
    newMonthlyValue: newValue,
    monthlyLoss: currentlyEligible ? loss : null,
    currentTier: currentlyEligible ? 'free' : (currentTier === 'reduced' ? 'reduced' : 'paid'),
    newTier,
  }
}

// ---------------------------------------------------------------------------
// Reduced School Meals: hard cliff (reduced → paid)
// ---------------------------------------------------------------------------

function analyzeSchoolMealsReduced(
  base: BaseResult,
  currentIncome: number,
  newIncome: number,
  householdSize: number,
  numberOfChildren: number,
): ProgramResult {
  const currentTier = getSchoolMealTier(currentIncome, householdSize)
  const newTier = getSchoolMealTier(newIncome, householdSize)

  const reducedLimit = base.limit // 185% FPL
  // "Currently eligible" for reduced means they're in the reduced tier
  // (not free — free is tracked by the free meals program)
  const currentlyInReduced = currentTier === 'reduced'

  let loss = 0
  let currentValue: number | null = null
  let newValue: number | null = null

  if (currentlyInReduced) {
    currentValue = getSchoolMealValue('reduced', numberOfChildren)
    if (newTier === 'paid') {
      newValue = 0
      loss = getSchoolMealLoss('reduced', 'paid', numberOfChildren)
    } else {
      newValue = currentValue
      loss = 0
    }
  }

  return {
    ...base,
    currentlyEligible: currentlyInReduced,
    eligibleAfterRaise: currentlyInReduced ? newTier !== 'paid' : false,
    lost: currentlyInReduced && newTier === 'paid',
    distanceToCliff: currentlyInReduced ? getDistanceToCliff(currentIncome, reducedLimit) : 0,
    currentMonthlyValue: currentValue,
    newMonthlyValue: newValue,
    monthlyLoss: currentlyInReduced ? loss : null,
    currentTier,
    newTier,
  }
}

// ---------------------------------------------------------------------------
// WHEAP: hard cliff, $55/mo binary value
// ---------------------------------------------------------------------------

function analyzeWheap(
  base: BaseResult,
  currentIncome: number,
  newIncome: number,
  limit: number,
): ProgramResult {
  const currentlyEligible = isEligible(currentIncome, limit)
  const eligibleAfterRaise = isEligible(newIncome, limit)
  const lost = currentlyEligible && !eligibleAfterRaise
  const loss = lost ? WHEAP_MONTHLY_VALUE : 0

  return {
    ...base,
    currentlyEligible,
    eligibleAfterRaise,
    lost,
    distanceToCliff: getDistanceToCliff(currentIncome, limit),
    currentMonthlyValue: currentlyEligible ? WHEAP_MONTHLY_VALUE : null,
    newMonthlyValue: eligibleAfterRaise ? WHEAP_MONTHLY_VALUE : (currentlyEligible ? 0 : null),
    monthlyLoss: currentlyEligible ? loss : null,
  }
}

// ---------------------------------------------------------------------------
// Eligibility-only programs (BadgerCare, Wisconsin Shares)
// No dollar values — these go into uncalculatedLosses.
// ---------------------------------------------------------------------------

function analyzeEligibilityOnly(
  base: BaseResult,
  currentIncome: number,
  newIncome: number,
  limit: number,
): ProgramResult {
  const currentlyEligible = isEligible(currentIncome, limit)
  const eligibleAfterRaise = isEligible(newIncome, limit)

  return {
    ...base,
    currentlyEligible,
    eligibleAfterRaise,
    lost: currentlyEligible && !eligibleAfterRaise,
    distanceToCliff: getDistanceToCliff(currentIncome, limit),
    currentMonthlyValue: null,
    newMonthlyValue: null,
    monthlyLoss: null,
  }
}

// ---------------------------------------------------------------------------
// Helper: look up user-entered custom value for an eligibility-only program
// ---------------------------------------------------------------------------

function getCustomValue(programKey: string, customValues?: CustomBenefitValues): number | null {
  if (!customValues) return null
  switch (programKey) {
    case 'badgercare_adult': return customValues.customBadgerCareAdultValue
    case 'badgercare_children': return customValues.customBadgerCareChildValue
    case 'wisconsin_shares': return customValues.customWisconsinSharesValue
    default: return null
  }
}
