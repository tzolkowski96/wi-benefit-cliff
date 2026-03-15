import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ProgramResult, FormState } from '../types/index.ts'
import { I18nContext, useI18nProvider } from '../hooks/useI18n.ts'
import ProgramBreakdown from './ProgramBreakdown.tsx'

function TestWrapper({ children }: { children: React.ReactNode }) {
  const i18n = useI18nProvider()
  return <I18nContext value={i18n}>{children}</I18nContext>
}

function makeProg(overrides: Partial<ProgramResult> = {}): ProgramResult {
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

function makeState(overrides: Partial<FormState> = {}): FormState {
  return {
    householdSize: 3,
    numberOfChildren: 1,
    incomeType: 'hourly',
    hourlyWage: 16,
    monthlyIncome: 2771,
    raiseAmount: 2,
    monthlyRent: 0,
    monthlyChildcareCosts: 0,
    customBadgerCareAdultValue: null,
    customBadgerCareChildValue: null,
    customWisconsinSharesValue: null,
    currentMonthlyIncome: 2771,
    raiseMonthly: 346,
    ...overrides,
  }
}

const noopUpdate = () => {}

describe('ProgramBreakdown', () => {
  it('renders all programs passed to it', () => {
    const programs = [
      makeProg({ key: 'foodshare', name: 'FoodShare' }),
      makeProg({ key: 'wheap', name: 'WHEAP' }),
      makeProg({ key: 'badgercare_adult', name: 'BadgerCare Plus (Adults)' }),
    ]
    render(<ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />, { wrapper: TestWrapper })
    expect(screen.getByText('FoodShare')).toBeTruthy()
    expect(screen.getByText('WHEAP')).toBeTruthy()
    expect(screen.getByText('BadgerCare Plus (Adults)')).toBeTruthy()
  })

  it('shows KEEP badge for eligible program that is not lost', () => {
    const programs = [makeProg({ currentlyEligible: true, lost: false })]
    render(<ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />, { wrapper: TestWrapper })
    expect(screen.getByText('KEEP')).toBeTruthy()
  })

  it('shows LOST badge for lost program', () => {
    const programs = [makeProg({ currentlyEligible: true, lost: true, eligibleAfterRaise: false })]
    render(<ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />, { wrapper: TestWrapper })
    expect(screen.getByText('LOST')).toBeTruthy()
  })

  it('shows N/A for ineligible program', () => {
    const programs = [makeProg({ currentlyEligible: false, eligibleAfterRaise: false })]
    render(<ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />, { wrapper: TestWrapper })
    expect(screen.getByText('N/A')).toBeTruthy()
  })

  it('shows tier shift badge', () => {
    const programs = [makeProg({
      key: 'school_meals_free',
      name: 'Free School Meals',
      cliffType: 'tier_shift',
      lost: true,
      currentTier: 'free',
      newTier: 'reduced',
      currentlyEligible: true,
    })]
    render(<ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />, { wrapper: TestWrapper })
    // StatusBadge renders "FREE → REDUCED" using &rarr;
    expect(screen.getByText(/FREE/)).toBeTruthy()
    expect(screen.getByText(/REDUCED/)).toBeTruthy()
  })

  it('shows dollar values for calculable programs', () => {
    const programs = [makeProg({
      calculable: true,
      currentMonthlyValue: 439,
      newMonthlyValue: 391,
      monthlyLoss: 48,
      currentlyEligible: true,
    })]
    render(<ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />, { wrapper: TestWrapper })
    expect(screen.getByText(/\$439/)).toBeTruthy()
    expect(screen.getByText(/\$391/)).toBeTruthy()
    expect(screen.getByText(/\$48/)).toBeTruthy()
  })

  it('shows eligibility text for non-calculable programs', () => {
    const programs = [makeProg({
      key: 'badgercare_adult',
      name: 'BadgerCare Plus (Adults)',
      calculable: false,
      currentMonthlyValue: null,
      newMonthlyValue: null,
      monthlyLoss: null,
      currentlyEligible: true,
    })]
    render(<ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />, { wrapper: TestWrapper })
    // The i18n key 'program.eligibilityOnly' renders "Eligibility shown"
    expect(screen.getAllByText(/Eligibility/i).length).toBeGreaterThanOrEqual(1)
  })

  it('dims ineligible programs with opacity-60', () => {
    const programs = [makeProg({ key: 'test', name: 'Test Prog', currentlyEligible: false })]
    const { container } = render(
      <ProgramBreakdown programs={programs} state={makeState()} update={noopUpdate} />,
      { wrapper: TestWrapper },
    )
    const row = container.querySelector('.opacity-60')
    expect(row).not.toBeNull()
  })
})
