/**
 * Excel (.xlsx) workbook export — generates a 6-sheet workbook from the
 * app's full computed data and triggers a browser download.
 *
 * The `xlsx` library is dynamically imported so it only loads when the user
 * clicks the export button (~90 KB gzipped, code-split into its own chunk).
 */

import type { FormState, CliffAnalysis, ProgramResult } from '../types/index.ts'
import type { CustomBenefitValues } from '../hooks/useCliffAnalysis.ts'
import type { I18nKey } from '../i18n/en.ts'
import { computeBreakEvenData } from './breakeven.ts'
import { computeRaiseSweep, computeBenefitStack } from './sweep.ts'
import { monthlyToHourly } from './wage.ts'
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
): Promise<void> {
  const XLSX = await import('xlsx')

  const wb = XLSX.utils.book_new()

  addSummarySheet(XLSX, wb, state, analysis, t)
  addProgramStatusSheet(XLSX, wb, analysis.programs, t)
  addBreakEvenSheet(XLSX, wb, state, analysis, t)
  addSensitivitySheet(XLSX, wb, state, analysis, t)
  addBenefitLevelsSheet(XLSX, wb, state, t)
  addReferenceSheet(XLSX, wb, t)

  const filename = `${t('export.filename')}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ---------------------------------------------------------------------------
// Helper: create typed XLSX reference
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XLSXModule = any

// ---------------------------------------------------------------------------
// Sheet 1: Scenario Summary
// ---------------------------------------------------------------------------

function addSummarySheet(
  XLSX: XLSXModule,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb: any,
  state: FormState,
  analysis: CliffAnalysis,
  t: (key: I18nKey) => string,
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
    [t('result.netImpact') + ' (/mo)', calculableImpact.netMonthly],
    [t('result.netAnnual') + ' (/yr)', calculableImpact.netAnnual],
    [t('result.raise') + ' (/mo)', calculableImpact.raise],
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
    [t('print.generated'), new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['Disclaimer', t('disclaimer.text')],
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb: any,
  programs: ProgramResult[],
  t: (key: I18nKey) => string,
) {
  const header = [
    t('print.program'),
    t('print.type'),
    'Basis',
    t('print.threshold'),
    'Eligible Now',
    'Eligible After',
    t('print.status'),
    'Distance to Cliff',
    'Current Value (/mo)',
    'New Value (/mo)',
    'Monthly Loss',
  ]

  const rows = programs.map((p) => [
    p.name,
    p.cliffType.replace('_', ' '),
    p.basis,
    p.limit,
    p.currentlyEligible ? 'Yes' : 'No',
    p.eligibleAfterRaise ? 'Yes' : 'No',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb: any,
  state: FormState,
  analysis: CliffAnalysis,
  t: (key: I18nKey) => string,
) {
  const cv: CustomBenefitValues = {
    customBadgerCareAdultValue: state.customBadgerCareAdultValue,
    customBadgerCareChildValue: state.customBadgerCareChildValue,
    customWisconsinSharesValue: state.customWisconsinSharesValue,
  }

  const { rows, clearAllRaise } = computeBreakEvenData(
    analysis.programs,
    {
      householdSize: state.householdSize,
      numberOfChildren: state.numberOfChildren,
      currentMonthlyIncome: state.currentMonthlyIncome,
      monthlyRent: state.monthlyRent,
      monthlyChildcareCosts: state.monthlyChildcareCosts,
    },
    cv,
  )

  const header = [
    t('print.program'),
    'Cliff Distance (/mo)',
    'Break-Even Raise (/mo)',
    'Break-Even Raise (/hr)',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb: any,
  state: FormState,
  analysis: CliffAnalysis,
  t: (key: I18nKey) => string,
) {
  const cv: CustomBenefitValues = {
    customBadgerCareAdultValue: state.customBadgerCareAdultValue,
    customBadgerCareChildValue: state.customBadgerCareChildValue,
    customWisconsinSharesValue: state.customWisconsinSharesValue,
  }

  const { points } = computeRaiseSweep(
    {
      householdSize: state.householdSize,
      numberOfChildren: state.numberOfChildren,
      currentMonthlyIncome: state.currentMonthlyIncome,
      monthlyRent: state.monthlyRent,
      monthlyChildcareCosts: state.monthlyChildcareCosts,
    },
    analysis.programs,
    cv,
  )

  const header = [
    'Raise ($/mo)',
    'Raise ($/hr)',
    'Benefit Loss ($/mo)',
    'Net Impact ($/mo)',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb: any,
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
    'Monthly Income',
    'FoodShare',
    'School Meals',
    'WHEAP',
    'Total Benefits',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb: any,
  t: (key: I18nKey) => string,
) {
  const rows: (string | number)[][] = []

  // Section: Income thresholds by household size
  rows.push(['2025 Monthly Income Thresholds by Household Size', '', '', '', '', '', '', '', '', ''])
  rows.push(['Program', 'Basis', 'HH 1', 'HH 2', 'HH 3', 'HH 4', 'HH 5', 'HH 6', 'HH 7', 'HH 8'])

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
      const entryRow: (string | number)[] = [prog.name + ' (Entry)', '200% FPL']
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
  rows.push(['Federal Poverty Level (100% FPL) - Monthly'])
  const fplRow: (string | number)[] = ['100% FPL', '']
  for (let hh = 1; hh <= 8; hh++) fplRow.push(FPL_100[hh])
  rows.push(['', '', 'HH 1', 'HH 2', 'HH 3', 'HH 4', 'HH 5', 'HH 6', 'HH 7', 'HH 8'])
  rows.push(fplRow)

  rows.push([])

  // Section: SMI
  rows.push(['State Median Income (SMI) - Monthly'])
  rows.push(['', '', 'HH 1', 'HH 2', 'HH 3', 'HH 4', 'HH 5', 'HH 6', 'HH 7', 'HH 8'])
  const smi60Row: (string | number)[] = ['60% SMI (WHEAP)', '']
  for (let hh = 1; hh <= 8; hh++) smi60Row.push(SMI_60[hh])
  rows.push(smi60Row)
  const smi85Row: (string | number)[] = ['85% SMI (WI Shares)', '']
  for (let hh = 1; hh <= 8; hh++) smi85Row.push(SMI_85[hh] ?? '')
  rows.push(smi85Row)

  rows.push([])

  // Section: FoodShare constants
  rows.push(['FoodShare Constants (FFY 2025)'])
  rows.push(['Max Allotments', '', 'HH 1', 'HH 2', 'HH 3', 'HH 4', 'HH 5', 'HH 6', 'HH 7', 'HH 8'])
  const allotRow: (string | number)[] = ['Max Allotment', '']
  for (let hh = 1; hh <= 8; hh++) allotRow.push(FOODSHARE_MAX_ALLOTMENT[hh])
  rows.push(allotRow)

  const dedRow: (string | number)[] = ['Standard Deduction', '']
  for (let hh = 1; hh <= 8; hh++) dedRow.push(getFoodShareStandardDeduction(hh))
  rows.push(dedRow)

  rows.push([])

  // Section: School meal & WHEAP values
  rows.push(['Benefit Value Constants'])
  rows.push(['Free School Meals (per child/mo)', FREE_MEAL_VALUE_PER_CHILD])
  rows.push(['Reduced School Meals (per child/mo)', REDUCED_MEAL_VALUE_PER_CHILD])
  rows.push(['WHEAP (monthly equivalent)', WHEAP_MONTHLY_VALUE])

  rows.push([])
  rows.push(['Sources:'])
  rows.push(['UW-Madison Division of Extension, "Benefit Cliffs for Wisconsin Public Programs" (2025)'])
  rows.push(['Wisconsin DHS, DMS Operations Memo 2024-18 (FoodShare FFY 2025)'])
  rows.push(['USDA FNS, FR 07/24/2025 (School meal reimbursement rates SY 2025-26)'])
  rows.push(['Wisconsin DCF (Wisconsin Shares entry/exit thresholds)'])

  // Suppress unused-var warning: t is available for future i18n of reference data
  void t

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
