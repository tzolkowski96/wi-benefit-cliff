import type { FormState } from '../types/index.ts'
import type { FormUpdater } from '../hooks/useUrlState.ts'
import { hourlyToMonthly, monthlyToHourly } from '../utils/wage.ts'
import { formatMoney } from '../utils/format.ts'

interface Props {
  state: FormState
  update: FormUpdater
}

export default function HouseholdForm({ state, update }: Props) {
  const { householdSize, numberOfChildren, incomeType, hourlyWage, monthlyIncome, raiseAmount } = state
  const maxChildren = Math.max(0, householdSize - 1)

  return (
    <section className="bg-white border border-[#ddd] rounded-sm p-6 mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-4 font-mono m-0">
        Your Household
      </h2>

      {/* Row 1: Household size + Children */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-xs font-semibold uppercase tracking-[0.05em] text-[#555] mb-1.5 font-mono">
            Household size
          </legend>
          <div className="flex gap-1 flex-wrap" role="radiogroup" aria-label="Household size">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={householdSize === n}
                onClick={() => update({ householdSize: n })}
                className={`w-[38px] h-[38px] rounded-sm text-sm font-semibold font-mono cursor-pointer
                  ${householdSize === n
                    ? 'bg-[#1a1a1a] text-white border-2 border-[#1a1a1a]'
                    : 'bg-white text-[#333] border border-[#ccc] hover:border-[#999]'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-0 p-0 m-0">
          <legend className="text-xs font-semibold uppercase tracking-[0.05em] text-[#555] mb-1.5 font-mono">
            Children under 18
          </legend>
          <div className="flex gap-1 flex-wrap" role="radiogroup" aria-label="Number of children under 18">
            {Array.from({ length: maxChildren + 1 }, (_, i) => i).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={numberOfChildren === n}
                onClick={() => update({ numberOfChildren: n })}
                disabled={householdSize === 1 && n > 0}
                className={`w-[38px] h-[38px] rounded-sm text-sm font-semibold font-mono cursor-pointer
                  ${numberOfChildren === n
                    ? 'bg-[#1a1a1a] text-white border-2 border-[#1a1a1a]'
                    : 'bg-white text-[#333] border border-[#ccc] hover:border-[#999]'
                  }
                  ${householdSize === 1 && n > 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Income type toggle */}
      <div className="mb-4">
        <span className="block text-xs font-semibold uppercase tracking-[0.05em] text-[#555] mb-1.5 font-mono">
          Income type
        </span>
        <div className="flex gap-2" role="radiogroup" aria-label="Income type">
          {(['hourly', 'monthly'] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={incomeType === type}
              onClick={() => update({ incomeType: type })}
              className={`px-5 py-2 rounded-sm text-sm font-medium cursor-pointer
                ${incomeType === type
                  ? 'bg-[#1a1a1a] text-white border-2 border-[#1a1a1a]'
                  : 'bg-white text-[#333] border border-[#ccc] hover:border-[#999]'
                }`}
            >
              {type === 'hourly' ? 'Hourly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Income + Raise */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="income-input" className="block text-xs font-semibold uppercase tracking-[0.05em] text-[#555] mb-1.5 font-mono">
            {incomeType === 'hourly' ? 'Current hourly wage' : 'Current monthly income'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-base font-semibold">$</span>
            <input
              id="income-input"
              type="number"
              min={0}
              step={incomeType === 'hourly' ? 0.25 : 50}
              value={incomeType === 'hourly' ? hourlyWage : monthlyIncome}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value))
                if (incomeType === 'hourly') update({ hourlyWage: val })
                else update({ monthlyIncome: val })
              }}
              className="w-full py-2.5 pl-7 pr-3 border border-[#ccc] rounded-sm text-lg font-semibold font-mono outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]"
            />
          </div>
          <input
            type="range"
            min={0}
            max={incomeType === 'hourly' ? 75 : 12000}
            step={incomeType === 'hourly' ? 0.25 : 50}
            value={incomeType === 'hourly' ? hourlyWage : monthlyIncome}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (incomeType === 'hourly') update({ hourlyWage: val })
              else update({ monthlyIncome: val })
            }}
            aria-label={incomeType === 'hourly' ? 'Hourly wage slider' : 'Monthly income slider'}
            className="w-full mt-1.5 accent-[#1a1a1a]"
          />
          <div className="text-xs text-[#888] mt-0.5 font-mono">
            {incomeType === 'hourly'
              ? `\u2248 ${formatMoney(hourlyToMonthly(hourlyWage))}/mo`
              : `\u2248 $${monthlyToHourly(monthlyIncome).toFixed(2)}/hr`}
          </div>
        </div>

        <div>
          <label htmlFor="raise-input" className="block text-xs font-semibold uppercase tracking-[0.05em] text-[#555] mb-1.5 font-mono">
            {incomeType === 'hourly' ? 'Hourly raise amount' : 'Monthly raise amount'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-base font-semibold">$</span>
            <input
              id="raise-input"
              type="number"
              min={0}
              step={incomeType === 'hourly' ? 0.25 : 25}
              value={raiseAmount}
              onChange={(e) => update({ raiseAmount: Math.max(0, Number(e.target.value)) })}
              className="w-full py-2.5 pl-7 pr-3 border border-[#ccc] rounded-sm text-lg font-semibold font-mono outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]"
            />
          </div>
          <input
            type="range"
            min={0}
            max={incomeType === 'hourly' ? 20 : 3000}
            step={incomeType === 'hourly' ? 0.25 : 25}
            value={raiseAmount}
            onChange={(e) => update({ raiseAmount: Number(e.target.value) })}
            aria-label={incomeType === 'hourly' ? 'Hourly raise slider' : 'Monthly raise slider'}
            className="w-full mt-1.5 accent-[#1a1a1a]"
          />
          <div className="text-xs text-[#888] mt-0.5 font-mono">
            {incomeType === 'hourly'
              ? `\u2248 ${formatMoney(hourlyToMonthly(raiseAmount))}/mo`
              : `\u2248 $${monthlyToHourly(raiseAmount).toFixed(2)}/hr`}
          </div>
        </div>
      </div>
    </section>
  )
}
