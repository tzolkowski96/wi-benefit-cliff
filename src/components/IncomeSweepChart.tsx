import { useMemo } from 'react'
import {
  ComposedChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import type { ProgramResult, FormState } from '../types/index.ts'
import type { CustomBenefitValues } from '../hooks/useCliffAnalysis.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../utils/format.ts'
import { computeRaiseSweep } from '../utils/sweep.ts'

interface Props {
  programs: ProgramResult[]
  state: FormState
  safeRaiseMax: number
}

const GREEN = '#2D6A4F'
const RED = '#9B2226'
const AMBER = '#E8A838'

export default function IncomeSweepChart({ programs, state, safeRaiseMax }: Props) {
  const { t } = useI18n()

  const { data, cliffs } = useMemo(() => {
    const inputs = {
      householdSize: state.householdSize,
      numberOfChildren: state.numberOfChildren,
      currentMonthlyIncome: state.currentMonthlyIncome,
      monthlyRent: state.monthlyRent,
      monthlyChildcareCosts: state.monthlyChildcareCosts,
    }
    const cv: CustomBenefitValues = {
      customBadgerCareAdultValue: state.customBadgerCareAdultValue,
      customBadgerCareChildValue: state.customBadgerCareChildValue,
      customWisconsinSharesValue: state.customWisconsinSharesValue,
    }
    const { points, cliffPoints } = computeRaiseSweep(inputs, programs, cv)
    return {
      data: points.map((p) => ({
        raise: p.raiseMonthly,
        net: p.netImpact,
        positive: Math.max(0, p.netImpact),
        negative: Math.min(0, p.netImpact),
      })),
      cliffs: cliffPoints,
    }
  }, [programs, state, safeRaiseMax])

  // Don't render if no programs are eligible (nothing interesting to show)
  const hasEligiblePrograms = programs.some((p) => p.currentlyEligible)
  if (!hasEligiblePrograms) return null

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-1 font-mono">
        {t('section.incomeSweep')}
      </h2>
      <p className="text-[12px] text-[#888] mb-4 leading-relaxed">
        {t('sweep.description')}
      </p>

      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="raise"
              tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: '#888' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              label={{ value: t('sweep.xAxis'), position: 'insideBottom', offset: -2, fontSize: 10, fill: '#999', fontFamily: "'IBM Plex Mono', monospace" }}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: '#888' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              label={{ value: t('sweep.yAxis'), angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#999', fontFamily: "'IBM Plex Mono', monospace" }}
            />

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />

            {/* Green positive zone */}
            <Area
              type="monotone"
              dataKey="positive"
              fill={GREEN}
              fillOpacity={0.15}
              stroke={GREEN}
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
              name={t('sweep.positiveZone')}
            />

            {/* Red negative zone */}
            <Area
              type="monotone"
              dataKey="negative"
              fill={RED}
              fillOpacity={0.15}
              stroke={RED}
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
              name={t('sweep.negativeZone')}
            />

            {/* Cliff markers */}
            {cliffs.map((cliff, i) => (
              <ReferenceLine
                key={i}
                x={cliff.raiseMonthly}
                stroke={cliff.programColor}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: cliff.programName,
                  position: 'top',
                  fontSize: 9,
                  fill: cliff.programColor,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              />
            ))}

            {/* Current raise marker */}
            {state.raiseMonthly > 0 && (
              <ReferenceLine
                x={state.raiseMonthly}
                stroke={AMBER}
                strokeWidth={2}
                label={{
                  value: t('sweep.currentRaise'),
                  position: 'top',
                  fontSize: 10,
                  fill: AMBER,
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              />
            )}

            <Tooltip
              contentStyle={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, border: '1px solid #ddd', borderRadius: 2 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                if (name === t('sweep.positiveZone') || name === t('sweep.negativeZone')) {
                  return null
                }
                return [formatMoney(Math.abs(Number(value))), name]
              }}
              labelFormatter={(label: any) => `${t('sweep.tooltipRaise')}: +${formatMoney(Number(label))}${t('unit.perMonth')}`}
            />

            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader table fallback (every 10th point + cliff points) */}
      <table className="sr-only">
        <caption>{t('sweep.srCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('sweep.tooltipRaise')}</th>
            <th scope="col">{t('sweep.tooltipLoss')}</th>
            <th scope="col">{t('sweep.tooltipNet')}</th>
          </tr>
        </thead>
        <tbody>
          {data.filter((_, i) => i % 10 === 0).map((point, i) => (
            <tr key={i}>
              <td>+{formatMoney(point.raise)}{t('unit.perMonth')}</td>
              <td>{formatMoney(point.raise - point.net)}{t('unit.perMonth')}</td>
              <td>{point.net >= 0 ? '+' : ''}{formatMoney(point.net)}{t('unit.perMonth')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
