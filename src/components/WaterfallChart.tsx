import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import type { MonthlyImpact } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../engine/format.ts'
import { CHART_TICK_STYLE, CHART_TOOLTIP_STYLE } from '../utils/chartStyles.ts'
import { COLOR } from '../tokens.ts'
import ChartSection from './ChartSection.tsx'

interface Props {
  impact: MonthlyImpact
}

interface WaterfallBar {
  name: string
  base: number
  value: number
  color: string
  label: string
}

export default function WaterfallChart({ impact }: Props) {
  const { t } = useI18n()
  const { raise, foodshareLoss, schoolMealLoss, wheapLoss, customLosses, netMonthly, totalCalculableLoss } = impact

  const bars = useMemo(() => {
    if (totalCalculableLoss === 0) return []

    const result: WaterfallBar[] = []
    let running = raise

    // First bar: the raise
    result.push({ name: t('waterfall.raise'), base: 0, value: raise, color: COLOR.positive, label: `+${formatMoney(raise)}` })

    // Loss bars (only include non-zero losses)
    const losses: { name: string; loss: number }[] = []
    if (foodshareLoss > 0) losses.push({ name: t('print.foodshareLoss'), loss: foodshareLoss })
    if (schoolMealLoss > 0) losses.push({ name: t('print.schoolMealLoss'), loss: schoolMealLoss })
    if (wheapLoss > 0) losses.push({ name: t('print.wheapLoss'), loss: wheapLoss })
    if (customLosses > 0) losses.push({ name: t('print.userEnteredLoss'), loss: customLosses })

    for (const { name, loss } of losses) {
      running -= loss
      result.push({ name, base: running, value: loss, color: COLOR.negative, label: `-${formatMoney(loss)}` })
    }

    // Net impact bar
    result.push({
      name: t('waterfall.net'),
      base: 0,
      value: Math.abs(netMonthly),
      color: netMonthly >= 0 ? COLOR.positive : COLOR.negative,
      label: (netMonthly >= 0 ? '+' : '-') + formatMoney(Math.abs(netMonthly)),
    })

    return result
  }, [raise, foodshareLoss, schoolMealLoss, wheapLoss, customLosses, netMonthly, totalCalculableLoss, t])

  if (bars.length === 0) return null

  return (
    <ChartSection title={t('section.waterfall')} className="print:hidden">
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bars} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ ...CHART_TICK_STYLE, fill: '#666' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={false}
            />
            <YAxis
              tick={{ ...CHART_TICK_STYLE, fill: '#767676' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(_v: any, _n: any, props: any) => {
                const bar = props.payload as WaterfallBar
                return [bar.label, bar.name]
              }}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            {/* Invisible base bar */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
            {/* Visible value bar */}
            <Bar dataKey="value" stackId="waterfall" isAnimationActive={false} radius={[2, 2, 0, 0]}>
              {bars.map((bar, i) => (
                <Cell key={i} fill={bar.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader table fallback */}
      <table className="sr-only">
        <caption>{t('waterfall.srCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('label.item')}</th>
            <th scope="col">{t('label.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((bar, i) => (
            <tr key={i}>
              <td>{bar.name}</td>
              <td>{bar.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartSection>
  )
}
