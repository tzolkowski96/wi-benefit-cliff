/**
 * Hourly <-> monthly income conversion.
 * Formula: monthly = hourly x hoursPerWeek x 4.33
 */

export const DEFAULT_HOURS_PER_WEEK = 40
export const WEEKS_PER_MONTH = 4.33

export function hourlyToMonthly(hourly: number, hoursPerWeek = DEFAULT_HOURS_PER_WEEK): number {
  return Math.round(hourly * hoursPerWeek * WEEKS_PER_MONTH)
}

export function monthlyToHourly(monthly: number, hoursPerWeek = DEFAULT_HOURS_PER_WEEK): number {
  const hourly = monthly / hoursPerWeek / WEEKS_PER_MONTH
  return Math.round(hourly * 100) / 100
}
