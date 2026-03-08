/**
 * Sync FormState to/from URL query params.
 * URL format: ?hh=3&ch=1&type=hourly&inc=16&raise=2
 *
 * - Reads from URL on mount (lets caseworkers share links)
 * - Writes on every change via history.replaceState (no page reloads)
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { FormState, IncomeType } from '../types/index.ts'
import { hourlyToMonthly, monthlyToHourly } from '../utils/wage.ts'

const DEFAULTS: FormState = {
  householdSize: 3,
  numberOfChildren: 1,
  incomeType: 'hourly',
  hourlyWage: 16.0,
  monthlyIncome: 2773,
  raiseAmount: 2.0,
  currentMonthlyIncome: 2773,
  raiseMonthly: 346,
  monthlyRent: 0,
  monthlyChildcareCosts: 0,
  customBadgerCareAdultValue: null,
  customBadgerCareChildValue: null,
  customWisconsinSharesValue: null,
}

function parseUrl(): Partial<FormState> {
  const params = new URLSearchParams(window.location.search)
  const result: Partial<FormState> = {}

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
  const incomeType = fromUrl.incomeType ?? DEFAULTS.incomeType

  const hourlyWage = fromUrl.hourlyWage ?? DEFAULTS.hourlyWage
  const monthlyIncome = fromUrl.monthlyIncome ?? DEFAULTS.monthlyIncome
  const raiseAmount = fromUrl.raiseAmount ?? DEFAULTS.raiseAmount

  const householdSize = fromUrl.householdSize ?? DEFAULTS.householdSize
  let numberOfChildren = fromUrl.numberOfChildren ?? DEFAULTS.numberOfChildren

  // Enforce constraints
  if (householdSize === 1) numberOfChildren = 0
  if (numberOfChildren >= householdSize) numberOfChildren = householdSize - 1

  const currentMonthlyIncome = incomeType === 'hourly' ? hourlyToMonthly(hourlyWage) : monthlyIncome
  const raiseMonthly = incomeType === 'hourly' ? hourlyToMonthly(raiseAmount) : Math.round(raiseAmount)
  const monthlyRent = fromUrl.monthlyRent ?? DEFAULTS.monthlyRent
  const monthlyChildcareCosts = fromUrl.monthlyChildcareCosts ?? DEFAULTS.monthlyChildcareCosts

  return {
    householdSize,
    numberOfChildren,
    incomeType,
    hourlyWage,
    monthlyIncome: currentMonthlyIncome,
    raiseAmount,
    currentMonthlyIncome,
    raiseMonthly,
    monthlyRent,
    monthlyChildcareCosts,
    customBadgerCareAdultValue: fromUrl.customBadgerCareAdultValue ?? DEFAULTS.customBadgerCareAdultValue,
    customBadgerCareChildValue: fromUrl.customBadgerCareChildValue ?? DEFAULTS.customBadgerCareChildValue,
    customWisconsinSharesValue: fromUrl.customWisconsinSharesValue ?? DEFAULTS.customWisconsinSharesValue,
  }
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

  const newUrl = window.location.pathname + '?' + params.toString()
  history.replaceState(null, '', newUrl)
}

export type FormUpdater = (patch: Partial<FormState>) => void

export function useUrlState(): [FormState, FormUpdater] {
  const [state, setState] = useState<FormState>(buildInitialState)
  const isInitial = useRef(true)

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false
      writeUrl(state)
      return
    }
    writeUrl(state)
  }, [state])

  const update = useCallback((patch: Partial<FormState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }

      // Enforce constraints
      if (next.householdSize === 1) next.numberOfChildren = 0
      if (next.numberOfChildren >= next.householdSize) next.numberOfChildren = next.householdSize - 1

      // Sync derived values based on income type
      if (next.incomeType === 'hourly') {
        if ('hourlyWage' in patch || 'incomeType' in patch) {
          next.monthlyIncome = hourlyToMonthly(next.hourlyWage)
        }
        if ('incomeType' in patch && prev.incomeType === 'monthly') {
          next.hourlyWage = monthlyToHourly(prev.monthlyIncome)
          next.monthlyIncome = prev.monthlyIncome
          next.raiseAmount = monthlyToHourly(prev.raiseAmount)
        }
        next.currentMonthlyIncome = hourlyToMonthly(next.hourlyWage)
        next.raiseMonthly = hourlyToMonthly(next.raiseAmount)
      } else {
        if ('monthlyIncome' in patch || 'incomeType' in patch) {
          next.hourlyWage = monthlyToHourly(next.monthlyIncome)
        }
        if ('incomeType' in patch && prev.incomeType === 'hourly') {
          next.monthlyIncome = hourlyToMonthly(prev.hourlyWage)
          next.hourlyWage = prev.hourlyWage
          next.raiseAmount = hourlyToMonthly(prev.raiseAmount)
        }
        next.currentMonthlyIncome = next.monthlyIncome
        next.raiseMonthly = Math.round(next.raiseAmount)
      }

      return next
    })
  }, [])

  return [state, update]
}
