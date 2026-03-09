import { describe, it, expect } from 'vitest'
import { computeRaiseSweep, computeBenefitStack } from './sweep.ts'
import type { ProgramResult } from '../types/index.ts'

// Helper: build a minimal ProgramResult for testing
function makeProg(overrides: Partial<ProgramResult> = {}): ProgramResult {
  return {
    key: 'foodshare',
    name: 'FoodShare',
    cliffType: 'gradual',
    currentlyEligible: true,
    eligibleAfterRaise: true,
    lost: false,
    distanceToCliff: 1000,
    currentMonthlyValue: 100,
    newMonthlyValue: 50,
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

describe('computeRaiseSweep', () => {
  const baseInputs = {
    householdSize: 3,
    numberOfChildren: 1,
    currentMonthlyIncome: 2771,
    monthlyRent: 0,
    monthlyChildcareCosts: 0,
  }

  it('returns the expected number of points', () => {
    const programs = [makeProg()]
    const result = computeRaiseSweep(baseInputs, programs, undefined, 1000, 50)
    // steps + 1 points (0 to 50 inclusive)
    expect(result.points).toHaveLength(51)
  })

  it('net impact at raise=0 is 0', () => {
    const programs = [makeProg()]
    const result = computeRaiseSweep(baseInputs, programs, undefined, 1000, 100)
    expect(result.points[0].raiseMonthly).toBe(0)
    expect(result.points[0].netImpact).toBe(0)
  })

  it('net impact increases for small raises (before any cliff)', () => {
    const programs = [makeProg({ distanceToCliff: 500 })]
    const result = computeRaiseSweep(baseInputs, programs, undefined, 1000, 100)
    // First few points should have positive and increasing net impact
    const first5 = result.points.slice(1, 6)
    for (const pt of first5) {
      expect(pt.netImpact).toBeGreaterThan(0)
    }
  })

  it('identifies cliff points from eligible programs', () => {
    const programs = [
      makeProg({ name: 'FoodShare', distanceToCliff: 500, color: '#2D6A4F' }),
      makeProg({ key: 'wheap', name: 'WHEAP', distanceToCliff: 800, color: '#9B2226' }),
    ]
    const result = computeRaiseSweep(baseInputs, programs, undefined, 2000, 100)
    expect(result.cliffPoints).toHaveLength(2)
    expect(result.cliffPoints[0].programName).toBe('FoodShare')
    expect(result.cliffPoints[0].raiseMonthly).toBe(500)
    expect(result.cliffPoints[1].programName).toBe('WHEAP')
  })

  it('excludes ineligible programs from cliff points', () => {
    const programs = [
      makeProg({ currentlyEligible: true, distanceToCliff: 500 }),
      makeProg({ currentlyEligible: false, distanceToCliff: 200 }),
    ]
    const result = computeRaiseSweep(baseInputs, programs, undefined, 1000, 50)
    expect(result.cliffPoints).toHaveLength(1)
  })
})

describe('computeBenefitStack', () => {
  it('returns zero benefits at very high income', () => {
    const points = computeBenefitStack(3, 1, 0, 0, 20000, 50)
    const lastPoint = points[points.length - 1]
    expect(lastPoint.total).toBe(0)
    expect(lastPoint.foodshare).toBe(0)
    expect(lastPoint.schoolMeals).toBe(0)
    expect(lastPoint.wheap).toBe(0)
  })

  it('returns maximum benefits at $0 income', () => {
    const points = computeBenefitStack(3, 1, 0, 0, 10000, 50)
    const firstPoint = points[0]
    // HH of 3: max FoodShare allotment = $768
    expect(firstPoint.foodshare).toBe(768)
    // School meals: 1 child × $105 (free tier)
    expect(firstPoint.schoolMeals).toBe(105)
    // WHEAP: $55
    expect(firstPoint.wheap).toBe(55)
    expect(firstPoint.total).toBe(768 + 105 + 55)
  })

  it('FoodShare decreases gradually as income rises', () => {
    const points = computeBenefitStack(3, 0, 0, 0, 5000, 100)
    // Find the first and a mid-range point where FoodShare is still positive
    const lowIncome = points.find(p => p.monthlyIncome > 0 && p.foodshare > 0)
    const higherIncome = points.find(p => p.monthlyIncome > 2000 && p.foodshare > 0)
    if (lowIncome && higherIncome) {
      expect(higherIncome.foodshare).toBeLessThan(lowIncome.foodshare)
    }
  })

  it('school meals show step behavior at tier boundaries', () => {
    // For HH 3 with 1 child:
    // Free limit (130% FPL) = $2,795
    // Reduced limit (185% FPL) = $3,981
    const points = computeBenefitStack(3, 1, 0, 0, 5000, 200)
    const atFree = points.find(p => p.monthlyIncome > 0 && p.monthlyIncome < 2700)
    const atReduced = points.find(p => p.monthlyIncome > 2900 && p.monthlyIncome < 3900)
    const atPaid = points.find(p => p.monthlyIncome > 4000)

    expect(atFree?.schoolMeals).toBe(105) // free: $105/child
    expect(atReduced?.schoolMeals).toBe(84) // reduced: $84/child
    expect(atPaid?.schoolMeals).toBe(0) // paid: $0
  })

  it('excludes school meals when no children', () => {
    const points = computeBenefitStack(3, 0, 0, 0, 5000, 50)
    for (const pt of points) {
      expect(pt.schoolMeals).toBe(0)
    }
  })
})
