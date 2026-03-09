import type { ProgramResult } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../engine/format.ts'
import ChartSection from './ChartSection.tsx'

interface Props {
  programs: ProgramResult[]
  currentMonthlyIncome: number
  newMonthlyIncome: number
}

export default function CliffChart({ programs, currentMonthlyIncome, newMonthlyIncome }: Props) {
  const { t } = useI18n()

  // Only show programs that are either eligible or have limits worth displaying
  const displayPrograms = programs
    .filter((p) => p.key !== 'school_meals_reduced' || p.currentlyEligible)
    .sort((a, b) => a.limit - b.limit)

  if (displayPrograms.length === 0) return null

  const maxIncome = Math.max(
    newMonthlyIncome * 1.3,
    ...displayPrograms.map((p) => p.limit * 1.1),
  )

  const pct = (val: number) => Math.min((val / maxIncome) * 100, 100)

  return (
    <ChartSection title={t('section.chart')}>
      {/* Visual chart */}
      <div className="relative pb-3" aria-hidden="true">
        {displayPrograms.map((prog) => {
          const limitPct = pct(prog.limit)
          const currentPct = pct(currentMonthlyIncome)
          const newPct = pct(newMonthlyIncome)

          return (
            <div key={prog.key} className="mb-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[13px] font-medium ${prog.currentlyEligible ? 'text-[#1a1a1a]' : 'text-[#767676]'}`}>
                  {prog.name}
                </span>
                <span className={`text-[11px] font-mono ${
                  prog.lost ? 'text-[#9B2226] font-bold'
                    : prog.currentlyEligible ? 'text-[#666]'
                    : 'text-[#767676]'
                }`}>
                  {prog.lost
                    ? (prog.cliffType === 'tier_shift' && prog.currentTier && prog.newTier
                        ? `${prog.currentTier.toUpperCase()} \u2192 ${prog.newTier.toUpperCase()}`
                        : `${t('result.lost')} \u2193`)
                    : !prog.currentlyEligible
                      ? t('result.notEligible')
                      : `${formatMoney(prog.distanceToCliff)} ${t('result.buffer')}`
                  }
                </span>
              </div>
              <div className="relative h-6 bg-[#f0f0f0] rounded-sm overflow-visible">
                {/* Eligible zone fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-l-sm"
                  style={{
                    width: `${Math.min(limitPct, 100)}%`,
                    backgroundColor: prog.currentlyEligible ? `${prog.color}18` : '#f5f5f5',
                  }}
                />
                {/* Cliff line */}
                <div
                  className="absolute top-[-2px] bottom-[-2px] w-0.5 opacity-70"
                  style={{ left: `${Math.min(limitPct, 100)}%`, backgroundColor: prog.color }}
                />
                {/* Current income marker */}
                <div
                  className="absolute top-0.5 bottom-0.5 w-[3px] bg-[#1a1a1a] rounded-sm z-[2]"
                  style={{ left: `${Math.min(currentPct, 99)}%` }}
                />
                {/* New income marker */}
                {newMonthlyIncome !== currentMonthlyIncome && (
                  <div
                    className="absolute top-0.5 bottom-0.5 w-[3px] rounded-sm z-[2]"
                    style={{
                      left: `${Math.min(newPct, 99)}%`,
                      backgroundColor: prog.lost ? '#9B2226' : '#E8A838',
                    }}
                  />
                )}
                {/* Limit label */}
                <span
                  className="absolute top-1 text-[10px] font-mono font-medium whitespace-nowrap"
                  style={{ left: `${Math.min(limitPct, 100)}%`, transform: 'translateX(6px)', color: prog.color }}
                >
                  {formatMoney(prog.limit)}
                </span>
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-[11px] text-[#767676]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-[3px] bg-[#1a1a1a] rounded-sm" />
            {t('chart.current')} ({formatMoney(currentMonthlyIncome)})
          </div>
          {newMonthlyIncome !== currentMonthlyIncome && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-[3px] bg-[#E8A838] rounded-sm" />
              {t('chart.afterRaise')} ({formatMoney(newMonthlyIncome)})
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="w-0.5 h-3 bg-[#666] rounded-sm" />
            {t('chart.cutoff')}
          </div>
        </div>
      </div>

      {/* Screen reader table fallback */}
      <table className="sr-only">
        <caption>{t('chart.srCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('print.program')}</th>
            <th scope="col">{t('chart.cutoff')}</th>
            <th scope="col">{t('chart.current')}</th>
            <th scope="col">{t('chart.afterRaise')}</th>
            <th scope="col">{t('result.buffer')}</th>
            <th scope="col">{t('print.status')}</th>
          </tr>
        </thead>
        <tbody>
          {displayPrograms.map((prog) => (
            <tr key={prog.key}>
              <td>{prog.name}</td>
              <td>{formatMoney(prog.limit)}{t('unit.perMonth')}</td>
              <td>{formatMoney(currentMonthlyIncome)}{t('unit.perMonth')}</td>
              <td>{formatMoney(newMonthlyIncome)}{t('unit.perMonth')}</td>
              <td>{prog.currentlyEligible ? formatMoney(prog.distanceToCliff) : t('result.na')}</td>
              <td>
                {prog.lost
                  ? (prog.cliffType === 'tier_shift' ? `${prog.currentTier} ${t('chart.tierTo')} ${prog.newTier}` : t('result.lost'))
                  : prog.currentlyEligible ? t('result.keep') : t('result.notEligible')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartSection>
  )
}
