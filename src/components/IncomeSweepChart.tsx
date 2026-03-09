import { useMemo } from 'react'
import {
  ComposedChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import type { ProgramResult, FormState } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../engine/format.ts'
import { computeRaiseSweep } from '../engine/sweep.ts'
import { toBreakEvenInputs, toCustomBenefitValues } from '../utils/formHelpers.ts'
import { CHART_TICK_STYLE, CHART_AXIS_LABEL_STYLE, CHART_TOOLTIP_STYLE, CHART_LEGEND_STYLE, CHART_FONT_FAMILY } from '../utils/chartStyles.ts'
import { COLOR } from '../tokens.ts'
import ChartSection from './ChartSection.tsx'

interface Props {
  programs: ProgramResult[]
  state: FormState
}

export default function IncomeSweepChart({ programs, state }: Props) {
  const { t } = useI18n()

  const { data, cliffs } = useMemo(() => {
    const { points, cliffPoints } = computeRaiseSweep(toBreakEvenInputs(state), programs, toCustomBenefitValues(state))
    return {
      data: points.map((p) => ({
        raise: p.raiseMonthly,
        net: p.netImpact,
        positive: Math.max(0, p.netImpact),
        negative: Math.min(0, p.netImpact),
      })),
      cliffs: cliffPoints,
    }
  }, [programs, state]) // safeRaiseMax excluded — derived from programs, not an input to the sweep

  // Don't render if no programs are eligible (nothing interesting to show)
  const hasEligiblePrograms = programs.some((p) => p.currentlyEligible)
  if (!hasEligiblePrograms) return null

  return (
    <ChartSection title={t('section.incomeSweep')} description={t('sweep.description')}>
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="raise"
              tick={{ ...CHART_TICK_STYLE, fill: '#767676' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              label={{ ...CHART_AXIS_LABEL_STYLE, value: t('sweep.xAxis'), position: 'insideBottom', offset: -2, fill: '#595959' }}
            />
            <YAxis
              tick={{ ...CHART_TICK_STYLE, fill: '#767676' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              label={{ ...CHART_AXIS_LABEL_STYLE, value: t('sweep.yAxis'), angle: -90, position: 'insideLeft', offset: 5, fill: '#595959' }}
            />

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />

            {/* Green positive zone */}
            <Area
              type="monotone"
              dataKey="positive"
              fill={COLOR.positive}
              fillOpacity={0.15}
              stroke={COLOR.positive}
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
              name={t('sweep.positiveZone')}
            />

            {/* Red negative zone */}
            <Area
              type="monotone"
              dataKey="negative"
              fill={COLOR.negative}
              fillOpacity={0.15}
              stroke={COLOR.negative}
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
                  fontFamily: CHART_FONT_FAMILY,
                }}
              />
            ))}

            {/* Current raise marker */}
            {state.raiseMonthly > 0 && (
              <ReferenceLine
                x={state.raiseMonthly}
                stroke={COLOR.accent}
                strokeWidth={2}
                label={{
                  value: t('sweep.currentRaise'),
                  position: 'top',
                  fontSize: 10,
                  fill: COLOR.accent,
                  fontWeight: 600,
                  fontFamily: CHART_FONT_FAMILY,
                }}
              />
            )}

            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
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
              wrapperStyle={CHART_LEGEND_STYLE}
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
    </ChartSection>
  )
}
