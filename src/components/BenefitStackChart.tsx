import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import type { FormState } from '../types/index.ts'
import { useI18n } from '../hooks/useI18n.ts'
import { formatMoney } from '../utils/format.ts'
import { computeBenefitStack } from '../utils/sweep.ts'

interface Props {
  state: FormState
}

const FOODSHARE_COLOR = '#2D6A4F'
const SCHOOL_MEALS_COLOR = '#5F0F40'
const WHEAP_COLOR = '#9B2226'
const AMBER = '#E8A838'

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
  if (stackData.length === 0 || stackData[0].total === 0) return null

  const newIncome = state.currentMonthlyIncome + state.raiseMonthly

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-1 font-mono">
        {t('section.benefitStack')}
      </h2>
      <p className="text-[12px] text-[#888] mb-4 leading-relaxed">
        {t('stack.description')}
      </p>

      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stackData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="monthlyIncome"
              tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: '#888' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              label={{ value: t('stack.xAxis'), position: 'insideBottom', offset: -2, fontSize: 10, fill: '#999', fontFamily: "'IBM Plex Mono', monospace" }}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: '#888' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              label={{ value: t('stack.yAxis'), angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#999', fontFamily: "'IBM Plex Mono', monospace" }}
            />

            {/* Stacked benefit areas */}
            <Area
              type="stepAfter"
              dataKey="wheap"
              stackId="benefits"
              fill={WHEAP_COLOR}
              fillOpacity={0.25}
              stroke={WHEAP_COLOR}
              strokeWidth={1.5}
              isAnimationActive={false}
              name="WHEAP"
            />
            {state.numberOfChildren > 0 && (
              <Area
                type="stepAfter"
                dataKey="schoolMeals"
                stackId="benefits"
                fill={SCHOOL_MEALS_COLOR}
                fillOpacity={0.25}
                stroke={SCHOOL_MEALS_COLOR}
                strokeWidth={1.5}
                isAnimationActive={false}
                name={t('print.schoolMealLoss')}
              />
            )}
            <Area
              type="monotone"
              dataKey="foodshare"
              stackId="benefits"
              fill={FOODSHARE_COLOR}
              fillOpacity={0.25}
              stroke={FOODSHARE_COLOR}
              strokeWidth={1.5}
              isAnimationActive={false}
              name="FoodShare"
            />

            {/* Current income marker */}
            <ReferenceLine
              x={state.currentMonthlyIncome}
              stroke="#1a1a1a"
              strokeWidth={2}
              label={{
                value: t('stack.currentIncome'),
                position: 'top',
                fontSize: 10,
                fill: '#1a1a1a',
                fontWeight: 600,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />

            {/* Post-raise income marker */}
            {state.raiseMonthly > 0 && (
              <ReferenceLine
                x={newIncome}
                stroke={AMBER}
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{
                  value: t('stack.afterRaise'),
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
              formatter={(value: any, name: any) => [`${formatMoney(Number(value))}/mo`, name]}
              labelFormatter={(label: any) => `${t('stack.xAxis')}: ${formatMoney(Number(label))}/mo`}
            />

            <Legend
              iconType="square"
              wrapperStyle={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}
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
            <th scope="col">FoodShare</th>
            {state.numberOfChildren > 0 && <th scope="col">{t('print.schoolMealLoss')}</th>}
            <th scope="col">WHEAP</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {stackData.filter((_, i) => i % 10 === 0).map((point, i) => (
            <tr key={i}>
              <td>{formatMoney(point.monthlyIncome)}/mo</td>
              <td>{formatMoney(point.foodshare)}</td>
              {state.numberOfChildren > 0 && <td>{formatMoney(point.schoolMeals)}</td>}
              <td>{formatMoney(point.wheap)}</td>
              <td>{formatMoney(point.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
