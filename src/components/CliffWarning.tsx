import type { CliffAnalysis } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../engine/format.ts'

interface Props {
  analysis: CliffAnalysis
}

export default function CliffWarning({ analysis }: Props) {
  const { t } = useI18n()
  const { calculableImpact, safeRaiseMax, cliffWarning } = analysis
  const { netMonthly, uncalculatedLosses } = calculableImpact
  const lostPrograms = analysis.programs.filter((p) => p.lost)

  // Nothing to warn about
  if (!cliffWarning && uncalculatedLosses.length === 0 && lostPrograms.length === 0) {
    return null
  }

  // Negative net: red warning
  if (cliffWarning) {
    return (
      /* ALERT.negativeBg, ALERT.negativeBorder */
      <div
        role="alert"
        className="bg-[#FDE8E8] border border-[#E5ADAD] rounded-sm px-5 py-4 mb-5 text-sm leading-relaxed"
      >
        {/* COLOR.negative */}
        <strong className="text-[#9B2226]">
          <span aria-hidden="true">&#9888; </span>{t('warning.cliffTitle')}:
        </strong>{' '}
        {t('warning.cliffBody')}{' '}
        <strong className="font-mono">{formatMoney(Math.abs(netMonthly))}{t('unit.perMonth')} {t('warning.worseOff')}</strong>{' '}
        ({formatMoney(Math.abs(netMonthly) * 12)}{t('unit.perYear')}).
        {safeRaiseMax > 0 && (
          <> {t('warning.considerSmaller').replace('{amount}', formatMoney(safeRaiseMax))}</>
        )}
      </div>
    )
  }

  // Positive net but some programs lost: amber heads-up
  if (lostPrograms.length > 0 && netMonthly >= 0) {
    return (
      /* ALERT.warningBg, ALERT.warningBorder, ALERT.warningText */
      <div role="alert" className="bg-[#FFF8E1] border border-[#E0C97B] rounded-sm px-5 py-4 mb-5 text-sm leading-relaxed">
        <strong className="text-[#8B6914]">
          <span aria-hidden="true">&#9888; </span>{t('warning.headsUp')}:
        </strong>{' '}
        {lostPrograms.length === 1 ? t('warning.benefitLostSingular') : t('warning.benefitsLostPlural').replace('{count}', String(lostPrograms.length))} {t('warning.stillAhead')}{' '}
        <strong className="font-mono">{formatMoney(netMonthly)}{t('unit.perMonth')}</strong>.{' '}
        {t('warning.budgetTransition')}
      </div>
    )
  }

  return null
}
