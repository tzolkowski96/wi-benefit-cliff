import type { CliffAnalysis } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../utils/format.ts'

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
      <div
        role="alert"
        className="bg-[#FDE8E8] border border-[#E5ADAD] rounded-sm px-5 py-4 mb-5 text-sm leading-relaxed"
      >
        <strong className="text-[#9B2226]">
          <span aria-hidden="true">&#9888; </span>{t('warning.cliffTitle')}:
        </strong>{' '}
        {t('warning.cliffBody')}{' '}
        <strong className="font-mono">{formatMoney(Math.abs(netMonthly))}/month {t('warning.worseOff')}</strong>{' '}
        ({formatMoney(Math.abs(netMonthly) * 12)}/year).
        {safeRaiseMax > 0 && (
          <> {t('warning.considerSmaller').replace('{amount}', formatMoney(safeRaiseMax))}</>
        )}
      </div>
    )
  }

  // Positive net but some programs lost: amber heads-up
  if (lostPrograms.length > 0 && netMonthly >= 0) {
    return (
      <div className="bg-[#FFF8E1] border border-[#E0C97B] rounded-sm px-5 py-4 mb-5 text-sm leading-relaxed">
        <strong className="text-[#8B6914]">
          <span aria-hidden="true">&#9888; </span>{t('warning.headsUp')}:
        </strong>{' '}
        {lostPrograms.length} benefit{lostPrograms.length > 1 ? 's' : ''} lost, {t('warning.stillAhead')}{' '}
        <strong className="font-mono">{formatMoney(netMonthly)}/month</strong>.{' '}
        {t('warning.budgetTransition')}
      </div>
    )
  }

  return null
}
