/**
 * Pure-function tests for analyzeCliffs — no React, no hooks, no jsdom.
 */

import { describe, it, expect } from 'vitest'
import { analyzeCliffs } from './analyzeCliffs.ts'
import type { ProgramNameMap } from './analyzeCliffs.ts'
import type { HouseholdInputs } from '../types/index.ts'

// Use plain English names (no i18n dependency in tests)
const PROGRAM_NAMES: ProgramNameMap = {
  foodshare: 'FoodShare',
  badgercare_adult: 'BadgerCare (Adults)',
  badgercare_children: 'BadgerCare (Children)',
  wisconsin_shares: 'Wisconsin Shares',
  wheap: 'WHEAP',
  school_meals_free: 'Free School Meals',
  school_meals_reduced: 'Reduced School Meals',
}

describe('analyzeCliffs', () => {
  it('scenario 1: low-income single adult, safe raise', () => {
    const inputs: HouseholdInputs = {
      householdSize: 1,
      numberOfChildren: 0,
      currentMonthlyIncome: 1200,
      raiseMonthly: 50,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    }

    const result = analyzeCliffs(inputs, PROGRAM_NAMES)

    // Net impact should be positive (raise - small FoodShare reduction)
    expect(result.calculableImpact.netMonthly).toBeGreaterThan(0)
    expect(result.calculableImpact.raise).toBe(50)

    // Safe raise max should be $55 (BadgerCare adult limit $1,255 - $1,200)
    expect(result.safeRaiseMax).toBe(55)
    expect(result.cliffWarning).toBe(false)

    // Should have no child programs
    const programKeys = result.programs.map((p) => p.key)
    expect(programKeys).not.toContain('school_meals_free')
    expect(programKeys).not.toContain('school_meals_reduced')
    expect(programKeys).not.toContain('badgercare_children')
    expect(programKeys).not.toContain('wisconsin_shares')
  })

  it('scenario 2: family of 4, BadgerCare adult cliff triggered', () => {
    const inputs: HouseholdInputs = {
      householdSize: 4,
      numberOfChildren: 2,
      currentMonthlyIncome: 2500,
      raiseMonthly: 200,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    }

    const result = analyzeCliffs(inputs, PROGRAM_NAMES)

    // BadgerCare Adults should be lost
    const badgerCareAdults = result.programs.find((p) => p.key === 'badgercare_adult')!
    expect(badgerCareAdults.currentlyEligible).toBe(true)
    expect(badgerCareAdults.eligibleAfterRaise).toBe(false)
    expect(badgerCareAdults.lost).toBe(true)

    // BadgerCare is uncalculated, so it's in uncalculatedLosses
    expect(result.calculableImpact.uncalculatedLosses).toContain('BadgerCare (Adults)')

    // FoodShare should still be eligible
    const foodShare = result.programs.find((p) => p.key === 'foodshare')!
    expect(foodShare.currentlyEligible).toBe(true)
    expect(foodShare.eligibleAfterRaise).toBe(true)
  })

  it('scenario 7: school meal tier shift (free → reduced)', () => {
    const inputs: HouseholdInputs = {
      householdSize: 4,
      numberOfChildren: 2,
      currentMonthlyIncome: 3300,
      raiseMonthly: 200,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    }

    const result = analyzeCliffs(inputs, PROGRAM_NAMES)

    const freeProgram = result.programs.find((p) => p.key === 'school_meals_free')!
    expect(freeProgram.currentlyEligible).toBe(true)
    expect(freeProgram.eligibleAfterRaise).toBe(false)
    expect(freeProgram.currentTier).toBe('free')
    expect(freeProgram.newTier).toBe('reduced')

    // Loss should be (105 - 84) × 2 = $42/mo
    expect(freeProgram.monthlyLoss).toBe(42)
  })

  it('scenario 4: single adult above all thresholds', () => {
    const inputs: HouseholdInputs = {
      householdSize: 1,
      numberOfChildren: 0,
      currentMonthlyIncome: 3500,
      raiseMonthly: 100,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    }

    const result = analyzeCliffs(inputs, PROGRAM_NAMES)

    // No calculable losses
    expect(result.calculableImpact.netMonthly).toBe(100)
    expect(result.calculableImpact.totalCalculableLoss).toBe(0)
  })

  it('includes custom benefit values in loss calculation', () => {
    const inputs: HouseholdInputs = {
      householdSize: 1,
      numberOfChildren: 0,
      currentMonthlyIncome: 1200,
      raiseMonthly: 100,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    }

    // BadgerCare Adults limit for HH 1 is $1,255, so a $100 raise loses it
    const result = analyzeCliffs(inputs, PROGRAM_NAMES, {
      customBadgerCareAdultValue: 500,
      customBadgerCareChildValue: null,
      customWisconsinSharesValue: null,
    })

    // The custom value should be in customLosses
    expect(result.calculableImpact.customLosses).toBe(500)
    // And NOT in uncalculatedLosses
    expect(result.calculableImpact.uncalculatedLosses).not.toContain('BadgerCare (Adults)')
  })

  it('returns program names from the provided map', () => {
    const inputs: HouseholdInputs = {
      householdSize: 3,
      numberOfChildren: 1,
      currentMonthlyIncome: 2000,
      raiseMonthly: 100,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    }

    const customNames: ProgramNameMap = {
      foodshare: 'Cupones de Alimentos',
      badgercare_adult: 'BadgerCare (Adultos)',
    }

    const result = analyzeCliffs(inputs, customNames)
    const foodshare = result.programs.find((p) => p.key === 'foodshare')!
    expect(foodshare.name).toBe('Cupones de Alimentos')
  })
})
