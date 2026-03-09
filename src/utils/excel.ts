/**
 * Excel (.xlsx) workbook export — generates a 6-sheet workbook from the
 * app's full computed data and triggers a browser download.
 *
 * The `xlsx` library is dynamically imported so it only loads when the user
 * clicks the export button (~90 KB gzipped, code-split into its own chunk).
 */

import type { FormState, CliffAnalysis, ProgramResult } from '../types/index.ts'
import type { I18nKey } from '../i18n/en.ts'
import { DATE_LOCALE, type Lang } from '../hooks/useI18n.ts'
import { computeBreakEvenData } from './breakeven.ts'
import { computeRaiseSweep, computeBenefitStack } from './sweep.ts'
import { monthlyToHourly } from './wage.ts'
import { toBreakEvenInputs, toCustomBenefitValues } from './formHelpers.ts'
import { PROGRAMS, FOODSHARE_MAX_ALLOTMENT, FREE_MEAL_VALUE_PER_CHILD, REDUCED_MEAL_VALUE_PER_CHILD, WHEAP_MONTHLY_VALUE, getFoodShareStandardDeduction } from '../data/programs.ts'
import { FPL_100 } from '../data/fpl.ts'
import { SMI_60, SMI_85 } from '../data/smi.ts'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function exportToExcel(
  state: FormState,
  analysis: CliffAnalysis,
  t: (key: I18nKey) => string,
  lang: Lang = 'en',
): Promise<void> {
  const XLSX = await import('xlsx')

  const wb = XLSX.utils.book_new()

  addSummarySheet(XLSX, wb, state, analysis, t, lang)
  addProgramStatusSheet(XLSX, wb, analysis.programs, t)
  addBreakEvenSheet(XLSX, wb, state, analysis, t)
  addSensitivitySheet(XLSX, wb, state, analysis, t)
  addBenefitLevelsSheet(XLSX, wb, state, t)
  addReferenceSheet(XLSX, wb, t)

  const filename = `${t('export.filename')}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ---------------------------------------------------------------------------
// Helper: typed XLSX reference
// ---------------------------------------------------------------------------

type XLSXModule = typeof import('xlsx')

// ---------------------------------------------------------------------------
// Sheet 1: Scenario Summary
// ---------------------------------------------------------------------------

function addSummarySheet(
  XLSX: XLSXModule,
  wb: import('xlsx').WorkBook,
  state: FormState,
  analysis: CliffAnalysis,
  t: (key: I18nKey) => string,
  lang: Lang,
) {
  const { calculableImpact, safeRaiseMax } = analysis
  const rows = [
    [t('print.householdDetails'), ''],
    [t('form.householdSize'), state.householdSize],
    [t('form.numberOfChildren'), state.numberOfChildren],
    [t('form.monthlyIncome'), state.currentMonthlyIncome],
    [t('form.raise.monthly'), state.raiseMonthly],
    [t('print.newMonthlyIncome'), state.currentMonthlyIncome + state.raiseMonthly],
    [t('form.rent'), state.monthlyRent],
    [t('form.childcare'), state.monthlyChildcareCosts],
    ['', ''],
    [t('print.netImpact'), ''],
    [`${t('result.netImpact')} (${t('unit.perMonth')})`, calculableImpact.netMonthly],
    [`${t('result.netAnnual')} (${t('unit.perYear')})`, calculableImpact.netAnnual],
    [`${t('result.raise')} (${t('unit.perMonth')})`, calculableImpact.raise],
    [t('print.foodshareLoss'), -calculableImpact.foodshareLoss],
    [t('print.schoolMealLoss'), -calculableImpact.schoolMealLoss],
    [t('print.wheapLoss'), -calculableImpact.wheapLoss],
    ...(calculableImpact.customLosses > 0 ? [[t('print.userEnteredLoss'), -calculableImpact.customLosses]] : []),
    ['', ''],
    [t('print.safeRaise'), safeRaiseMax > 0 ? safeRaiseMax : 0],
    ['', ''],
    ...(calculableImpact.uncalculatedLosses.length > 0
      ? [[t('result.notIncluded'), calculableImpact.uncalculatedLosses.join(', ')]]
      : []),
    ['', ''],
    [t('print.generated'), new Date().toLocaleDateString(DATE_LOCALE[lang] ?? 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    [t('label.disclaimer'), t('disclaimer.text')],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [{ wch: 30 }, { wch: 50 }]

  XLSX.utils.book_append_sheet(wb, ws, t('export.sheetSummary'))
}

// ---------------------------------------------------------------------------
// Sheet 2: Program Status
// ---------------------------------------------------------------------------

function addProgramStatusSheet(
  XLSX: XLSXModule,
  wb: import('xlsx').WorkBook,
  programs: ProgramResult[],
  t: (key: I18nKey) => string,
) {
  const header = [
    t('print.program'),
    t('print.type'),
    t('excel.basis'),
    t('print.threshold'),
    t('excel.eligibleNow'),
    t('excel.eligibleAfter'),
    t('print.status'),
    t('excel.distanceToCliff'),
    t('excel.currentValue'),
    t('excel.newValue'),
    t('excel.monthlyLoss'),
  ]

  const rows = programs.map((p) => [
    p.name,
    t(('cliffType.' + p.cliffType) as I18nKey),
    p.basis,
    p.limit,
    p.currentlyEligible ? t('label.yes') : t('label.no'),
    p.eligibleAfterRaise ? t('label.yes') : t('label.no'),
    getStatusText(p, t),
    p.currentlyEligible ? p.distanceToCliff : '',
    p.currentMonthlyValue ?? '',
    p.newMonthlyValue ?? '',
    p.monthlyLoss ?? '',
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 14 }, { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, t('export.sheetPrograms'))
}

// ---------------------------------------------------------------------------
// Sheet 3: Break-Even Analysis
// ---------------------------------------------------------------------------

function addBreakEvenSheet(
  XLSX: XLSXModule,
  wb: import('xlsx').WorkBook,
  state: FormState,
  analysis: CliffAnalysis,
  t: (key: I18nKey) => string,
) {
  const { rows, clearAllRaise } = computeBreakEvenData(
    analysis.programs,
    toBreakEvenInputs(state),
    toCustomBenefitValues(state),
  )

  const header = [
    t('print.program'),
    t('excel.cliffDistanceCol'),
    t('excel.breakEvenMo'),
    t('excel.breakEvenHr'),
  ]

  const dataRows = rows.map((r) => [
    r.name,
    r.cliffDistance,
    r.breakEvenMonthly,
    monthlyToHourly(r.breakEvenMonthly),
  ])

  // Add "Clear All" summary row if applicable
  if (clearAllRaise !== null && rows.length > 1) {
    dataRows.push([
      t('breakEven.clearAll'),
      '',
      clearAllRaise,
      monthlyToHourly(clearAllRaise),
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows])
  ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 22 }, { wch: 22 }]

  XLSX.utils.book_append_sheet(wb, ws, t('export.sheetBreakEven'))
}

// ---------------------------------------------------------------------------
// Sheet 4: Income Sensitivity (200 rows)
// ---------------------------------------------------------------------------

function addSensitivitySheet(
  XLSX: XLSXModule,
  wb: import('xlsx').WorkBook,
  state: FormState,
  analysis: CliffAnalysis,
  t: (key: I18nKey) => string,
) {
  const { points } = computeRaiseSweep(
    toBreakEvenInputs(state),
    analysis.programs,
    toCustomBenefitValues(state),
  )

  const header = [
    t('excel.raisePerMo'),
    t('excel.raisePerHr'),
    t('excel.benefitLossCol'),
    t('excel.netImpactCol'),
  ]

  const dataRows = points.map((p) => [
    p.raiseMonthly,
    monthlyToHourly(p.raiseMonthly),
    p.totalLoss,
    p.netImpact,
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows])
  ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 16 }]

  XLSX.utils.book_append_sheet(wb, ws, t('export.sheetSensitivity'))
}

// ---------------------------------------------------------------------------
// Sheet 5: Benefit Levels (200 rows)
// ---------------------------------------------------------------------------

function addBenefitLevelsSheet(
  XLSX: XLSXModule,
  wb: import('xlsx').WorkBook,
  state: FormState,
  t: (key: I18nKey) => string,
) {
  const points = computeBenefitStack(
    state.householdSize,
    state.numberOfChildren,
    state.monthlyRent,
    state.monthlyChildcareCosts,
  )

  const header = [
    t('excel.monthlyIncome'),
    t('print.foodshareLoss'),
    t('excel.schoolMeals'),
    t('print.wheapLoss'),
    t('excel.totalBenefits'),
  ]

  const dataRows = points.map((p) => [
    p.monthlyIncome,
    p.foodshare,
    p.schoolMeals,
    p.wheap,
    p.total,
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows])
  ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 14 }]

  XLSX.utils.book_append_sheet(wb, ws, t('export.sheetBenefitLevels'))
}

// ---------------------------------------------------------------------------
// Sheet 6: Program Reference (2025 thresholds)
// ---------------------------------------------------------------------------

function addReferenceSheet(
  XLSX: XLSXModule,
  wb: import('xlsx').WorkBook,
  t: (key: I18nKey) => string,
) {
  const rows: (string | number)[][] = []
  const hhPrefix = t('excel.hhPrefix')
  const hhHeaders = Array.from({ length: 8 }, (_, i) => `${hhPrefix} ${i + 1}`)

  // Section: Income thresholds by household size
  rows.push([t('excel.thresholdTitle'), '', '', '', '', '', '', '', '', ''])
  rows.push([t('print.program'), t('excel.basis'), ...hhHeaders])

  for (const prog of PROGRAMS) {
    const row: (string | number)[] = [prog.name, prog.basis]
    for (let hh = 1; hh <= 8; hh++) {
      if (prog.requiresChildren && hh < prog.minHouseholdSize) {
        row.push('')
      } else {
        row.push(prog.getLimit(hh))
      }
    }
    rows.push(row)

    // Wisconsin Shares also has entry threshold
    if (prog.key === 'wisconsin_shares' && prog.getEntryLimit) {
      const entryRow: (string | number)[] = [`${prog.name} (${t('program.entry')})`, t('excel.fpl200Label')]
      for (let hh = 1; hh <= 8; hh++) {
        if (hh < prog.minHouseholdSize) {
          entryRow.push('')
        } else {
          entryRow.push(prog.getEntryLimit(hh))
        }
      }
      rows.push(entryRow)
    }
  }

  rows.push([])

  // Section: FPL 100%
  rows.push([t('excel.fplTitle')])
  const fplRow: (string | number)[] = [t('excel.fpl100Label'), '']
  for (let hh = 1; hh <= 8; hh++) fplRow.push(FPL_100[hh])
  rows.push(['', '', ...hhHeaders])
  rows.push(fplRow)

  rows.push([])

  // Section: SMI
  rows.push([t('excel.smiTitle')])
  rows.push(['', '', ...hhHeaders])
  const smi60Row: (string | number)[] = [t('excel.smi60Label'), '']
  for (let hh = 1; hh <= 8; hh++) smi60Row.push(SMI_60[hh])
  rows.push(smi60Row)
  const smi85Row: (string | number)[] = [t('excel.smi85Label'), '']
  for (let hh = 1; hh <= 8; hh++) smi85Row.push(SMI_85[hh] ?? '')
  rows.push(smi85Row)

  rows.push([])

  // Section: FoodShare constants
  rows.push([t('excel.foodshareTitle')])
  rows.push([t('excel.maxAllotments'), '', ...hhHeaders])
  const allotRow: (string | number)[] = [t('excel.maxAllotment'), '']
  for (let hh = 1; hh <= 8; hh++) allotRow.push(FOODSHARE_MAX_ALLOTMENT[hh])
  rows.push(allotRow)

  const dedRow: (string | number)[] = [t('excel.standardDeduction'), '']
  for (let hh = 1; hh <= 8; hh++) dedRow.push(getFoodShareStandardDeduction(hh))
  rows.push(dedRow)

  rows.push([])

  // Section: School meal & WHEAP values
  rows.push([t('excel.benefitValueConstants')])
  rows.push([t('excel.freeMealsLabel'), FREE_MEAL_VALUE_PER_CHILD])
  rows.push([t('excel.reducedMealsLabel'), REDUCED_MEAL_VALUE_PER_CHILD])
  rows.push([t('excel.wheapLabel'), WHEAP_MONTHLY_VALUE])

  rows.push([])
  rows.push([t('excel.sources')])
  rows.push([t('excel.sourceUW')])
  rows.push([t('excel.sourceDHS')])
  rows.push([t('excel.sourceUSDA')])
  rows.push([t('excel.sourceDCF')])

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, t('export.sheetReference'))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusText(p: ProgramResult, t: (key: I18nKey) => string): string {
  if (!p.currentlyEligible) return t('result.na')
  if (p.lost) {
    if (p.cliffType === 'tier_shift' && p.currentTier && p.newTier) {
      return `${p.currentTier.toUpperCase()} \u2192 ${p.newTier.toUpperCase()}`
    }
    return t('result.lost')
  }
  return t('result.keep')
}
