/**
 * Sync FormState to/from URL query params.
 * URL format: ?hh=3&ch=1&type=hourly&inc=16&raise=2
 *
 * - Reads from URL on mount (lets caseworkers share links)
 * - Writes on every change via history.replaceState (no page reloads)
 */

import { useState, useCallback, useEffect } from 'react'
import type { FormState, IncomeType } from '../types/index.ts'
import { hourlyToMonthly, monthlyToHourly } from '../engine/wage.ts'
import { deriveState, syncIncomeTypeSwitch } from '../engine/derive.ts'
import type { FormInputs } from '../engine/derive.ts'

const DEFAULTS: FormInputs = {
  householdSize: 3,
  numberOfChildren: 1,
  incomeType: 'hourly',
  hourlyWage: 16.0,
  monthlyIncome: 2771,
  raiseAmount: 2.0,
  monthlyRent: 0,
  monthlyChildcareCosts: 0,
  customBadgerCareAdultValue: null,
  customBadgerCareChildValue: null,
  customWisconsinSharesValue: null,
}

function parseUrl(): Partial<FormInputs> {
  const params = new URLSearchParams(window.location.search)
  const result: Partial<FormInputs> = {}

  const hh = params.get('hh')
  if (hh) result.householdSize = Math.max(1, Math.min(8, parseInt(hh, 10) || DEFAULTS.householdSize))

  const ch = params.get('ch')
  if (ch !== null) result.numberOfChildren = Math.max(0, parseInt(ch, 10) || 0)

  const type = params.get('type') as IncomeType | null
  if (type === 'hourly' || type === 'monthly') result.incomeType = type

  const inc = params.get('inc')
  if (inc) {
    const val = parseFloat(inc)
    if (!isNaN(val) && val >= 0) {
      if ((result.incomeType ?? DEFAULTS.incomeType) === 'hourly') {
        result.hourlyWage = val
        result.monthlyIncome = hourlyToMonthly(val)
      } else {
        result.monthlyIncome = Math.round(val)
        result.hourlyWage = monthlyToHourly(val)
      }
    }
  }

  const raise = params.get('raise')
  if (raise) {
    const val = parseFloat(raise)
    if (!isNaN(val) && val >= 0) result.raiseAmount = val
  }

  const rent = params.get('rent')
  if (rent) {
    const val = parseInt(rent, 10)
    if (!isNaN(val) && val >= 0) result.monthlyRent = val
  }

  const care = params.get('care')
  if (care) {
    const val = parseInt(care, 10)
    if (!isNaN(val) && val >= 0) result.monthlyChildcareCosts = val
  }

  const bca = params.get('bca')
  if (bca) {
    const val = parseInt(bca, 10)
    if (!isNaN(val) && val > 0) result.customBadgerCareAdultValue = val
  }

  const bcc = params.get('bcc')
  if (bcc) {
    const val = parseInt(bcc, 10)
    if (!isNaN(val) && val > 0) result.customBadgerCareChildValue = val
  }

  const wis = params.get('wis')
  if (wis) {
    const val = parseInt(wis, 10)
    if (!isNaN(val) && val > 0) result.customWisconsinSharesValue = val
  }

  return result
}

function buildInitialState(): FormState {
  const fromUrl = parseUrl()
  const inputs: FormInputs = { ...DEFAULTS, ...fromUrl }
  return deriveState(inputs)
}

function writeUrl(state: FormState) {
  const params = new URLSearchParams()
  params.set('hh', String(state.householdSize))
  params.set('ch', String(state.numberOfChildren))
  params.set('type', state.incomeType)

  if (state.incomeType === 'hourly') {
    params.set('inc', String(state.hourlyWage))
    params.set('raise', String(state.raiseAmount))
  } else {
    params.set('inc', String(state.monthlyIncome))
    params.set('raise', String(state.raiseAmount))
  }

  // Only include deductions in URL when non-zero
  if (state.monthlyRent > 0) params.set('rent', String(state.monthlyRent))
  if (state.monthlyChildcareCosts > 0) params.set('care', String(state.monthlyChildcareCosts))

  // Only include custom benefit values when non-null
  if (state.customBadgerCareAdultValue !== null) params.set('bca', String(state.customBadgerCareAdultValue))
  if (state.customBadgerCareChildValue !== null) params.set('bcc', String(state.customBadgerCareChildValue))
  if (state.customWisconsinSharesValue !== null) params.set('wis', String(state.customWisconsinSharesValue))

  // Preserve non-form params (e.g. lang) set by other hooks
  const current = new URLSearchParams(window.location.search)
  const lang = current.get('lang')
  if (lang) params.set('lang', lang)

  const newUrl = window.location.pathname + '?' + params.toString()
  history.replaceState(null, '', newUrl)
}

export type FormUpdater = (patch: Partial<FormState>) => void

export function useUrlState(): [FormState, FormUpdater] {
  const [state, setState] = useState<FormState>(buildInitialState)

  useEffect(() => {
    writeUrl(state)
  }, [state])

  const update = useCallback((patch: Partial<FormState>) => {
    setState((prev) => {
      // Handle income type switching
      let merged = { ...prev, ...patch }
      if ('incomeType' in patch && patch.incomeType !== prev.incomeType) {
        const switchPatch = syncIncomeTypeSwitch(prev, patch.incomeType!)
        merged = { ...merged, ...switchPatch }
      }

      // Sync hourly ↔ monthly when individual fields change
      if (merged.incomeType === 'hourly' && 'hourlyWage' in patch) {
        merged.monthlyIncome = hourlyToMonthly(merged.hourlyWage)
      } else if (merged.incomeType === 'monthly' && 'monthlyIncome' in patch) {
        merged.hourlyWage = monthlyToHourly(merged.monthlyIncome)
      }

      return deriveState(merged)
    })
  }, [])

  return [state, update]
}
