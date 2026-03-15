import { describe, it, expect } from 'vitest'
import { deriveState, syncIncomeTypeSwitch } from './derive.ts'
import type { FormInputs } from './derive.ts'
import { hourlyToMonthly, monthlyToHourly } from './wage.ts'

function makeInputs(overrides: Partial<FormInputs> = {}): FormInputs {
  return {
    householdSize: 3,
    numberOfChildren: 1,
    incomeType: 'hourly',
    hourlyWage: 16,
    monthlyIncome: 2771,
    raiseAmount: 2,
    monthlyRent: 0,
    monthlyChildcareCosts: 0,
    customBadgerCareAdultValue: null,
    customBadgerCareChildValue: null,
    customWisconsinSharesValue: null,
    ...overrides,
  }
}

describe('deriveState', () => {
  it('computes currentMonthlyIncome from hourlyWage when incomeType is hourly', () => {
    const result = deriveState(makeInputs({ incomeType: 'hourly', hourlyWage: 16 }))
    expect(result.currentMonthlyIncome).toBe(hourlyToMonthly(16))
  })

  it('computes raiseMonthly from raiseAmount when incomeType is hourly', () => {
    const result = deriveState(makeInputs({ incomeType: 'hourly', raiseAmount: 2 }))
    expect(result.raiseMonthly).toBe(hourlyToMonthly(2))
  })

  it('uses monthlyIncome directly when incomeType is monthly', () => {
    const result = deriveState(makeInputs({ incomeType: 'monthly', monthlyIncome: 3500 }))
    expect(result.currentMonthlyIncome).toBe(3500)
  })

  it('rounds raiseMonthly to nearest integer when incomeType is monthly', () => {
    const result = deriveState(makeInputs({ incomeType: 'monthly', raiseAmount: 345.7 }))
    expect(result.raiseMonthly).toBe(346)
  })

  it('clamps numberOfChildren to householdSize - 1 when children >= householdSize', () => {
    const result = deriveState(makeInputs({ householdSize: 3, numberOfChildren: 5 }))
    expect(result.numberOfChildren).toBe(2)
  })

  it('forces numberOfChildren to 0 when householdSize is 1', () => {
    const result = deriveState(makeInputs({ householdSize: 1, numberOfChildren: 2 }))
    expect(result.numberOfChildren).toBe(0)
  })

  it('preserves all other input fields unchanged', () => {
    const inputs = makeInputs({
      monthlyRent: 800,
      monthlyChildcareCosts: 400,
      customBadgerCareAdultValue: 350,
      customBadgerCareChildValue: 200,
      customWisconsinSharesValue: 150,
    })
    const result = deriveState(inputs)
    expect(result.monthlyRent).toBe(800)
    expect(result.monthlyChildcareCosts).toBe(400)
    expect(result.customBadgerCareAdultValue).toBe(350)
    expect(result.customBadgerCareChildValue).toBe(200)
    expect(result.customWisconsinSharesValue).toBe(150)
  })
})

describe('syncIncomeTypeSwitch', () => {
  it('returns empty object when type does not change', () => {
    const inputs = makeInputs({ incomeType: 'hourly' })
    expect(syncIncomeTypeSwitch(inputs, 'hourly')).toEqual({})
  })

  it('converts monthly → hourly: sets hourlyWage and raiseAmount', () => {
    const inputs = makeInputs({ incomeType: 'monthly', monthlyIncome: 3000, raiseAmount: 400 })
    const patch = syncIncomeTypeSwitch(inputs, 'hourly')
    expect(patch.incomeType).toBe('hourly')
    expect(patch.hourlyWage).toBe(monthlyToHourly(3000))
    expect(patch.raiseAmount).toBe(monthlyToHourly(400))
  })

  it('converts hourly → monthly: sets monthlyIncome and raiseAmount', () => {
    const inputs = makeInputs({ incomeType: 'hourly', hourlyWage: 16, raiseAmount: 2 })
    const patch = syncIncomeTypeSwitch(inputs, 'monthly')
    expect(patch.incomeType).toBe('monthly')
    expect(patch.monthlyIncome).toBe(hourlyToMonthly(16))
    expect(patch.raiseAmount).toBe(hourlyToMonthly(2))
  })

  it('round-trips hourly → monthly → hourly approximately equal', () => {
    const inputs = makeInputs({ incomeType: 'hourly', hourlyWage: 18.50, raiseAmount: 3.25 })
    const toMonthly = syncIncomeTypeSwitch(inputs, 'monthly')
    const monthlyInputs = makeInputs({
      incomeType: 'monthly',
      monthlyIncome: toMonthly.monthlyIncome!,
      raiseAmount: toMonthly.raiseAmount!,
    })
    const backToHourly = syncIncomeTypeSwitch(monthlyInputs, 'hourly')
    expect(backToHourly.hourlyWage).toBeCloseTo(18.50, 1)
    expect(backToHourly.raiseAmount).toBeCloseTo(3.25, 1)
  })
})
