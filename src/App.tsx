import { useUrlState } from './hooks/useUrlState.ts'
import { useCliffAnalysis } from './hooks/useCliffAnalysis.ts'
import { useI18n } from './hooks/useI18n.ts'
import HouseholdForm from './components/HouseholdForm.tsx'
import NetImpactBanner from './components/NetImpactBanner.tsx'
import CliffWarning from './components/CliffWarning.tsx'
import CliffChart from './components/CliffChart.tsx'
import ProgramBreakdown from './components/ProgramBreakdown.tsx'
import SafeRaiseZones from './components/SafeRaiseZones.tsx'
import BreakEvenCalculator from './components/BreakEvenCalculator.tsx'
import WaterfallChart from './components/WaterfallChart.tsx'
import IncomeSweepChart from './components/IncomeSweepChart.tsx'
import BenefitStackChart from './components/BenefitStackChart.tsx'
import BreakEvenDotPlot from './components/BreakEvenDotPlot.tsx'
import PrintSummary from './components/PrintSummary.tsx'

export default function App() {
  const [formState, updateForm] = useUrlState()
  const { t, lang, setLang } = useI18n()
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

  const handleExcelExport = async () => {
    const { exportToExcel } = await import('./utils/excel.ts')
    await exportToExcel(formState, analysis, t, lang)
  }

  return (
    <div className="min-h-screen bg-[#F8F6F3] text-[#1a1a1a]">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-white focus:text-[#1a1a1a]"
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Header */}
      <header className="bg-[#1a1a1a] text-[#F8F6F3] px-6 py-7">
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#E8A838] font-mono mb-2">
                {t('app.subtitle')}
              </div>
              <h1 className="text-[28px] font-bold leading-tight tracking-tight m-0">
                {t('app.title')}
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {/* Language toggle */}
              <div className="flex text-xs font-mono font-medium" role="radiogroup" aria-label={t('a11y.language')}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={lang === 'en'}
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 border border-r-0 rounded-l-sm cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[#E8A838] text-[#1a1a1a] border-[#E8A838]'
                      : 'text-[#999] border-[#555] hover:text-[#F8F6F3]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={lang === 'es'}
                  onClick={() => setLang('es')}
                  className={`px-2 py-1 border rounded-r-sm cursor-pointer ${
                    lang === 'es'
                      ? 'bg-[#E8A838] text-[#1a1a1a] border-[#E8A838]'
                      : 'text-[#999] border-[#555] hover:text-[#F8F6F3]'
                  }`}
                >
                  ES
                </button>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#F8F6F3] border border-[#555] rounded-sm hover:border-[#E8A838] hover:text-[#E8A838] cursor-pointer"
              >
                <span aria-hidden="true">&#9113;</span> {t('print.button')}
              </button>
              <button
                type="button"
                onClick={handleExcelExport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#F8F6F3] border border-[#555] rounded-sm hover:border-[#E8A838] hover:text-[#E8A838] cursor-pointer"
              >
                <span aria-hidden="true">&#8615;</span> {t('export.button')}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2 mb-0 leading-relaxed max-w-[600px]">
            {t('app.description')}{' '}
            {t('app.source')}
          </p>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="max-w-[720px] mx-auto px-4 py-6 pb-16">
        <HouseholdForm state={formState} update={updateForm} />
        <NetImpactBanner impact={analysis.calculableImpact} />
        <CliffWarning analysis={analysis} />
        <WaterfallChart impact={analysis.calculableImpact} />
        <CliffChart
          programs={analysis.programs}
          currentMonthlyIncome={formState.currentMonthlyIncome}
          newMonthlyIncome={newMonthlyIncome}
        />
        <IncomeSweepChart programs={analysis.programs} state={formState} safeRaiseMax={analysis.safeRaiseMax} />
        <BenefitStackChart state={formState} />
        <ProgramBreakdown programs={analysis.programs} state={formState} update={updateForm} />
        <SafeRaiseZones
          programs={analysis.programs}
          raiseMonthly={formState.raiseMonthly}
          safeRaiseMax={analysis.safeRaiseMax}
        />
        <BreakEvenCalculator programs={analysis.programs} state={formState} />
        <BreakEvenDotPlot programs={analysis.programs} state={formState} />

        {/* Disclaimer */}
        <footer className="text-[11px] text-[#999] leading-relaxed px-1 mt-4">
          <strong>{t('label.disclaimer')}:</strong> {t('disclaimer.text')}{' '}
          <a href="https://access.wisconsin.gov" target="_blank" rel="noopener noreferrer" className="text-[#666] underline">
            {t('disclaimer.accessWi')}
          </a>{' '}
          {t('disclaimer.contact')}
        </footer>

        {/* Mobile action buttons */}
        <div className="sm:hidden flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 text-sm font-mono font-medium text-[#1a1a1a] border border-[#ccc] rounded-sm hover:border-[#1a1a1a] cursor-pointer"
          >
            <span aria-hidden="true">&#9113; </span>{t('print.button')}
          </button>
          <button
            type="button"
            onClick={handleExcelExport}
            className="flex-1 py-3 text-sm font-mono font-medium text-[#1a1a1a] border border-[#ccc] rounded-sm hover:border-[#1a1a1a] cursor-pointer"
          >
            <span aria-hidden="true">&#8615; </span>{t('export.button')}
          </button>
        </div>
      </main>

      {/* Print-only summary (hidden on screen, shown when printing) */}
      <PrintSummary state={formState} analysis={analysis} />
    </div>
  )
}
