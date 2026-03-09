import type { ProgramResult, FormState } from '../types/index.ts'
import type { FormUpdater } from '../hooks/useUrlState.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../engine/format.ts'

const CUSTOM_VALUE_KEYS: Record<string, keyof FormState> = {
  badgercare_adult: 'customBadgerCareAdultValue',
  badgercare_children: 'customBadgerCareChildValue',
  wisconsin_shares: 'customWisconsinSharesValue',
}

interface Props {
  programs: ProgramResult[]
  state: FormState
  update: FormUpdater
}

function CliffTypeBadge({ type }: { type: string }) {
  const { t } = useI18n()
  const labelKey = `cliffType.${type}` as const
  const label = t(labelKey as 'cliffType.hard' | 'cliffType.gradual' | 'cliffType.tier_shift')
  const colors: Record<string, string> = {
    hard: 'bg-[#9B2226]/10 text-[#9B2226]',
    gradual: 'bg-[#2D6A4F]/10 text-[#2D6A4F]',
    tier_shift: 'bg-[#E8A838]/15 text-[#8B6914]',
  }
  return (
    <span className={`inline-block text-[10px] font-semibold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${colors[type] ?? ''}`}>
      {label}
    </span>
  )
}

function StatusBadge({ prog }: { prog: ProgramResult }) {
  const { t } = useI18n()

  if (!prog.currentlyEligible) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1 rounded-sm bg-[#f5f5f5] text-[#767676]">
        {t('result.na')}
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
        <span aria-hidden="true">&darr;</span> {t('result.lost')}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1 rounded-sm bg-[#EDF6ED] text-[#2D6A4F]">
      <span aria-hidden="true">&#10003;</span> {t('result.keep')}
    </span>
  )
}

export default function ProgramBreakdown({ programs, state, update }: Props) {
  const { t } = useI18n()

  if (programs.length === 0) return null

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-4 font-mono m-0">
        {t('section.breakdown')}
      </h2>

      <div className="space-y-0">
        {programs.map((prog) => {
          const customKey = CUSTOM_VALUE_KEYS[prog.key]
          const customValue = customKey ? (state[customKey] as number | null) : null

          return (
            <div
              key={prog.key}
              className={`py-3 border-b border-[#eee] last:border-b-0 ${
                !prog.currentlyEligible ? 'opacity-60' : ''
              }`}
            >
              {/* Mobile: stacked layout */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: prog.color }}>
                    {prog.name}
                  </div>
                  <div className="text-[11px] text-[#767676]">
                    {prog.key === 'wisconsin_shares' && prog.entryLimit && prog.exitLimit ? (
                      <>
                        {t('program.entry')}: {formatMoney(prog.entryLimit)}{t('unit.perMonth')} &middot; {t('program.continuation')}: {formatMoney(prog.exitLimit)}{t('unit.perMonth')}
                      </>
                    ) : (
                      <>{t('program.cutoff')}: {formatMoney(prog.limit)}{t('unit.perMonth')} ({prog.basis})</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CliffTypeBadge type={prog.cliffType} />
                  <StatusBadge prog={prog} />
                </div>
              </div>

              {/* Value impact line */}
              {prog.currentlyEligible && (
                <div className="text-xs font-mono text-[#666] mt-1">
                  {prog.calculable ? (
                    prog.currentMonthlyValue !== null ? (
                      <>
                        {formatMoney(prog.currentMonthlyValue)}{t('unit.perMonth')} &rarr; {formatMoney(prog.newMonthlyValue ?? 0)}{t('unit.perMonth')}
                        {prog.monthlyLoss !== null && prog.monthlyLoss > 0 && (
                          <span className="text-[#9B2226] font-semibold ml-1">
                            (-{formatMoney(prog.monthlyLoss)})
                          </span>
                        )}
                        {prog.monthlyLoss === 0 && (
                          <span className="text-[#2D6A4F] ml-1">{t('result.noChange')}</span>
                        )}
                      </>
                    ) : null
                  ) : (
                    <div>
                      <span className="text-[#767676] italic">
                        {t('program.eligibilityOnly')}
                      </span>
                      {/* Inline custom value input */}
                      {customKey && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[11px] text-[#767676] font-sans not-italic">{t('form.customValuePrompt')}</span>
                          <span className="text-[#767676]">$</span>
                          <input
                            type="number"
                            min={0}
                            step={25}
                            value={customValue ?? ''}
                            placeholder="—"
                            onChange={(e) => {
                              const val = e.target.value
                              update({ [customKey]: val === '' ? null : Math.max(0, Math.round(Number(val))) })
                            }}
                            className="w-[72px] py-0.5 px-1.5 border border-[#ddd] rounded-sm text-xs font-mono outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]"
                            aria-label={t('a11y.customValueFor').replace('{name}', prog.name)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tier 2 note */}
      {programs.some((p) => !p.calculable && p.currentlyEligible) && (
        <div className="mt-4 pt-3 border-t border-[#eee] text-[11px] text-[#767676] leading-relaxed">
          {t('tier2.note')}
          <br />
          <em>{t('tier2.optionalNote')}</em>
        </div>
      )}
    </section>
  )
}
