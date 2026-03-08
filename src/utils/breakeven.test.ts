import { describe, it, expect } from 'vitest'
import { computeBreakEvenData } from './breakeven.ts'
import type { ProgramResult } from '../types/index.ts'

// Helper to create a minimal ProgramResult for testing
function makeProg(overrides: Partial<ProgramResult>): ProgramResult {
  return {
    key: 'foodshare',
    name: 'FoodShare',
    cliffType: 'gradual',
    currentlyEligible: true,
    eligibleAfterRaise: true,
    lost: false,
    distanceToCliff: 500,
    currentMonthlyValue: 400,
    newMonthlyValue: 350,
    monthlyLoss: 50,
    currentTier: null,
    newTier: null,
    color: '#2D6A4F',
    basis: '200% FPL',
    limit: 4304,
    calculable: true,
    ...overrides,
  }
}

describe('computeBreakEvenData', () => {
  it('returns empty rows when no programs are currently eligible', () => {
    const programs = [makeProg({ currentlyEligible: false })]
    const result = computeBreakEvenData(
      programs,
      { householdSize: 3, numberOfChildren: 1, currentMonthlyIncome: 5000, monthlyRent: 0, monthlyChildcareCosts: 0 },
    )
    expect(result.rows).toHaveLength(0)
    expect(result.clearAllRaise).toBeNull()
  })

  it('returns empty rows when current value is 0', () => {
    const programs = [makeProg({ currentMonthlyValue: 0 })]
    const result = computeBreakEvenData(
      programs,
      { householdSize: 3, numberOfChildren: 1, currentMonthlyIncome: 4200, monthlyRent: 0, monthlyChildcareCosts: 0 },
    )
    expect(result.rows).toHaveLength(0)
  })

  it('computes break-even for school meals cliff (HH 4, 2 children, $3,300/mo)', () => {
    // Free meal limit HH 4 = $3,380, so distance = $80
    // Crossing this cliff: free → reduced = $21/child × 2 = $42 loss
    // A raise of $81 causes $42 loss, so $81 > $42 → break-even = $81
    const programs = [
      makeProg({
        key: 'school_meals_free',
        name: 'Free School Meals',
        cliffType: 'tier_shift',
        distanceToCliff: 80,
        currentMonthlyValue: 210, // $105 × 2 children
        newMonthlyValue: 168,
        monthlyLoss: 42,
        limit: 3380,
        basis: '130% FPL',
      }),
    ]

    const result = computeBreakEvenData(
      programs,
      { householdSize: 4, numberOfChildren: 2, currentMonthlyIncome: 3300, monthlyRent: 0, monthlyChildcareCosts: 0 },
    )

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].cliffDistance).toBe(80)
    // Break-even: raise $81 causes FoodShare reduction + school meal loss
    // The break-even should be relatively small since loss ($42) < cliff distance ($80)
    expect(result.rows[0].breakEvenMonthly).toBeLessThanOrEqual(200)
    expect(result.clearAllRaise).not.toBeNull()
  })

  it('includes eligibility-only programs when custom value is set', () => {
    const programs = [
      makeProg({
        key: 'badgercare_adult',
        name: 'BadgerCare Plus (Adults)',
        cliffType: 'hard',
        calculable: false,
        currentMonthlyValue: null,
        newMonthlyValue: null,
        monthlyLoss: null,
        distanceToCliff: 100,
        limit: 2600,
      }),
    ]

    const result = computeBreakEvenData(
      programs,
      { householdSize: 4, numberOfChildren: 2, currentMonthlyIncome: 2500, monthlyRent: 0, monthlyChildcareCosts: 0 },
      { customBadgerCareAdultValue: 400, customBadgerCareChildValue: null, customWisconsinSharesValue: null },
    )

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('BadgerCare Plus (Adults)')
    // Break-even for $400 custom value: need a raise >= $400 + any FoodShare reduction
    expect(result.rows[0].breakEvenMonthly).toBeGreaterThanOrEqual(400)
  })

  it('sorts rows by cliff distance (nearest first)', () => {
    const programs = [
      makeProg({
        key: 'wheap',
        name: 'WHEAP',
        cliffType: 'hard',
        distanceToCliff: 500,
        currentMonthlyValue: 55,
        limit: 5887,
      }),
      makeProg({
        key: 'foodshare',
        name: 'FoodShare',
        distanceToCliff: 200,
        currentMonthlyValue: 400,
        limit: 5200,
      }),
    ]

    const result = computeBreakEvenData(
      programs,
      { householdSize: 4, numberOfChildren: 0, currentMonthlyIncome: 5000, monthlyRent: 0, monthlyChildcareCosts: 0 },
    )

    expect(result.rows[0].name).toBe('FoodShare')
    expect(result.rows[1].name).toBe('WHEAP')
  })
})
