import type { FormState, CliffAnalysis } from '../types/index.ts'
import { formatMoney, formatMoneyWithSign } from '../utils/format.ts'
import { monthlyToHourly } from '../utils/wage.ts'
import { computeBreakEvenData } from '../utils/breakeven.ts'

interface Props {
  state: FormState
  analysis: CliffAnalysis
}

export default function PrintSummary({ state, analysis }: Props) {
  const { programs, calculableImpact, safeRaiseMax } = analysis
  const { netMonthly, netAnnual, uncalculatedLosses, foodshareLoss, schoolMealLoss, wheapLoss, customLosses } = calculableImpact

  return (
    <div className="print-summary hidden print:block print:p-8 print:text-[12px] print:text-black print:bg-white">
      <h1 className="text-xl font-bold mb-1">Benefit Cliff Analysis Summary</h1>
      <p className="text-[11px] text-[#666] mb-4">
        Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* Household details */}
      <div className="mb-4 p-3 border border-[#ddd]">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">Household Details</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
          <div>Household size: <strong>{state.householdSize}</strong></div>
          <div>Children under 18: <strong>{state.numberOfChildren}</strong></div>
          <div>Current monthly income: <strong>{formatMoney(state.currentMonthlyIncome)}</strong></div>
          <div>Monthly raise: <strong>{formatMoney(state.raiseMonthly)}</strong></div>
          <div>New monthly income: <strong>{formatMoney(state.currentMonthlyIncome + state.raiseMonthly)}</strong></div>
          {state.monthlyRent > 0 && <div>Monthly rent/mortgage: <strong>{formatMoney(state.monthlyRent)}</strong></div>}
          {state.monthlyChildcareCosts > 0 && <div>Monthly childcare costs: <strong>{formatMoney(state.monthlyChildcareCosts)}</strong></div>}
        </div>
      </div>

      {/* Net Impact */}
      <div className={`mb-4 p-3 border-2 ${netMonthly >= 0 ? 'border-[#2D6A4F]' : 'border-[#9B2226]'}`}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">Calculable Net Impact</h2>
        <div className="text-lg font-bold font-mono">
          {formatMoneyWithSign(netMonthly)}/mo ({formatMoneyWithSign(netAnnual)}/year)
        </div>
        <div className="text-[11px] mt-1 text-[#666]">
          Raise: +{formatMoney(calculableImpact.raise)}/mo
          {foodshareLoss > 0 && <> | FoodShare: -{formatMoney(foodshareLoss)}</>}
          {schoolMealLoss > 0 && <> | School meals: -{formatMoney(schoolMealLoss)}</>}
          {wheapLoss > 0 && <> | WHEAP: -{formatMoney(wheapLoss)}</>}
          {customLosses > 0 && <> | User-entered: -{formatMoney(customLosses)}</>}
        </div>
      </div>

      {/* Program statuses table */}
      <table className="w-full border-collapse mb-4 text-[11px]">
        <thead>
          <tr className="border-b-2 border-[#333]">
            <th className="text-left py-1 font-bold">Program</th>
            <th className="text-left py-1 font-bold">Threshold</th>
            <th className="text-left py-1 font-bold">Type</th>
            <th className="text-right py-1 font-bold">Value Impact</th>
            <th className="text-right py-1 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((prog) => (
            <tr key={prog.key} className="border-b border-[#ddd]">
              <td className="py-1.5">{prog.name}</td>
              <td className="py-1.5 font-mono text-[10px]">
                {prog.key === 'wisconsin_shares' && prog.entryLimit
                  ? `${formatMoney(prog.entryLimit)} / ${formatMoney(prog.exitLimit ?? prog.limit)}`
                  : `${formatMoney(prog.limit)} (${prog.basis})`}
              </td>
              <td className="py-1.5 capitalize">{prog.cliffType.replace('_', ' ')}</td>
              <td className="py-1.5 font-mono text-right">
                {prog.calculable && prog.monthlyLoss !== null
                  ? prog.monthlyLoss > 0
                    ? `-${formatMoney(prog.monthlyLoss)}/mo`
                    : '$0'
                  : 'N/A'}
              </td>
              <td className="py-1.5 font-bold text-right">
                {!prog.currentlyEligible
                  ? 'N/A'
                  : prog.lost
                    ? (prog.cliffType === 'tier_shift' && prog.currentTier && prog.newTier
                        ? `${prog.currentTier.toUpperCase()} \u2192 ${prog.newTier.toUpperCase()}`
                        : 'LOST')
                    : 'KEEP'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Uncalculated losses */}
      {uncalculatedLosses.length > 0 && (
        <div className="mb-4 p-3 border border-[#E0C97B] bg-[#FFF8E1]">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1">Additional Benefits at Risk</h2>
          <p className="text-[11px]">
            {uncalculatedLosses.join(', ')} — eligibility lost but dollar value varies
            by individual circumstances and is not included in the net impact above.
          </p>
        </div>
      )}

      {/* Safe raise */}
      <div className="mb-4 p-3 border border-[#ddd]">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-1">Maximum Safe Raise</h2>
        <p className="text-[12px]">
          {safeRaiseMax > 0
            ? <>Up to <strong className="font-mono">{formatMoney(safeRaiseMax)}/mo</strong> without losing any current benefits.</>
            : <>At or above the lowest eligibility threshold. Any raise may trigger a cliff.</>}
        </p>
      </div>

      {/* Break-even raises */}
      {(() => {
        const { rows, clearAllRaise } = computeBreakEvenData(
          programs,
          {
            householdSize: state.householdSize,
            numberOfChildren: state.numberOfChildren,
            currentMonthlyIncome: state.currentMonthlyIncome,
            monthlyRent: state.monthlyRent,
            monthlyChildcareCosts: state.monthlyChildcareCosts,
          },
          {
            customBadgerCareAdultValue: state.customBadgerCareAdultValue,
            customBadgerCareChildValue: state.customBadgerCareChildValue,
            customWisconsinSharesValue: state.customWisconsinSharesValue,
          },
        )
        if (rows.length === 0) return null
        return (
          <div className="mb-4 p-3 border border-[#ddd]">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2">Break-Even Raises</h2>
            <table className="w-full border-collapse text-[11px] mb-2">
              <thead>
                <tr className="border-b border-[#999]">
                  <th className="text-left py-1 font-bold">Program</th>
                  <th className="text-right py-1 font-bold">Cliff At</th>
                  <th className="text-right py-1 font-bold">Break Even</th>
                  <th className="text-right py-1 font-bold">Hourly</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-b border-[#eee]">
                    <td className="py-1">{row.name}</td>
                    <td className="py-1 font-mono text-right">+{formatMoney(row.cliffDistance)}/mo</td>
                    <td className="py-1 font-mono text-right">+{formatMoney(row.breakEvenMonthly)}/mo</td>
                    <td className="py-1 font-mono text-right">+${monthlyToHourly(row.breakEvenMonthly).toFixed(2)}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clearAllRaise !== null && (
              <p className="text-[11px]">
                {rows.length > 1
                  ? <>To clear all cliffs: <strong className="font-mono">+{formatMoney(clearAllRaise)}/mo</strong> (+${monthlyToHourly(clearAllRaise).toFixed(2)}/hr)</>
                  : <>Break-even raise: <strong className="font-mono">+{formatMoney(clearAllRaise)}/mo</strong> (+${monthlyToHourly(clearAllRaise).toFixed(2)}/hr)</>}
              </p>
            )}
          </div>
        )
      })()}

      {/* Disclaimer */}
      <div className="text-[10px] text-[#999] leading-relaxed border-t border-[#ddd] pt-3">
        <strong>Disclaimer:</strong> This calculator provides estimates based on 2025 income
        eligibility thresholds published by UW-Madison Division of Extension. FoodShare estimates
        use a simplified formula. When housing and childcare costs are provided, the shelter
        and dependent care deductions are applied. The shelter deduction cap ($712/mo) assumes
        no elderly or disabled household members. School meal
        values use USDA federal reimbursement rates (SY 2025-26) as an upper-bound proxy.
        This tool does not replace official eligibility determinations through ACCESS Wisconsin
        (access.wisconsin.gov). Contact your county financial educator or call 211 (877-847-2211)
        for personalized guidance.
        <br /><br />
        <strong>Sources:</strong> UW-Madison Division of Extension (2025 thresholds);
        Wisconsin DHS Operations Memo 2024-18 (FoodShare); USDA FNS FR 07/24/2025
        (school meal rates); Wisconsin DCF (Wisconsin Shares thresholds).
      </div>
    </div>
  )
}
