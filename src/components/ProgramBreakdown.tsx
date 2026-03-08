import type { ProgramResult } from '../types/index.ts'
import { formatMoney } from '../utils/format.ts'

interface Props {
  programs: ProgramResult[]
}

function cliffTypeBadge(type: string) {
  const labels: Record<string, string> = {
    hard: 'Hard cliff',
    gradual: 'Gradual',
    tier_shift: 'Tier shift',
  }
  const colors: Record<string, string> = {
    hard: 'bg-[#9B2226]/10 text-[#9B2226]',
    gradual: 'bg-[#2D6A4F]/10 text-[#2D6A4F]',
    tier_shift: 'bg-[#E8A838]/15 text-[#8B6914]',
  }
  return (
    <span className={`inline-block text-[10px] font-semibold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${colors[type] ?? ''}`}>
      {labels[type] ?? type}
    </span>
  )
}

function statusBadge(prog: ProgramResult) {
  if (!prog.currentlyEligible) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1 rounded-sm bg-[#f5f5f5] text-[#aaa]">
        N/A
      </span>
    )
  }

  // Tier shift: show tier transition
  if (prog.cliffType === 'tier_shift' && prog.lost && prog.currentTier && prog.newTier) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1 rounded-sm bg-[#FFF8E1] text-[#8B6914]">
        <span aria-hidden="true">&darr;</span>
        {prog.currentTier.toUpperCase()} &rarr; {prog.newTier.toUpperCase()}
      </span>
    )
  }

  if (prog.lost) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1 rounded-sm bg-[#FDE8E8] text-[#9B2226]">
        <span aria-hidden="true">&darr;</span> LOST
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1 rounded-sm bg-[#EDF6ED] text-[#2D6A4F]">
      <span aria-hidden="true">&#10003;</span> KEEP
    </span>
  )
}

export default function ProgramBreakdown({ programs }: Props) {
  if (programs.length === 0) return null

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-4 font-mono m-0">
        Program Breakdown
      </h2>

      <div className="space-y-0">
        {programs.map((prog) => (
          <div
            key={prog.key}
            className={`py-3 border-b border-[#eee] last:border-b-0 ${
              !prog.currentlyEligible ? 'opacity-45' : ''
            }`}
          >
            {/* Mobile: stacked layout */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: prog.color }}>
                  {prog.name}
                </div>
                <div className="text-[11px] text-[#888]">
                  {prog.key === 'wisconsin_shares' && prog.entryLimit && prog.exitLimit ? (
                    <>
                      Entry: {formatMoney(prog.entryLimit)}/mo &middot; Continuation: {formatMoney(prog.exitLimit)}/mo
                    </>
                  ) : (
                    <>Cutoff: {formatMoney(prog.limit)}/mo ({prog.basis})</>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cliffTypeBadge(prog.cliffType)}
                {statusBadge(prog)}
              </div>
            </div>

            {/* Value impact line */}
            {prog.currentlyEligible && (
              <div className="text-xs font-mono text-[#666] mt-1">
                {prog.calculable ? (
                  prog.currentMonthlyValue !== null ? (
                    <>
                      {formatMoney(prog.currentMonthlyValue)}/mo &rarr; {formatMoney(prog.newMonthlyValue ?? 0)}/mo
                      {prog.monthlyLoss !== null && prog.monthlyLoss > 0 && (
                        <span className="text-[#9B2226] font-semibold ml-1">
                          (-{formatMoney(prog.monthlyLoss)})
                        </span>
                      )}
                      {prog.monthlyLoss === 0 && (
                        <span className="text-[#2D6A4F] ml-1">no change</span>
                      )}
                    </>
                  ) : null
                ) : (
                  <span className="text-[#888] italic">
                    Eligibility shown — dollar value varies by individual
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tier 2 note */}
      {programs.some((p) => !p.calculable && p.currentlyEligible) && (
        <div className="mt-4 pt-3 border-t border-[#eee] text-[11px] text-[#999] leading-relaxed">
          Programs marked "Eligibility shown" may have significant financial value but it varies
          too much by individual circumstances to estimate. The net impact shown above only
          includes programs with calculable values.
        </div>
      )}
    </section>
  )
}
