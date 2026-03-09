import { describe, it, expect } from 'vitest'
import {
  calculateFoodShareBenefit,
  getSchoolMealTier,
  getSchoolMealValue,
  getSchoolMealLoss,
  isEligible,
  getDistanceToCliff,
} from './calculations.ts'

// ---------------------------------------------------------------------------
// FoodShare benefit calculation
// ---------------------------------------------------------------------------

describe('calculateFoodShareBenefit', () => {
  it('calculates basic benefit for HH of 1 at $1,200/mo', () => {
    // Net = $1,200 - $198 (std) - $240 (20% earned) = $762
    // Benefit = $292 - 0.30 * $762 = $292 - $228.60 = $63.40 → $63
    const benefit = calculateFoodShareBenefit(1200, 1)
    expect(benefit).toBe(63)
  })

  it('returns 0 when gross income exceeds 200% FPL', () => {
    // 200% FPL for HH 3 = $4,304
    expect(calculateFoodShareBenefit(4305, 3)).toBe(0)
    expect(calculateFoodShareBenefit(5000, 3)).toBe(0)
  })

  it('returns 0 when net income exceeds 100% FPL (Scenario 3 edge case)', () => {
    // HH 3 at $4,200/mo: gross < $4,304 (200% FPL) but...
    // Net = $4,200 - $198 - $840 = $3,162 > $2,152 (100% FPL)
    expect(calculateFoodShareBenefit(4200, 3)).toBe(0)
  })

  it('calculates benefit for HH of 4 at $2,500/mo', () => {
    // Std deduction for HH 4 = $213
    // Earned income deduction = 0.20 * $2,500 = $500
    // Net = $2,500 - $213 - $500 = $1,787
    // Net limit 100% FPL HH 4 = $2,600 → passes
    // Benefit = $975 - 0.30 * $1,787 = $975 - $536.10 = $438.90 → $439
    expect(calculateFoodShareBenefit(2500, 4)).toBe(439)
  })

  it('calculates benefit reduction from a raise (Scenario 1)', () => {
    const before = calculateFoodShareBenefit(1200, 1)
    const after = calculateFoodShareBenefit(1250, 1)
    expect(before).toBeGreaterThan(after)
    const loss = before - after
    // ~$12 loss for a $50 raise (0.30 * (50 - 0.20*50) = 0.30*40 = 12)
    expect(loss).toBe(12)
  })

  it('applies shelter deduction when rent is provided', () => {
    const withoutRent = calculateFoodShareBenefit(2000, 3, 0, 0)
    const withRent = calculateFoodShareBenefit(2000, 3, 800, 0)
    // With rent, benefit should be higher (more deductions → lower net)
    expect(withRent).toBeGreaterThan(withoutRent)
  })

  it('applies dependent care deduction when childcare is provided', () => {
    const withoutCare = calculateFoodShareBenefit(2000, 3, 0, 0)
    const withCare = calculateFoodShareBenefit(2000, 3, 0, 500)
    expect(withCare).toBeGreaterThan(withoutCare)
  })

  it('applies both deductions together', () => {
    const base = calculateFoodShareBenefit(2500, 4, 0, 0)
    const withBoth = calculateFoodShareBenefit(2500, 4, 1000, 600)
    expect(withBoth).toBeGreaterThan(base)
  })

  it('never returns negative', () => {
    // Very high income, even with deductions
    expect(calculateFoodShareBenefit(4000, 1)).toBe(0)
  })

  it('returns max allotment for zero income', () => {
    // Net income = 0 - 198 - 0 = max(0, ...) = 0
    // Benefit = max allotment - 0.30 * 0 = max allotment
    expect(calculateFoodShareBenefit(0, 1)).toBe(292)
    expect(calculateFoodShareBenefit(0, 3)).toBe(768)
  })
})

// ---------------------------------------------------------------------------
// School meal tier
// ---------------------------------------------------------------------------

describe('getSchoolMealTier', () => {
  it('returns free below 130% FPL', () => {
    // 130% FPL for HH 4 = $3,380
    expect(getSchoolMealTier(3000, 4)).toBe('free')
    expect(getSchoolMealTier(3380, 4)).toBe('free')
  })

  it('returns reduced between 130% and 185% FPL', () => {
    // 130% FPL HH 4 = $3,380, 185% FPL HH 4 = $4,810
    expect(getSchoolMealTier(3381, 4)).toBe('reduced')
    expect(getSchoolMealTier(4810, 4)).toBe('reduced')
  })

  it('returns paid above 185% FPL', () => {
    expect(getSchoolMealTier(4811, 4)).toBe('paid')
    expect(getSchoolMealTier(6000, 4)).toBe('paid')
  })
})

// ---------------------------------------------------------------------------
// School meal value
// ---------------------------------------------------------------------------

describe('getSchoolMealValue', () => {
  it('returns $105/child for free tier', () => {
    expect(getSchoolMealValue('free', 1)).toBe(105)
    expect(getSchoolMealValue('free', 2)).toBe(210)
    expect(getSchoolMealValue('free', 3)).toBe(315)
  })

  it('returns $84/child for reduced tier', () => {
    expect(getSchoolMealValue('reduced', 1)).toBe(84)
    expect(getSchoolMealValue('reduced', 2)).toBe(168)
  })

  it('returns $0 for paid tier', () => {
    expect(getSchoolMealValue('paid', 3)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// School meal loss (tier-aware)
// ---------------------------------------------------------------------------

describe('getSchoolMealLoss', () => {
  it('calculates free → reduced loss as $21/child (Scenario 7)', () => {
    expect(getSchoolMealLoss('free', 'reduced', 1)).toBe(21)
    expect(getSchoolMealLoss('free', 'reduced', 2)).toBe(42)
  })

  it('calculates free → paid loss as $105/child', () => {
    expect(getSchoolMealLoss('free', 'paid', 1)).toBe(105)
    expect(getSchoolMealLoss('free', 'paid', 2)).toBe(210)
  })

  it('calculates reduced → paid loss as $84/child', () => {
    expect(getSchoolMealLoss('reduced', 'paid', 1)).toBe(84)
    expect(getSchoolMealLoss('reduced', 'paid', 2)).toBe(168)
  })

  it('returns 0 for same tier', () => {
    expect(getSchoolMealLoss('free', 'free', 2)).toBe(0)
    expect(getSchoolMealLoss('reduced', 'reduced', 2)).toBe(0)
    expect(getSchoolMealLoss('paid', 'paid', 2)).toBe(0)
  })

  it('returns 0 for upgrade (paid → reduced)', () => {
    expect(getSchoolMealLoss('paid', 'reduced', 2)).toBe(0)
    expect(getSchoolMealLoss('paid', 'free', 2)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// General eligibility helpers
// ---------------------------------------------------------------------------

describe('isEligible', () => {
  it('returns true when income <= limit', () => {
    expect(isEligible(1000, 1255)).toBe(true)
    expect(isEligible(1255, 1255)).toBe(true)
  })

  it('returns false when income > limit', () => {
    expect(isEligible(1256, 1255)).toBe(false)
  })
})

describe('getDistanceToCliff', () => {
  it('returns remaining buffer', () => {
    expect(getDistanceToCliff(1200, 1255)).toBe(55)
    expect(getDistanceToCliff(1000, 2510)).toBe(1510)
  })

  it('returns 0 when at or over limit', () => {
    expect(getDistanceToCliff(1255, 1255)).toBe(0)
    expect(getDistanceToCliff(1300, 1255)).toBe(0)
  })
})
