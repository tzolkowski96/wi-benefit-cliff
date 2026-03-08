import type { ProgramResult } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../utils/format.ts'

interface Props {
  programs: ProgramResult[]
  raiseMonthly: number
  safeRaiseMax: number
}

export default function SafeRaiseZones({ programs, raiseMonthly, safeRaiseMax }: Props) {
  const { t } = useI18n()
  const eligiblePrograms = programs.filter((p) => p.currentlyEligible)

  if (eligiblePrograms.length === 0) return null

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-3 font-mono m-0">
        {t('section.safeRaise')}
      </h2>
      <p className="text-[13px] text-[#666] mb-4 leading-relaxed">
        {t('safeRaise.description')}
      </p>

      <div className="space-y-0">
        {eligiblePrograms.map((prog) => {
          const safeAmount = prog.distanceToCliff
          const isOver = raiseMonthly > safeAmount

          return (
            <div
              key={prog.key}
              className="flex justify-between items-center py-2 border-b border-[#f0f0f0] last:border-b-0"
            >
              <span className="text-[13px] font-medium">{prog.name}</span>
              <span className={`font-mono text-[13px] font-semibold ${isOver ? 'text-[#9B2226]' : 'text-[#2D6A4F]'}`}>
                {isOver && <span aria-hidden="true">&times; </span>}
                {t('safeRaise.upTo')} +{formatMoney(safeAmount)}/mo
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom line summary */}
      <div className="mt-4 px-4 py-3 bg-[#F8F6F3] rounded-sm text-[13px] leading-relaxed">
        <strong>{t('safeRaise.bottomLine')}:</strong>{' '}
        {safeRaiseMax > 0 ? (
          <>
            {t('safeRaise.safeMessage').replace('{amount}', `+${formatMoney(safeRaiseMax)}`)}
            {raiseMonthly > safeRaiseMax && (
              <span className="text-[#9B2226]"> {t('safeRaise.exceedsMessage')}</span>
            )}
          </>
        ) : (
          <>{t('safeRaise.atThreshold')}</>
        )}
      </div>
    </section>
  )
}
