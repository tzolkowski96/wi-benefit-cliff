import type { MonthlyImpact } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney, formatMoneyWithSign } from '../utils/format.ts'

interface Props {
  impact: MonthlyImpact
}

export default function NetImpactBanner({ impact }: Props) {
  const { t } = useI18n()
  const { raise, totalCalculableLoss, netMonthly, netAnnual, uncalculatedLosses, customLosses } = impact
  const isPositive = netMonthly >= 0

  return (
    <div aria-live="polite" aria-atomic="true">
      <div
        className={`border-2 rounded-sm p-5 mb-5 ${
          isPositive
            ? 'bg-[#EDF6ED] border-[#2D6A4F]'
            : 'bg-[#FDE8E8] border-[#9B2226]'
        }`}
      >
        {/* Three-column metrics — semantic dl/dt/dd */}
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 m-0">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-1 font-mono">
              {t('result.raise')}
            </dt>
            <dd className="text-xl font-bold font-mono text-[#2D6A4F] m-0">
              +{formatMoney(raise)}<span className="text-sm font-medium">{t('unit.perMonth')}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-1 font-mono">
              {t('result.lostBenefits')}
            </dt>
            <dd className={`text-xl font-bold font-mono m-0 ${totalCalculableLoss > 0 ? 'text-[#9B2226]' : 'text-[#666]'}`}>
              {totalCalculableLoss > 0 ? `-${formatMoney(totalCalculableLoss)}` : formatMoney(0)}
              <span className="text-sm font-medium">{t('unit.perMonth')}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-1 font-mono">
              {t('result.netImpact')}
            </dt>
            <dd className={`text-2xl font-bold font-mono m-0 ${isPositive ? 'text-[#2D6A4F]' : 'text-[#9B2226]'}`}>
              {formatMoneyWithSign(netMonthly)}<span className="text-sm font-medium">{t('unit.perMonth')}</span>
            </dd>
          </div>
        </dl>

        {/* Annual projection */}
        <div className={`mt-3 pt-3 border-t text-sm font-mono ${
          isPositive ? 'border-[#2D6A4F]/20 text-[#2D6A4F]' : 'border-[#9B2226]/20 text-[#9B2226]'
        }`}>
          <strong>{formatMoneyWithSign(netAnnual)}{t('unit.perYear')}</strong> {t('result.annualCalcImpact')}
          {customLosses > 0 && <span className="text-[11px] opacity-70"> ({t('result.includesUserEntered').replace('{amount}', formatMoney(customLosses))})</span>}
        </div>
      </div>

      {/* Uncalculated losses warning */}
      {uncalculatedLosses.length > 0 && (
        <div className="bg-[#FFF8E1] border border-[#E0C97B] rounded-sm px-5 py-3 mb-5 text-sm leading-relaxed">
          <span className="font-semibold text-[#8B6914]" aria-hidden="true">&#9888; </span>
          <strong className="text-[#8B6914]">{t('result.notIncluded')}</strong>{' '}
          {uncalculatedLosses.join(', ')} — {t('result.variesByIndividual')}
        </div>
      )}
    </div>
  )
}
