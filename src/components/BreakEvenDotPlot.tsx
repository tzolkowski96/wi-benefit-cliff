import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import type { ProgramResult, FormState } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../utils/format.ts'
import { computeBreakEvenData } from '../utils/breakeven.ts'
import { toBreakEvenInputs, toCustomBenefitValues } from '../utils/formHelpers.ts'

interface Props {
  programs: ProgramResult[]
  state: FormState
}

const AMBER = '#E8A838'

export default function BreakEvenDotPlot({ programs, state }: Props) {
  const { t } = useI18n()

  const { rows } = useMemo(() => computeBreakEvenData(
    programs,
    toBreakEvenInputs(state),
    toCustomBenefitValues(state),
  ), [programs, state])

  if (rows.length === 0) return null

  const chartData = rows.map((row) => ({
    name: row.name,
    base: row.cliffDistance,
    range: Math.max(1, row.breakEvenMonthly - row.cliffDistance),
    cliffDistance: row.cliffDistance,
    breakEvenMonthly: row.breakEvenMonthly,
    color: row.color,
  }))

  const chartHeight = rows.length * 56 + 60

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5 print:hidden">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-4 font-mono">
        {t('section.breakEvenPlot')}
      </h2>

      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: '#888' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toLocaleString('en-US')}`}
              label={{ value: t('dotPlot.xAxis'), position: 'insideBottom', offset: -10, fontSize: 10, fill: '#767676', fontFamily: "'IBM Plex Mono', monospace" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif", fill: '#333', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />

            {/* Current raise marker */}
            {state.raiseMonthly > 0 && (
              <ReferenceLine
                x={state.raiseMonthly}
                stroke={AMBER}
                strokeWidth={2}
                label={{
                  value: t('dotPlot.yourRaise'),
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
              formatter={(_value: any, name: any, props: any) => {
                const d = props.payload as typeof chartData[0]
                if (name === 'base') return null
                return [
                  `${t('dotPlot.cliffDistance')}: +${formatMoney(d.cliffDistance)}${t('unit.perMonth')} | ${t('dotPlot.breakEven')}: +${formatMoney(d.breakEvenMonthly)}${t('unit.perMonth')}`,
                  d.name,
                ]
              }}
            />

            {/* Invisible base bar */}
            <Bar dataKey="base" stackId="dotplot" fill="transparent" isAnimationActive={false} />

            {/* Range bar: cliff → break-even */}
            <Bar dataKey="range" stackId="dotplot" isAnimationActive={false} radius={[0, 4, 4, 0]} barSize={12}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} fillOpacity={0.5} stroke={d.color} strokeWidth={1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-[#767676] font-mono mt-1 mb-0 pl-[130px]" aria-hidden="true">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#666]" /> {t('dotPlot.cliffDistance')}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-1.5 rounded-sm bg-[#666] opacity-50" /> {t('dotPlot.gap')}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full border border-[#666] bg-white" /> {t('dotPlot.breakEven')}
        </span>
      </div>

      {/* Screen reader table fallback */}
      <table className="sr-only">
        <caption>{t('dotPlot.srCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('print.program')}</th>
            <th scope="col">{t('dotPlot.cliffDistance')}</th>
            <th scope="col">{t('dotPlot.breakEven')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              <td>+{formatMoney(row.cliffDistance)}{t('unit.perMonth')}</td>
              <td>+{formatMoney(row.breakEvenMonthly)}{t('unit.perMonth')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
