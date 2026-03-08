import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCliffAnalysis } from './useCliffAnalysis.ts'
import type { HouseholdInputs } from '../types/index.ts'

function analyze(inputs: HouseholdInputs) {
  const { result } = renderHook(() => useCliffAnalysis(inputs))
  return result.current
}

function findProgram(analysis: ReturnType<typeof analyze>, key: string) {
  return analysis.programs.find(p => p.key === key)
}

describe('useCliffAnalysis — CLAUDE.md scenarios', () => {
  // Scenario 1: Low-income single adult, safe raise
  it('Scenario 1: HH=1, 0 children, $1,200/mo, $50 raise → net +$38', () => {
    const a = analyze({
      householdSize: 1,
      numberOfChildren: 0,
      currentMonthlyIncome: 1200,
      raiseMonthly: 50,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    })

    // BadgerCare Adults: eligible (limit $1,255), buffer $55
    const bc = findProgram(a, 'badgercare_adult')!
    expect(bc.currentlyEligible).toBe(true)
    expect(bc.lost).toBe(false)
    expect(bc.distanceToCliff).toBe(55)

    // FoodShare: keep, benefit decreases ~$12
    const fs = findProgram(a, 'foodshare')!
    expect(fs.currentlyEligible).toBe(true)
    expect(fs.lost).toBe(false)
    expect(a.calculableImpact.foodshareLoss).toBe(12)

    // WHEAP: keep
    const wh = findProgram(a, 'wheap')!
    expect(wh.currentlyEligible).toBe(true)
    expect(wh.lost).toBe(false)

    // No child programs
    expect(findProgram(a, 'school_meals_free')).toBeUndefined()
    expect(findProgram(a, 'school_meals_reduced')).toBeUndefined()
    expect(findProgram(a, 'badgercare_children')).toBeUndefined()
    expect(findProgram(a, 'wisconsin_shares')).toBeUndefined()

    // Net impact: +$50 - $12 = +$38
    expect(a.calculableImpact.netMonthly).toBe(38)
    expect(a.safeRaiseMax).toBe(55)
  })

  // Scenario 2: Family of 4, raise triggers BadgerCare adult cliff
  it('Scenario 2: HH=4, 2 children, $2,500/mo, $200 raise → net +$152, BadgerCare lost', () => {
    const a = analyze({
      householdSize: 4,
      numberOfChildren: 2,
      currentMonthlyIncome: 2500,
      raiseMonthly: 200,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    })

    // BadgerCare Adults: LOST (limit $2,600, new income $2,700)
    const bc = findProgram(a, 'badgercare_adult')!
    expect(bc.currentlyEligible).toBe(true)
    expect(bc.lost).toBe(true)

    // BadgerCare Children: keep (limit $7,956)
    const bcc = findProgram(a, 'badgercare_children')!
    expect(bcc.currentlyEligible).toBe(true)
    expect(bcc.lost).toBe(false)

    // FoodShare: keep, benefit decreases ~$48
    const fs = findProgram(a, 'foodshare')!
    expect(fs.currentlyEligible).toBe(true)
    expect(fs.lost).toBe(false)
    expect(a.calculableImpact.foodshareLoss).toBe(48)

    // Free School Meals: keep (limit $3,380)
    const sm = findProgram(a, 'school_meals_free')!
    expect(sm.currentlyEligible).toBe(true)
    expect(sm.lost).toBe(false)

    // Net calculable = +$200 - $48 = +$152
    expect(a.calculableImpact.netMonthly).toBe(152)

    // BadgerCare Adults in uncalculated losses
    expect(a.calculableImpact.uncalculatedLosses).toContain('BadgerCare Plus (Adults)')
    expect(a.cliffWarning).toBe(false)
  })

  // Scenario 3: Family of 3, FoodShare already $0 (under gross but over net)
  it('Scenario 3: HH=3, 1 child, $4,200/mo, $200 raise → net +$200', () => {
    const a = analyze({
      householdSize: 3,
      numberOfChildren: 1,
      currentMonthlyIncome: 4200,
      raiseMonthly: 200,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    })

    // FoodShare: currently eligible (gross $4,200 < $4,304) but benefit = $0
    const fs = findProgram(a, 'foodshare')!
    expect(fs.currentlyEligible).toBe(true)
    expect(fs.currentMonthlyValue).toBe(0)
    expect(a.calculableImpact.foodshareLoss).toBe(0)

    // After raise: $4,400 > $4,304 → LOST, but $0 value impact
    expect(fs.lost).toBe(true)

    // School meals: already ineligible for free ($4,200 > $2,795)
    // and for reduced ($4,200 > $3,981)
    const smf = findProgram(a, 'school_meals_free')!
    expect(smf.currentlyEligible).toBe(false)

    // BadgerCare Adults: already ineligible ($4,200 > $2,152)
    const bc = findProgram(a, 'badgercare_adult')!
    expect(bc.currentlyEligible).toBe(false)

    // BadgerCare Children: keep (limit $6,585)
    const bcc = findProgram(a, 'badgercare_children')!
    expect(bcc.currentlyEligible).toBe(true)
    expect(bcc.lost).toBe(false)

    // Net impact = +$200 (no calculable losses)
    expect(a.calculableImpact.netMonthly).toBe(200)
  })

  // Scenario 4: Single adult above all thresholds
  it('Scenario 4: HH=1, 0 children, $3,500/mo, $100 raise → net +$100', () => {
    const a = analyze({
      householdSize: 1,
      numberOfChildren: 0,
      currentMonthlyIncome: 3500,
      raiseMonthly: 100,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    })

    // All programs should be ineligible
    for (const prog of a.programs) {
      expect(prog.currentlyEligible).toBe(false)
    }

    expect(a.calculableImpact.netMonthly).toBe(100)
    expect(a.calculableImpact.totalCalculableLoss).toBe(0)
  })

  // Scenario 5: Family of 4 near multiple cliffs, FoodShare benefit already $0
  it('Scenario 5: HH=4, 3 children, $5,100/mo, $200 raise → net +$200', () => {
    const a = analyze({
      householdSize: 4,
      numberOfChildren: 3,
      currentMonthlyIncome: 5100,
      raiseMonthly: 200,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    })

    // FoodShare: gross $5,100 < $5,200 but net exceeds 100% FPL → benefit $0
    const fs = findProgram(a, 'foodshare')!
    expect(fs.currentlyEligible).toBe(true)
    expect(fs.currentMonthlyValue).toBe(0)

    // School meals reduced: already ineligible ($5,100 > $4,810)
    // WHEAP: keep (limit $5,887)
    const wh = findProgram(a, 'wheap')!
    expect(wh.currentlyEligible).toBe(true)
    expect(wh.lost).toBe(false)

    // Net: +$200 (no calculable losses since FoodShare was $0)
    expect(a.calculableImpact.netMonthly).toBe(200)
  })

  // Scenario 7: School meal tier shift (free → reduced)
  it('Scenario 7: HH=4, 2 children, $3,300/mo, $200 raise → school meal loss $42', () => {
    const a = analyze({
      householdSize: 4,
      numberOfChildren: 2,
      currentMonthlyIncome: 3300,
      raiseMonthly: 200,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    })

    // Free meal limit HH 4 = $3,380
    // Current: $3,300 < $3,380 → free
    // After: $3,500 > $3,380, < $4,810 → reduced
    const smf = findProgram(a, 'school_meals_free')!
    expect(smf.currentlyEligible).toBe(true)
    expect(smf.lost).toBe(true)
    expect(smf.currentTier).toBe('free')
    expect(smf.newTier).toBe('reduced')

    // School meal loss = ($105 - $84) × 2 = $42
    expect(a.calculableImpact.schoolMealLoss).toBe(42)
  })
})

describe('useCliffAnalysis — custom benefit values', () => {
  it('includes custom BadgerCare value in net impact when program is lost', () => {
    const a = renderHook(() => useCliffAnalysis(
      {
        householdSize: 4,
        numberOfChildren: 2,
        currentMonthlyIncome: 2500,
        raiseMonthly: 200,
        monthlyRent: 0,
        monthlyChildcareCosts: 0,
      },
      {
        customBadgerCareAdultValue: 400,
        customBadgerCareChildValue: null,
        customWisconsinSharesValue: null,
      },
    )).result.current

    // BadgerCare adult is lost at $2,700 > $2,600
    expect(a.calculableImpact.customLosses).toBe(400)
    // Net = $200 raise - $48 FoodShare - $400 custom = -$248
    expect(a.calculableImpact.netMonthly).toBe(200 - 48 - 400)
    expect(a.cliffWarning).toBe(true)
    // Should NOT be in uncalculated losses since user provided a value
    expect(a.calculableImpact.uncalculatedLosses).not.toContain('BadgerCare Plus (Adults)')
  })
})

describe('useCliffAnalysis — deduction inputs', () => {
  it('shelter deduction increases FoodShare benefit', () => {
    const withoutRent = analyze({
      householdSize: 3,
      numberOfChildren: 1,
      currentMonthlyIncome: 2000,
      raiseMonthly: 100,
      monthlyRent: 0,
      monthlyChildcareCosts: 0,
    })

    const withRent = analyze({
      householdSize: 3,
      numberOfChildren: 1,
      currentMonthlyIncome: 2000,
      raiseMonthly: 100,
      monthlyRent: 800,
      monthlyChildcareCosts: 0,
    })

    const fsWithout = findProgram(withoutRent, 'foodshare')!
    const fsWith = findProgram(withRent, 'foodshare')!
    expect(fsWith.currentMonthlyValue!).toBeGreaterThan(fsWithout.currentMonthlyValue!)
  })
})
