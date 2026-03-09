/**
 * Core TypeScript interfaces for the Wisconsin Benefit Cliff Calculator.
 */

import type { FullFormState } from '../engine/derive.ts'

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface HouseholdInputs {
  householdSize: number        // 1-8
  numberOfChildren: number     // 0 to householdSize-1
  currentMonthlyIncome: number // gross monthly
  raiseMonthly: number         // monthly raise amount
  monthlyRent: number          // for FoodShare shelter deduction
  monthlyChildcareCosts: number // for FoodShare dependent care deduction
}

export type IncomeType = 'hourly' | 'monthly'

/**
 * Full form state = canonical user inputs + derived values.
 * Use `deriveState()` from `src/engine/derive.ts` to construct.
 */
export type FormState = FullFormState

// ---------------------------------------------------------------------------
// Cliff types
// ---------------------------------------------------------------------------

export type CliffType = 'hard' | 'gradual' | 'tier_shift'

// ---------------------------------------------------------------------------
// Analysis output
// ---------------------------------------------------------------------------

export interface ProgramResult {
  key: string
  name: string
  cliffType: CliffType
  currentlyEligible: boolean
  eligibleAfterRaise: boolean
  lost: boolean
  distanceToCliff: number             // dollars until threshold
  // Only for programs with calculable values:
  currentMonthlyValue: number | null   // null = not calculable
  newMonthlyValue: number | null
  monthlyLoss: number | null
  // For tier_shift programs:
  currentTier: string | null           // e.g., "free", "reduced", "paid"
  newTier: string | null
  // Program metadata for display:
  color: string
  basis: string
  limit: number
  calculable: boolean
  // Wisconsin Shares dual thresholds:
  entryLimit?: number
  exitLimit?: number
}

export interface MonthlyImpact {
  raise: number
  foodshareLoss: number        // gradual reduction (could be $0 to full amount)
  schoolMealLoss: number       // per-child x numberOfChildren, tier-aware
  wheapLoss: number            // $55/mo if lost, $0 if kept
  customLosses: number         // sum of user-entered values for lost eligibility-only programs
  totalCalculableLoss: number
  netMonthly: number           // raise - totalCalculableLoss
  netAnnual: number
  // Programs NOT included in the dollar calculation:
  uncalculatedLosses: string[] // e.g., ["BadgerCare Plus (Adults)", "Wisconsin Shares"]
}

export interface CliffAnalysis {
  programs: ProgramResult[]
  calculableImpact: MonthlyImpact
  safeRaiseMax: number          // largest raise that triggers no cliff at all
  cliffWarning: boolean         // true if net impact is negative
}
