import { useUrlState } from './hooks/useUrlState.ts'
import { useCliffAnalysis } from './hooks/useCliffAnalysis.ts'
import HouseholdForm from './components/HouseholdForm.tsx'
import NetImpactBanner from './components/NetImpactBanner.tsx'
import CliffWarning from './components/CliffWarning.tsx'
import CliffChart from './components/CliffChart.tsx'
import ProgramBreakdown from './components/ProgramBreakdown.tsx'
import SafeRaiseZones from './components/SafeRaiseZones.tsx'
import PrintSummary from './components/PrintSummary.tsx'

export default function App() {
  const [formState, updateForm] = useUrlState()
  const analysis = useCliffAnalysis({
    householdSize: formState.householdSize,
    numberOfChildren: formState.numberOfChildren,
    currentMonthlyIncome: formState.currentMonthlyIncome,
    raiseMonthly: formState.raiseMonthly,
    monthlyRent: formState.monthlyRent,
    monthlyChildcareCosts: formState.monthlyChildcareCosts,
  }, {
    customBadgerCareAdultValue: formState.customBadgerCareAdultValue,
    customBadgerCareChildValue: formState.customBadgerCareChildValue,
    customWisconsinSharesValue: formState.customWisconsinSharesValue,
  })

  const newMonthlyIncome = formState.currentMonthlyIncome + formState.raiseMonthly

  return (
    <div className="min-h-screen bg-[#F8F6F3] text-[#1a1a1a]">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-white focus:text-[#1a1a1a]"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="bg-[#1a1a1a] text-[#F8F6F3] px-6 py-7">
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#E8A838] font-mono mb-2">
                Wisconsin Public Benefits
              </div>
              <h1 className="text-[28px] font-bold leading-tight tracking-tight m-0">
                Benefit Cliff Calculator
              </h1>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 mt-1 px-3 py-1.5 text-xs font-mono font-medium text-[#F8F6F3] border border-[#555] rounded-sm hover:border-[#E8A838] hover:text-[#E8A838] cursor-pointer"
            >
              <span aria-hidden="true">&#9113;</span> Print Summary
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2 mb-0 leading-relaxed max-w-[600px]">
            See how a raise affects your family's total benefits across
            FoodShare, BadgerCare Plus, Wisconsin Shares, WHEAP, and school
            meals. Based on 2025 eligibility thresholds from UW-Madison
            Extension.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="max-w-[720px] mx-auto px-4 py-6 pb-16">
        <HouseholdForm state={formState} update={updateForm} />
        <NetImpactBanner impact={analysis.calculableImpact} />
        <CliffWarning analysis={analysis} />
        <CliffChart
          programs={analysis.programs}
          currentMonthlyIncome={formState.currentMonthlyIncome}
          newMonthlyIncome={newMonthlyIncome}
        />
        <ProgramBreakdown programs={analysis.programs} state={formState} update={updateForm} />
        <SafeRaiseZones
          programs={analysis.programs}
          raiseMonthly={formState.raiseMonthly}
          safeRaiseMax={analysis.safeRaiseMax}
        />

        {/* Disclaimer */}
        <footer className="text-[11px] text-[#999] leading-relaxed px-1 mt-4">
          <strong>Disclaimer:</strong> This calculator provides estimates based on 2025
          income eligibility thresholds published by UW-Madison Division of Extension.
          Estimated benefit values are approximations. Actual eligibility depends on
          additional factors including assets, deductions, household composition, and
          immigration status. This tool does not replace official eligibility
          determinations through{' '}
          <a href="https://access.wisconsin.gov" target="_blank" rel="noopener noreferrer" className="text-[#666] underline">
            ACCESS Wisconsin
          </a>.
          Contact your county financial educator or call 211 (877-847-2211) for
          personalized guidance.
        </footer>

        {/* Mobile print button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="sm:hidden w-full mt-6 py-3 text-sm font-mono font-medium text-[#1a1a1a] border border-[#ccc] rounded-sm hover:border-[#1a1a1a] cursor-pointer"
        >
          <span aria-hidden="true">&#9113; </span>Print Summary
        </button>
      </main>

      {/* Print-only summary (hidden on screen, shown when printing) */}
      <PrintSummary state={formState} analysis={analysis} />
    </div>
  )
}
