import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUrlState } from './useUrlState.ts'
import { hourlyToMonthly } from '../engine/wage.ts'

// Reset URL before each test
beforeEach(() => {
  history.replaceState(null, '', window.location.pathname)
})

describe('useUrlState', () => {
  it('returns defaults when no URL params', () => {
    const { result } = renderHook(() => useUrlState())
    const [state] = result.current
    expect(state.householdSize).toBe(3)
    expect(state.numberOfChildren).toBe(1)
    expect(state.incomeType).toBe('hourly')
    expect(state.hourlyWage).toBe(16)
  })

  it('parses monthly URL params correctly', () => {
    history.replaceState(null, '', '?hh=4&ch=2&type=monthly&inc=3300&raise=200')
    const { result } = renderHook(() => useUrlState())
    const [state] = result.current
    expect(state.householdSize).toBe(4)
    expect(state.numberOfChildren).toBe(2)
    expect(state.incomeType).toBe('monthly')
    expect(state.monthlyIncome).toBe(3300)
    expect(state.raiseAmount).toBe(200)
  })

  it('parses hourly URL params and derives monthly income', () => {
    history.replaceState(null, '', '?hh=1&ch=0&type=hourly&inc=14&raise=2')
    const { result } = renderHook(() => useUrlState())
    const [state] = result.current
    expect(state.currentMonthlyIncome).toBe(hourlyToMonthly(14))
    expect(state.raiseMonthly).toBe(hourlyToMonthly(2))
  })

  it('clamps numberOfChildren when exceeding householdSize - 1', () => {
    history.replaceState(null, '', '?hh=2&ch=5')
    const { result } = renderHook(() => useUrlState())
    const [state] = result.current
    expect(state.numberOfChildren).toBe(1)
  })

  it('updates state and URL on update call', () => {
    const { result } = renderHook(() => useUrlState())
    act(() => {
      result.current[1]({ householdSize: 4 })
    })
    expect(result.current[0].householdSize).toBe(4)
    expect(window.location.search).toContain('hh=4')
  })

  it('converts income on income type switch', () => {
    const { result } = renderHook(() => useUrlState())
    // Default is hourly with wage=16
    const monthlyBefore = result.current[0].currentMonthlyIncome
    act(() => {
      result.current[1]({ incomeType: 'monthly' })
    })
    // monthlyIncome should be preserved from hourly conversion
    expect(result.current[0].incomeType).toBe('monthly')
    expect(result.current[0].monthlyIncome).toBe(monthlyBefore)
  })

  it('parses deduction params from URL', () => {
    history.replaceState(null, '', '?hh=3&ch=1&type=hourly&inc=16&raise=2&rent=800&care=400')
    const { result } = renderHook(() => useUrlState())
    const [state] = result.current
    expect(state.monthlyRent).toBe(800)
    expect(state.monthlyChildcareCosts).toBe(400)
  })

  it('parses custom value params from URL', () => {
    history.replaceState(null, '', '?hh=4&ch=2&type=hourly&inc=14&raise=2&bca=400')
    const { result } = renderHook(() => useUrlState())
    const [state] = result.current
    expect(state.customBadgerCareAdultValue).toBe(400)
  })
})
