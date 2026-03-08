/**
 * Money formatting and percentage helpers.
 */

export function formatMoney(amount: number): string {
  const rounded = Math.round(amount)
  const abs = Math.abs(rounded)
  const formatted = '$' + abs.toLocaleString('en-US')
  return rounded < 0 ? '-' + formatted : formatted
}

export function formatMoneyWithSign(amount: number): string {
  const rounded = Math.round(amount)
  if (rounded >= 0) return '+' + formatMoney(rounded)
  return formatMoney(rounded)
}

export function formatPercent(value: number): string {
  return Math.round(value) + '%'
}
