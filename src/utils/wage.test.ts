import { describe, it, expect } from 'vitest'
import { hourlyToMonthly, monthlyToHourly, DEFAULT_HOURS_PER_WEEK, WEEKS_PER_MONTH } from './wage.ts'

describe('hourlyToMonthly', () => {
  it('converts $16/hr at 40 hrs/week', () => {
    // 16 × 40 × 4.33 = 2771.2, rounds to 2771
    expect(hourlyToMonthly(16)).toBe(Math.round(16 * DEFAULT_HOURS_PER_WEEK * WEEKS_PER_MONTH))
  })

  it('converts $0/hr to $0/mo', () => {
    expect(hourlyToMonthly(0)).toBe(0)
  })

  it('uses custom hours per week', () => {
    const result = hourlyToMonthly(20, 30)
    expect(result).toBe(Math.round(20 * 30 * WEEKS_PER_MONTH))
  })

  it('handles high wages', () => {
    expect(hourlyToMonthly(50)).toBe(Math.round(50 * DEFAULT_HOURS_PER_WEEK * WEEKS_PER_MONTH))
  })
})

describe('monthlyToHourly', () => {
  it('converts $2,773/mo back to ~$16/hr', () => {
    const result = monthlyToHourly(2773)
    expect(result).toBeCloseTo(16, 0)
  })

  it('converts $0/mo to $0/hr', () => {
    expect(monthlyToHourly(0)).toBe(0)
  })

  it('rounds to two decimal places', () => {
    const result = monthlyToHourly(1000)
    // Should be a clean two-decimal number
    const decimals = result.toString().split('.')[1]
    expect(!decimals || decimals.length <= 2).toBe(true)
  })

  it('uses custom hours per week', () => {
    const result = monthlyToHourly(2600, 30)
    const expected = Math.round((2600 / 30 / WEEKS_PER_MONTH) * 100) / 100
    expect(result).toBe(expected)
  })
})

describe('round-trip conversion', () => {
  it('hourly → monthly → hourly is approximately equal', () => {
    const hourly = 18.50
    const monthly = hourlyToMonthly(hourly)
    const backToHourly = monthlyToHourly(monthly)
    expect(backToHourly).toBeCloseTo(hourly, 0)
  })
})
