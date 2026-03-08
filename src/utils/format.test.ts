import { describe, it, expect } from 'vitest'
import { formatMoney, formatMoneyWithSign, formatPercent } from './format.ts'

describe('formatMoney', () => {
  it('formats positive amounts', () => {
    expect(formatMoney(1255)).toBe('$1,255')
    expect(formatMoney(500)).toBe('$500')
    expect(formatMoney(10000)).toBe('$10,000')
  })

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('$0')
  })

  it('formats negative amounts', () => {
    expect(formatMoney(-250)).toBe('-$250')
    expect(formatMoney(-1500)).toBe('-$1,500')
  })

  it('rounds to nearest dollar', () => {
    expect(formatMoney(99.49)).toBe('$99')
    expect(formatMoney(99.5)).toBe('$100')
    expect(formatMoney(1234.7)).toBe('$1,235')
  })
})

describe('formatMoneyWithSign', () => {
  it('adds + prefix for positive amounts', () => {
    expect(formatMoneyWithSign(200)).toBe('+$200')
    expect(formatMoneyWithSign(1500)).toBe('+$1,500')
  })

  it('adds + prefix for zero', () => {
    expect(formatMoneyWithSign(0)).toBe('+$0')
  })

  it('shows - prefix for negative amounts', () => {
    expect(formatMoneyWithSign(-100)).toBe('-$100')
    expect(formatMoneyWithSign(-2500)).toBe('-$2,500')
  })
})

describe('formatPercent', () => {
  it('formats integer percentages', () => {
    expect(formatPercent(50)).toBe('50%')
    expect(formatPercent(100)).toBe('100%')
    expect(formatPercent(0)).toBe('0%')
  })

  it('rounds decimal percentages', () => {
    expect(formatPercent(33.3)).toBe('33%')
    expect(formatPercent(66.7)).toBe('67%')
  })
})
