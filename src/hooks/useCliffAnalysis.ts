/**
 * React hook wrapper around the pure `analyzeCliffs` engine function.
 *
 * Resolves program names via i18n, memoizes the result.
 */

import { useMemo } from 'react'
import type { HouseholdInputs, CliffAnalysis } from '../types/index.ts'
import type { CustomBenefitValues } from '../engine/types.ts'
import type { I18nKey } from '../i18n/en.ts'
import { PROGRAMS } from '../engine/data/programs.ts'
import { analyzeCliffs } from '../engine/analyzeCliffs.ts'
import type { ProgramNameMap } from '../engine/analyzeCliffs.ts'
import { useI18n } from './useI18n.ts'

export function useCliffAnalysis(inputs: HouseholdInputs, customValues?: CustomBenefitValues): CliffAnalysis {
  const { householdSize, numberOfChildren, currentMonthlyIncome, raiseMonthly, monthlyRent, monthlyChildcareCosts } = inputs
  const { t } = useI18n()

  // Resolve program names from i18n keys
  const programNames: ProgramNameMap = useMemo(() => {
    const map: ProgramNameMap = {}
    for (const prog of PROGRAMS) {
      map[prog.key] = t(('program.' + prog.key) as I18nKey)
    }
    return map
  }, [t])

  return useMemo(
    () => analyzeCliffs(inputs, programNames, customValues),
    [householdSize, numberOfChildren, currentMonthlyIncome, raiseMonthly, monthlyRent, monthlyChildcareCosts,
      customValues?.customBadgerCareAdultValue, customValues?.customBadgerCareChildValue, customValues?.customWisconsinSharesValue,
      programNames],
  )
}
