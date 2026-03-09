/**
 * Helpers that extract typed sub-objects from FormState.
 *
 * These avoid repeating the same field-picking pattern in every file that
 * needs a BreakEvenInputs or CustomBenefitValues from the full form state.
 */

import type { FormState } from '../types/index.ts'
import type { BreakEvenInputs } from './breakeven.ts'
import type { CustomBenefitValues } from '../hooks/useCliffAnalysis.ts'

export function toBreakEvenInputs(state: FormState): BreakEvenInputs {
  return {
    householdSize: state.householdSize,
    numberOfChildren: state.numberOfChildren,
    currentMonthlyIncome: state.currentMonthlyIncome,
    monthlyRent: state.monthlyRent,
    monthlyChildcareCosts: state.monthlyChildcareCosts,
  }
}

export function toCustomBenefitValues(state: FormState): CustomBenefitValues {
  return {
    customBadgerCareAdultValue: state.customBadgerCareAdultValue,
    customBadgerCareChildValue: state.customBadgerCareChildValue,
    customWisconsinSharesValue: state.customWisconsinSharesValue,
  }
}
