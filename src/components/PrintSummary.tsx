import { useMemo } from 'react'
import type { FormState, CliffAnalysis } from '../types/index.ts'
import { useI18n, DATE_LOCALE } from '../hooks/useI18n.ts'
import type { I18nKey } from '../i18n/en.ts'
import { formatMoney, formatMoneyWithSign } from '../utils/format.ts'
import { monthlyToHourly } from '../utils/wage.ts'
import { computeBreakEvenData } from '../utils/breakeven.ts'

interface Props {
  state: FormState
  analysis: CliffAnalysis
}

export default function PrintSummary({ state, analysis }: Props) {
  const { t, lang } = useI18n()
  const { programs, calculableImpact, safeRaiseMax } = analysis
  const { netMonthly, netAnnual, uncalculatedLosses, foodshareLoss, schoolMealLoss, wheapLoss, customLosses } = calculableImpact

  const breakEvenData = useMemo(() => computeBreakEvenData(
    programs,
    {
      householdSize: state.householdSize,
      numberOfChildren: state.numberOfChildren,
      currentMonthlyIncome: state.currentMonthlyIncome,
      monthlyRent: state.monthlyRent,
      monthlyChildcareCosts: state.monthlyChildcareCosts,
    },
    {
      customBadgerCareAdultValue: state.customBadgerCareAdultValue,
      customBadgerCareChildValue: state.customBadgerCareChildValue,
      customWisconsinSharesValue: state.customWisconsinSharesValue,
    },
  ), [programs, state])

  return (
    <div className="print-summary hidden print:block print:p-8 print:text-[12px] print:text-black print:bg-white">
      <h1 className="text-xl font-bold mb-1">{t('print.title')}</h1>
      <p className="text-[11px] text-[#666] mb-4">
        {t('print.generated')} {new Date().toLocaleDateString(DATE_LOCALE[lang] ?? 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* Household details */}
      <div className="mb-4 p-3 border border-[#ddd]">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">{t('print.householdDetails')}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
          <div>{t('form.householdSize')}: <strong>{state.householdSize}</strong></div>
          <div>{t('form.numberOfChildren')}: <strong>{state.numberOfChildren}</strong></div>
          <div>{t('form.monthlyIncome')}: <strong>{formatMoney(state.currentMonthlyIncome)}</strong></div>
          <div>{t('form.raise.monthly')}: <strong>{formatMoney(state.raiseMonthly)}</strong></div>
          <div>{t('print.newMonthlyIncome')}: <strong>{formatMoney(state.currentMonthlyIncome + state.raiseMonthly)}</strong></div>
          {state.monthlyRent > 0 && <div>{t('form.rent')}: <strong>{formatMoney(state.monthlyRent)}</strong></div>}
          {state.monthlyChildcareCosts > 0 && <div>{t('form.childcare')}: <strong>{formatMoney(state.monthlyChildcareCosts)}</strong></div>}
        </div>
      </div>

      {/* Net Impact */}
      <div className={`mb-4 p-3 border-2 ${netMonthly >= 0 ? 'border-[#2D6A4F]' : 'border-[#9B2226]'}`}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">{t('print.netImpact')}</h2>
        <div className="text-lg font-bold font-mono">
          {formatMoneyWithSign(netMonthly)}{t('unit.perMonth')} ({formatMoneyWithSign(netAnnual)}{t('unit.perYear')})
        </div>
        <div className="text-[11px] mt-1 text-[#666]">
          {t('result.raise')}: +{formatMoney(calculableImpact.raise)}{t('unit.perMonth')}
          {foodshareLoss > 0 && <> | {t('print.foodshareLoss')}: -{formatMoney(foodshareLoss)}</>}
          {schoolMealLoss > 0 && <> | {t('print.schoolMealLoss')}: -{formatMoney(schoolMealLoss)}</>}
          {wheapLoss > 0 && <> | {t('print.wheapLoss')}: -{formatMoney(wheapLoss)}</>}
          {customLosses > 0 && <> | {t('print.userEnteredLoss')}: -{formatMoney(customLosses)}</>}
        </div>
      </div>

      {/* Program statuses table */}
      <table className="w-full border-collapse mb-4 text-[11px]">
        <thead>
          <tr className="border-b-2 border-[#333]">
            <th className="text-left py-1 font-bold">{t('print.program')}</th>
            <th className="text-left py-1 font-bold">{t('print.threshold')}</th>
            <th className="text-left py-1 font-bold">{t('print.type')}</th>
            <th className="text-right py-1 font-bold">{t('print.valueImpact')}</th>
            <th className="text-right py-1 font-bold">{t('print.status')}</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((prog) => (
            <tr key={prog.key} className="border-b border-[#ddd]">
              <td className="py-1.5">{prog.name}</td>
              <td className="py-1.5 font-mono text-[10px]">
                {prog.key === 'wisconsin_shares' && prog.entryLimit
                  ? `${formatMoney(prog.entryLimit)} / ${formatMoney(prog.exitLimit ?? prog.limit)}`
                  : `${formatMoney(prog.limit)} (${prog.basis})`}
              </td>
              <td className="py-1.5">{t(('cliffType.' + prog.cliffType) as I18nKey)}</td>
              <td className="py-1.5 font-mono text-right">
                {prog.calculable && prog.monthlyLoss !== null
                  ? prog.monthlyLoss > 0
                    ? `-${formatMoney(prog.monthlyLoss)}${t('unit.perMonth')}`
                    : '$0'
                  : t('result.na')}
              </td>
              <td className="py-1.5 font-bold text-right">
                {!prog.currentlyEligible
                  ? t('result.na')
                  : prog.lost
                    ? (prog.cliffType === 'tier_shift' && prog.currentTier && prog.newTier
                        ? `${prog.currentTier.toUpperCase()} \u2192 ${prog.newTier.toUpperCase()}`
                        : t('result.lost'))
                    : t('result.keep')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Uncalculated losses */}
      {uncalculatedLosses.length > 0 && (
        <div className="mb-4 p-3 border border-[#E0C97B] bg-[#FFF8E1]">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1">{t('section.additionalRisks')}</h2>
          <p className="text-[11px]">
            {uncalculatedLosses.join(', ')} — {t('result.variesByIndividual')}
          </p>
        </div>
      )}

      {/* Safe raise */}
      <div className="mb-4 p-3 border border-[#ddd]">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-1">{t('print.safeRaise')}</h2>
        <p className="text-[12px]">
          {safeRaiseMax > 0
            ? <>{t('safeRaise.safeMessage').replace('{amount}', formatMoney(safeRaiseMax))}</>
            : <>{t('safeRaise.atThreshold')}</>}
        </p>
      </div>

      {/* Break-even raises */}
      {breakEvenData.rows.length > 0 && (
        <div className="mb-4 p-3 border border-[#ddd]">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2">{t('print.breakEven')}</h2>
          <table className="w-full border-collapse text-[11px] mb-2">
            <thead>
              <tr className="border-b border-[#999]">
                <th className="text-left py-1 font-bold">{t('print.program')}</th>
                <th className="text-right py-1 font-bold">{t('print.cliffAt')}</th>
                <th className="text-right py-1 font-bold">{t('print.breakEvenCol')}</th>
                <th className="text-right py-1 font-bold">{t('print.hourlyCol')}</th>
              </tr>
            </thead>
            <tbody>
              {breakEvenData.rows.map((row) => (
                <tr key={row.name} className="border-b border-[#eee]">
                  <td className="py-1">{row.name}</td>
                  <td className="py-1 font-mono text-right">+{formatMoney(row.cliffDistance)}{t('unit.perMonth')}</td>
                  <td className="py-1 font-mono text-right">+{formatMoney(row.breakEvenMonthly)}{t('unit.perMonth')}</td>
                  <td className="py-1 font-mono text-right">+${monthlyToHourly(row.breakEvenMonthly).toFixed(2)}{t('unit.perHour')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {breakEvenData.clearAllRaise !== null && (
            <p className="text-[11px]">
              {breakEvenData.rows.length > 1
                ? <>{t('breakEven.clearAll')} <strong className="font-mono">+{formatMoney(breakEvenData.clearAllRaise)}{t('unit.perMonth')}</strong> (+${monthlyToHourly(breakEvenData.clearAllRaise).toFixed(2)}{t('unit.perHour')})</>
                : <>{t('print.breakEvenCol')}: <strong className="font-mono">+{formatMoney(breakEvenData.clearAllRaise)}{t('unit.perMonth')}</strong> (+${monthlyToHourly(breakEvenData.clearAllRaise).toFixed(2)}{t('unit.perHour')})</>}
            </p>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-[10px] text-[#767676] leading-relaxed border-t border-[#ddd] pt-3">
        <strong>{t('label.disclaimer')}:</strong> {t('disclaimer.text')}{' '}
        {t('disclaimer.contact')}
      </div>
    </div>
  )
}
