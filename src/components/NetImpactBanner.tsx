import type { MonthlyImpact } from '../types/index.ts'
import { formatMoney, formatMoneyWithSign } from '../utils/format.ts'

interface Props {
  impact: MonthlyImpact
}

export default function NetImpactBanner({ impact }: Props) {
  const { raise, totalCalculableLoss, netMonthly, netAnnual, uncalculatedLosses } = impact
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
        {/* Three-column metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-1 font-mono">
              Raise
            </div>
            <div className="text-xl font-bold font-mono text-[#2D6A4F]">
              +{formatMoney(raise)}<span className="text-sm font-medium">/mo</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-1 font-mono">
              Lost Benefits
            </div>
            <div className={`text-xl font-bold font-mono ${totalCalculableLoss > 0 ? 'text-[#9B2226]' : 'text-[#666]'}`}>
              {totalCalculableLoss > 0 ? `-${formatMoney(totalCalculableLoss)}` : formatMoney(0)}
              <span className="text-sm font-medium">/mo</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-1 font-mono">
              Net Impact
            </div>
            <div className={`text-2xl font-bold font-mono ${isPositive ? 'text-[#2D6A4F]' : 'text-[#9B2226]'}`}>
              {formatMoneyWithSign(netMonthly)}<span className="text-sm font-medium">/mo</span>
            </div>
          </div>
        </div>

        {/* Annual projection */}
        <div className={`mt-3 pt-3 border-t text-sm font-mono ${
          isPositive ? 'border-[#2D6A4F]/20 text-[#2D6A4F]' : 'border-[#9B2226]/20 text-[#9B2226]'
        }`}>
          That's <strong>{formatMoneyWithSign(netAnnual)}/year</strong> in calculable impact
        </div>
      </div>

      {/* Uncalculated losses warning */}
      {uncalculatedLosses.length > 0 && (
        <div className="bg-[#FFF8E1] border border-[#E0C97B] rounded-sm px-5 py-3 mb-5 text-sm leading-relaxed">
          <span className="font-semibold text-[#8B6914]" aria-hidden="true">&#9888; </span>
          <strong className="text-[#8B6914]">Not included above:</strong>{' '}
          {uncalculatedLosses.join(', ')} — eligibility lost but dollar value varies by individual.
        </div>
      )}
    </div>
  )
}
