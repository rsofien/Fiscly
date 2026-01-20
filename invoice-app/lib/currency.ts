export type Currency = 'USD' | 'CAD' | 'EUR' | 'USDT'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  CAD: 'C$',
  EUR: '€',
  USDT: 'USDT',
}

export const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  CAD: 'en-CA',
  EUR: 'de-DE',
  USDT: 'en-US',
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  const numValue = Number(value) || 0
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatted = numValue.toLocaleString(CURRENCY_LOCALES[currency], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // For USDT, format as: 372.00 USDT
  if (currency === 'USDT') {
    return `${formatted} ${symbol}`
  }
  
  // For others, use symbol prefix: $1,234.56, C$1,234.56 or €1,234.56
  return `${symbol}${formatted}`
}

export function getCurrencyLabel(currency: Currency): string {
  const labels: Record<Currency, string> = {
    USD: 'US Dollar',
    CAD: 'Canadian Dollar',
    EUR: 'Euro',
    USDT: 'Tether (USDT)',
  }
  return labels[currency]
}
