import { describe, it, expect } from 'vitest'
import { getFpl100, getFplAtPercent, FPL_100 } from './fpl.ts'

describe('getFpl100', () => {
  it('returns correct values for household sizes 1-8', () => {
    expect(getFpl100(1)).toBe(1255)
    expect(getFpl100(2)).toBe(1704)
    expect(getFpl100(3)).toBe(2152)
    expect(getFpl100(4)).toBe(2600)
    expect(getFpl100(5)).toBe(3049)
    expect(getFpl100(6)).toBe(3497)
    expect(getFpl100(7)).toBe(3946)
    expect(getFpl100(8)).toBe(4394)
  })

  it('extrapolates for household size > 8', () => {
    expect(getFpl100(9)).toBe(4394 + 449)
    expect(getFpl100(10)).toBe(4394 + 449 * 2)
  })
})

describe('getFplAtPercent', () => {
  it('returns correct 100% FPL values', () => {
    for (let hh = 1; hh <= 8; hh++) {
      expect(getFplAtPercent(100, hh)).toBe(FPL_100[hh])
    }
  })

  it('returns correct 130% FPL values (school meals free)', () => {
    expect(getFplAtPercent(130, 1)).toBe(1631)
    expect(getFplAtPercent(130, 4)).toBe(3380)
    expect(getFplAtPercent(130, 8)).toBe(5712)
  })

  it('returns correct 185% FPL values (school meals reduced)', () => {
    expect(getFplAtPercent(185, 1)).toBe(2322)
    expect(getFplAtPercent(185, 4)).toBe(4810)
    expect(getFplAtPercent(185, 8)).toBe(8128)
  })

  it('returns correct 200% FPL values (FoodShare)', () => {
    expect(getFplAtPercent(200, 1)).toBe(2510)
    expect(getFplAtPercent(200, 2)).toBe(3408)
    expect(getFplAtPercent(200, 3)).toBe(4304)
    expect(getFplAtPercent(200, 4)).toBe(5200)
    expect(getFplAtPercent(200, 8)).toBe(8794)
  })

  it('returns correct 306% FPL values (BadgerCare Children)', () => {
    expect(getFplAtPercent(306, 1)).toBe(3840)
    expect(getFplAtPercent(306, 4)).toBe(7956)
    expect(getFplAtPercent(306, 8)).toBe(13446)
  })

  it('extrapolates > 8 for published percentages', () => {
    // 200% FPL per-additional = 898
    expect(getFplAtPercent(200, 9)).toBe(8794 + 898)
    expect(getFplAtPercent(200, 10)).toBe(8794 + 898 * 2)
  })

  it('falls back to scaling for non-published percentages', () => {
    // 150% FPL is not in the table, should scale from 100%
    const result = getFplAtPercent(150, 4)
    expect(result).toBe(Math.round(2600 * 1.5))
  })
})
