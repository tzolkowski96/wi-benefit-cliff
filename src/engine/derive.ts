/**
 * Pure function that derives computed fields from canonical form inputs.
 *
 * Canonical (user-edited) fields:
 *   householdSize, numberOfChildren, incomeType, hourlyWage, monthlyIncome,
 *   raiseAmount, monthlyRent, monthlyChildcareCosts, customBadgerCare*,
 *   customWisconsinSharesValue
 *
 * Derived fields (computed here, never set directly):
 *   currentMonthlyIncome, raiseMonthly
 *
 * This function also enforces constraints:
 *   - numberOfChildren < householdSize
 *   - householdSize=1 → numberOfChildren=0
 */

import type { IncomeType } from '../types/index.ts'
import { hourlyToMonthly, monthlyToHourly } from './wage.ts'

export interface FormInputs {
  householdSize: number
  numberOfChildren: number
  incomeType: IncomeType
  hourlyWage: number
  monthlyIncome: number
  raiseAmount: number
  monthlyRent: number
  monthlyChildcareCosts: number
  customBadgerCareAdultValue: number | null
  customBadgerCareChildValue: number | null
  customWisconsinSharesValue: number | null
}

export interface DerivedState {
  currentMonthlyIncome: number
  raiseMonthly: number
}

export type FullFormState = FormInputs & DerivedState

/**
 * Enforce household constraints and compute derived income values.
 * Pure function — no React, no side effects.
 */
export function deriveState(inputs: FormInputs): FullFormState {
  let { numberOfChildren } = inputs

  // Enforce constraints
  if (inputs.householdSize === 1) numberOfChildren = 0
  if (numberOfChildren >= inputs.householdSize) numberOfChildren = inputs.householdSize - 1

  // Derive monthly values based on income type
  const currentMonthlyIncome = inputs.incomeType === 'hourly'
    ? hourlyToMonthly(inputs.hourlyWage)
    : inputs.monthlyIncome

  const raiseMonthly = inputs.incomeType === 'hourly'
    ? hourlyToMonthly(inputs.raiseAmount)
    : Math.round(inputs.raiseAmount)

  return {
    ...inputs,
    numberOfChildren,
    currentMonthlyIncome,
    raiseMonthly,
  }
}

/**
 * When the user switches income type, convert the "other" fields to keep
 * values consistent.  Returns a partial patch.
 */
export function syncIncomeTypeSwitch(
  prev: FormInputs,
  newType: IncomeType,
): Partial<FormInputs> {
  if (newType === prev.incomeType) return {}

  if (newType === 'hourly') {
    // Was monthly → convert to hourly
    return {
      incomeType: 'hourly',
      hourlyWage: monthlyToHourly(prev.monthlyIncome),
      raiseAmount: monthlyToHourly(prev.raiseAmount),
    }
  }
  // Was hourly → convert to monthly
  return {
    incomeType: 'monthly',
    monthlyIncome: hourlyToMonthly(prev.hourlyWage),
    raiseAmount: hourlyToMonthly(prev.raiseAmount),
  }
}
