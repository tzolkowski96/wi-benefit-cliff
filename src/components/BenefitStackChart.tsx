import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import type { FormState } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../engine/format.ts'
import { computeBenefitStack } from '../engine/sweep.ts'
import { CHART_TICK_STYLE, CHART_AXIS_LABEL_STYLE, CHART_TOOLTIP_STYLE, CHART_LEGEND_STYLE, CHART_FONT_FAMILY } from '../utils/chartStyles.ts'
import { COLOR, PROGRAM_COLOR } from '../tokens.ts'
import ChartSection from './ChartSection.tsx'

interface Props {
  state: FormState
}

export default function BenefitStackChart({ state }: Props) {
  const { t } = useI18n()

  const stackData = useMemo(() => {
    return computeBenefitStack(
      state.householdSize,
      state.numberOfChildren,
      state.monthlyRent,
      state.monthlyChildcareCosts,
    )
  }, [state.householdSize, state.numberOfChildren, state.monthlyRent, state.monthlyChildcareCosts])

  // Don't render if there are no benefits at the lowest income (nothing to show)
  if (stackData.length === 0 || stackData[0]?.total === 0) return null

  const newIncome = state.currentMonthlyIncome + state.raiseMonthly

  // Dynamic title: compare total benefit at current vs post-raise income
  const dynamicTitle = useMemo(() => {
    const findNearest = (income: number) => {
      let best = stackData[0]!
      for (const pt of stackData) {
        if (Math.abs(pt.monthlyIncome - income) < Math.abs(best.monthlyIncome - income)) best = pt
      }
      return best.total
    }
    const before = findNearest(state.currentMonthlyIncome)
    const after = findNearest(newIncome)
    if (before === after) return t('title.stackUnchanged')
    return t('title.stackDrop')
      .replace('{before}', `$${formatMoney(before)}`)
      .replace('{after}', `$${formatMoney(after)}`)
  }, [stackData, state.currentMonthlyIncome, newIncome, t])

  // When raise is very small (<$100/mo), merge the labels to avoid overlap
  const smallRaise = state.raiseMonthly > 0 && state.raiseMonthly < 100

  return (
    <ChartSection title={dynamicTitle} description={t('stack.description')}>
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stackData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="monthlyIncome"
              tick={{ ...CHART_TICK_STYLE, fill: '#767676' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toLocaleString('en-US')}`}
              label={{ ...CHART_AXIS_LABEL_STYLE, value: t('stack.xAxis'), position: 'insideBottom', offset: -2, fill: '#767676' }}
            />
            <YAxis
              tick={{ ...CHART_TICK_STYLE, fill: '#767676' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              label={{ ...CHART_AXIS_LABEL_STYLE, value: t('stack.yAxis'), angle: -90, position: 'insideLeft', offset: 5, fill: '#767676' }}
            />

            {/* Stacked benefit areas — WHEAP uses dashed stroke for colorblind differentiation */}
            <Area
              type="stepAfter"
              dataKey="wheap"
              stackId="benefits"
              fill={PROGRAM_COLOR.wheap}
              fillOpacity={0.25}
              stroke={PROGRAM_COLOR.wheap}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              isAnimationActive={false}
              name={t('stack.legendWheap')}
            />
            {state.numberOfChildren > 0 && (
              <Area
                type="stepAfter"
                dataKey="schoolMeals"
                stackId="benefits"
                fill={PROGRAM_COLOR.school_meals_free}
                fillOpacity={0.25}
                stroke={PROGRAM_COLOR.school_meals_free}
                strokeWidth={1.5}
                isAnimationActive={false}
                name={t('stack.legendSchoolMeals')}
              />
            )}
            <Area
              type="monotone"
              dataKey="foodshare"
              stackId="benefits"
              fill={PROGRAM_COLOR.foodshare}
              fillOpacity={0.25}
              stroke={PROGRAM_COLOR.foodshare}
              strokeWidth={1.5}
              isAnimationActive={false}
              name={t('stack.legendFoodshare')}
            />

            {/* Current income marker */}
            <ReferenceLine
              x={state.currentMonthlyIncome}
              stroke={COLOR.text}
              strokeWidth={2}
              label={{
                value: smallRaise
                  ? `${t('stack.currentIncome')} → ${t('stack.afterRaise')}`
                  : t('stack.currentIncome'),
                position: 'top',
                fontSize: 10,
                fill: COLOR.text,
                fontWeight: 600,
                fontFamily: CHART_FONT_FAMILY,
              }}
            />

            {/* Post-raise income marker — hidden when raise is very small to avoid overlap */}
            {state.raiseMonthly > 0 && !smallRaise && (
              <ReferenceLine
                x={newIncome}
                stroke={COLOR.accent}
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{
                  value: t('stack.afterRaise'),
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
              formatter={(value: any, name: any) => [`${formatMoney(Number(value))}${t('unit.perMonth')}`, name]}
              labelFormatter={(label: any) => `${t('stack.xAxis')}: ${formatMoney(Number(label))}${t('unit.perMonth')}`}
            />

            <Legend
              iconType="square"
              wrapperStyle={CHART_LEGEND_STYLE}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader table fallback */}
      <table className="sr-only">
        <caption>{t('stack.srCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('stack.xAxis')}</th>
            <th scope="col">{t('stack.legendFoodshare')}</th>
            {state.numberOfChildren > 0 && <th scope="col">{t('stack.legendSchoolMeals')}</th>}
            <th scope="col">{t('stack.legendWheap')}</th>
            <th scope="col">{t('label.total')}</th>
          </tr>
        </thead>
        <tbody>
          {stackData.filter((_, i) => i % 10 === 0).map((point, i) => (
            <tr key={i}>
              <td>{formatMoney(point.monthlyIncome)}{t('unit.perMonth')}</td>
              <td>{formatMoney(point.foodshare)}</td>
              {state.numberOfChildren > 0 && <td>{formatMoney(point.schoolMeals)}</td>}
              <td>{formatMoney(point.wheap)}</td>
              <td>{formatMoney(point.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartSection>
  )
}
