import { useMemo } from 'react'
import type { ProgramResult, FormState } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { computeBreakEvenData } from '../utils/breakeven.ts'
import { formatMoney } from '../utils/format.ts'
import { monthlyToHourly } from '../utils/wage.ts'
import { toBreakEvenInputs, toCustomBenefitValues } from '../utils/formHelpers.ts'

interface Props {
  programs: ProgramResult[]
  state: FormState
}

function getRaiseColor(monthly: number): string {
  if (monthly <= 250) return 'text-[#2D6A4F]'
  if (monthly <= 750) return 'text-[#8B6914]'
  return 'text-[#9B2226]'
}

function formatHourly(monthly: number): string {
  return monthlyToHourly(monthly).toFixed(2)
}

export default function BreakEvenCalculator({ programs, state }: Props) {
  const { t } = useI18n()
  const { raiseMonthly } = state

  const { rows, clearAllRaise } = useMemo(() => computeBreakEvenData(
    programs,
    toBreakEvenInputs(state),
    toCustomBenefitValues(state),
  ), [programs, state])

  if (rows.length === 0) return null

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-3 font-mono m-0">
        {t('section.breakEven')}
      </h2>
      <p className="text-[13px] text-[#666] mb-4 leading-relaxed">
        {t('breakEven.description')}
      </p>

      <div className="space-y-0">
        {rows.map((row) => {
          const cleared = raiseMonthly >= row.breakEvenMonthly

          return (
            <div
              key={row.name}
              className="flex flex-wrap justify-between items-baseline py-2.5 border-b border-[#f0f0f0] last:border-b-0 gap-x-3"
            >
              <div className="min-w-0">
                <span className="text-[13px] font-medium">{row.name}</span>
                <span className="text-[11px] text-[#999] ml-2">
                  {t('breakEven.cliffAt')} +{formatMoney(row.cliffDistance)}{t('unit.perMonth')}
                </span>
              </div>
              <div className={`font-mono text-[13px] font-semibold whitespace-nowrap ${getRaiseColor(row.breakEvenMonthly)}`}>
                +{formatMoney(row.breakEvenMonthly)}{t('unit.perMonth')}
                <span className="text-[11px] font-normal text-[#999] ml-1.5">
                  (+${formatHourly(row.breakEvenMonthly)}{t('unit.perHour')})
                </span>
                {cleared && (
                  <span className="text-[#2D6A4F] ml-1" aria-label={t('a11y.breakEvenExceeded')}>&#10003;</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom line */}
      {clearAllRaise !== null && (
        <div className="mt-4 px-4 py-3 bg-[#F8F6F3] rounded-sm text-[13px] leading-relaxed">
          <strong>{rows.length > 1 ? t('breakEven.clearAll') : `${t('safeRaise.bottomLine')}:`}</strong>{' '}
          {rows.length > 1 ? (
            <>
              {t('breakEven.raiseAtLeast')}{' '}
              <strong className={`font-mono ${getRaiseColor(clearAllRaise)}`}>
                +{formatMoney(clearAllRaise)}{t('unit.perMonth')}
              </strong>
              <span className="text-[11px] text-[#999] ml-1">
                (+${formatHourly(clearAllRaise)}{t('unit.perHour')})
              </span>
              {' '}{t('breakEven.offsetAll')}
            </>
          ) : (
            <>
              {t('breakEven.needAtLeast')}{' '}
              <strong className={`font-mono ${getRaiseColor(clearAllRaise)}`}>
                +{formatMoney(clearAllRaise)}{t('unit.perMonth')}
              </strong>
              <span className="text-[11px] text-[#999] ml-1">
                (+${formatHourly(clearAllRaise)}{t('unit.perHour')})
              </span>
              {' '}{t('breakEven.toBreakEven')}
            </>
          )}
        </div>
      )}
    </section>
  )
}
