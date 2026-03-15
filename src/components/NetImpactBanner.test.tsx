import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { MonthlyImpact } from '../types/index.ts'
import { I18nContext, useI18nProvider } from '../hooks/useI18n.ts'
import NetImpactBanner from './NetImpactBanner.tsx'

function TestWrapper({ children }: { children: React.ReactNode }) {
  const i18n = useI18nProvider()
  return <I18nContext value={i18n}>{children}</I18nContext>
}

function makeImpact(overrides: Partial<MonthlyImpact> = {}): MonthlyImpact {
  return {
    raise: 200,
    foodshareLoss: 0,
    schoolMealLoss: 0,
    wheapLoss: 0,
    customLosses: 0,
    totalCalculableLoss: 0,
    netMonthly: 200,
    netAnnual: 2400,
    uncalculatedLosses: [],
    ...overrides,
  }
}

describe('NetImpactBanner', () => {
  it('renders positive net impact with correct values', () => {
    const impact = makeImpact({ netMonthly: 152, netAnnual: 1824, raise: 200, foodshareLoss: 48, totalCalculableLoss: 48 })
    render(<NetImpactBanner impact={impact} />, { wrapper: TestWrapper })
    expect(screen.getByText(/\+\$152/)).toBeTruthy()
    expect(screen.getByText(/\+\$1,824/)).toBeTruthy()
  })

  it('renders negative net impact', () => {
    const impact = makeImpact({ netMonthly: -248, netAnnual: -2976, totalCalculableLoss: 448 })
    render(<NetImpactBanner impact={impact} />, { wrapper: TestWrapper })
    expect(screen.getByText(/-\$248/)).toBeTruthy()
  })

  it('renders zero losses as $0', () => {
    const impact = makeImpact({ totalCalculableLoss: 0 })
    render(<NetImpactBanner impact={impact} />, { wrapper: TestWrapper })
    expect(screen.getByText('$0')).toBeTruthy()
  })

  it('shows uncalculated losses warning', () => {
    const impact = makeImpact({ uncalculatedLosses: ['BadgerCare Plus (Adults)'] })
    render(<NetImpactBanner impact={impact} />, { wrapper: TestWrapper })
    expect(screen.getByText(/BadgerCare Plus \(Adults\)/)).toBeTruthy()
  })

  it('hides uncalculated losses warning when empty', () => {
    const impact = makeImpact({ uncalculatedLosses: [] })
    const { container } = render(<NetImpactBanner impact={impact} />, { wrapper: TestWrapper })
    // The warning box should not be present
    expect(container.querySelector('.bg-\\[\\#FFF8E1\\]')).toBeNull()
  })

  it('shows user-entered loss note', () => {
    const impact = makeImpact({ customLosses: 400 })
    render(<NetImpactBanner impact={impact} />, { wrapper: TestWrapper })
    expect(screen.getByText(/\$400/)).toBeTruthy()
  })
})
