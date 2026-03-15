import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell, ResponsiveContainer, Tooltip, LabelList,
} from 'recharts'
import type { BreakEvenData } from '../engine/breakeven.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../engine/format.ts'
import { CHART_TICK_STYLE, CHART_TOOLTIP_STYLE, CHART_AXIS_LABEL_STYLE, CHART_FONT_FAMILY } from '../utils/chartStyles.ts'
import { COLOR, NEUTRAL } from '../tokens.ts'
import ChartSection from './ChartSection.tsx'

interface Props {
  breakEvenData: BreakEvenData
  raiseMonthly: number
}

export default function BreakEvenDotPlot({ breakEvenData, raiseMonthly }: Props) {
  const { t } = useI18n()
  const { rows } = breakEvenData

  // Dynamic title
  const dynamicTitle = useMemo(() => {
    if (rows.length === 0) return t('section.breakEvenPlot')
    if (rows.length === 1) {
      return t('title.dotPlotSingle')
        .replace('{amount}', formatMoney(rows[0]!.breakEvenMonthly))
        .replace('{program}', rows[0]!.name)
    }
    const maxBreakEven = Math.max(...rows.map((r) => r.breakEvenMonthly))
    return t('title.dotPlotMultiple')
      .replace('{amount}', formatMoney(maxBreakEven))
  }, [rows, t])

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
    <ChartSection title={dynamicTitle} className="print:hidden">
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
          >
            <XAxis
              type="number"
              tick={{ ...CHART_TICK_STYLE, fill: '#767676' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toLocaleString('en-US')}`}
              label={{ ...CHART_AXIS_LABEL_STYLE, value: t('dotPlot.xAxis'), position: 'insideBottom', offset: -10, fill: '#767676' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif", fill: '#333', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />

            {/* Current raise marker */}
            {raiseMonthly > 0 && (
              <ReferenceLine
                x={raiseMonthly}
                stroke={COLOR.accent}
                strokeWidth={2}
                label={{
                  value: t('dotPlot.yourRaise'),
                  position: 'top',
                  ...CHART_AXIS_LABEL_STYLE,
                  fill: COLOR.accent,
                  fontWeight: 600,
                }}
              />
            )}

            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
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

            {/* Invisible base bar — with cliff distance label */}
            <Bar dataKey="base" stackId="dotplot" fill="transparent" isAnimationActive={false}>
              <LabelList
                dataKey="cliffDistance"
                position="right"
                content={({ x, y, width, height, value, index }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  const d = chartData[index]
                  if (!d) return null
                  // Hide cliff label when range is very small (< $50) to avoid overlap with break-even label
                  if (d.range < 50) return null
                  return (
                    <text
                      x={(x ?? 0) + (width ?? 0) + 4}
                      y={(y ?? 0) + (height ?? 0) / 2 + 4}
                      fontSize={10}
                      fontFamily={CHART_FONT_FAMILY}
                      fill={NEUTRAL[600]}
                    >
                      +${formatMoney(Number(value))}
                    </text>
                  )
                }}
              />
            </Bar>

            {/* Range bar: cliff → break-even — with break-even label */}
            <Bar dataKey="range" stackId="dotplot" isAnimationActive={false} radius={[0, 4, 4, 0]} barSize={12}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} fillOpacity={0.5} stroke={d.color} strokeWidth={1} />
              ))}
              <LabelList
                dataKey="breakEvenMonthly"
                position="right"
                content={({ x, y, width, height, value, index }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  const d = chartData[index]
                  if (!d) return null
                  return (
                    <text
                      x={(x ?? 0) + (width ?? 0) + 4}
                      y={(y ?? 0) + (height ?? 0) / 2 + 4}
                      fontSize={10}
                      fontFamily={CHART_FONT_FAMILY}
                      fill={d.color}
                      fontWeight={600}
                    >
                      +${formatMoney(Number(value))}
                    </text>
                  )
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend — matches actual chart elements */}
      {/* NEUTRAL.600 */}
      <div className="flex items-center gap-4 text-[11px] text-[#767676] font-mono mt-2 mb-0" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          {/* NEUTRAL.650 */}
          <span className="inline-block w-[3px] h-3 bg-[#666] rounded-sm" />
          {t('dotPlot.cliffDistance')}
        </span>
        <span className="flex items-center gap-1.5">
          {/* NEUTRAL.650 */}
          <span className="inline-block w-5 h-2 rounded-sm bg-[#666] opacity-50" />
          {t('dotPlot.gap')}
        </span>
        {raiseMonthly > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-[2px] h-3" style={{ backgroundColor: COLOR.accent }} />
            {t('dotPlot.yourRaise')}
          </span>
        )}
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
    </ChartSection>
  )
}
