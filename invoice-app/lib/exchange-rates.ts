// Exchange rates: 1 unit of currency = X USD
// Updated: January 21, 2026
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.1713,      // 1 EUR = 1.1713 USD
  GBP: 1.3924,      // 1 GBP = 1.3924 USD
  CAD: 0.7353,      // 1 CAD = 0.7353 USD
  AUD: 0.6579,      // 1 AUD = 0.6579 USD
  JPY: 0.00673,     // 1 JPY = 0.00673 USD
  CHF: 1.1364,      // 1 CHF = 1.1364 USD
  CNY: 0.1381,      // 1 CNY = 0.1381 USD
  INR: 0.01203,     // 1 INR = 0.01203 USD
  MXN: 0.05865,     // 1 MXN = 0.05865 USD
  BRL: 0.2012,      // 1 BRL = 0.2012 USD
  ZAR: 0.05361,     // 1 ZAR = 0.05361 USD
  AED: 0.2723,      // 1 AED = 0.2723 USD
  SAR: 0.2666,      // 1 SAR = 0.2666 USD
  TRY: 0.0311,      // 1 TRY = 0.0311 USD
  RUB: 0.01081,     // 1 RUB = 0.01081 USD
  KRW: 0.000753,    // 1 KRW = 0.000753 USD
  SGD: 0.7463,      // 1 SGD = 0.7463 USD
  HKD: 0.1279,      // 1 HKD = 0.1279 USD
  NOK: 0.0939,      // 1 NOK = 0.0939 USD
  SEK: 0.0960,      // 1 SEK = 0.0960 USD
  DKK: 0.1456,      // 1 DKK = 0.1456 USD
  PLN: 0.2519,      // 1 PLN = 0.2519 USD
  THB: 0.02869,     // 1 THB = 0.02869 USD
  MYR: 0.2165,      // 1 MYR = 0.2165 USD
  IDR: 0.0000639,   // 1 IDR = 0.0000639 USD
  PHP: 0.01791,     // 1 PHP = 0.01791 USD
  CZK: 0.04396,     // 1 CZK = 0.04396 USD
  HUF: 0.002837,    // 1 HUF = 0.002837 USD
  RON: 0.2188,      // 1 RON = 0.2188 USD
  NZD: 0.6061,      // 1 NZD = 0.6061 USD
  CLP: 0.001039,    // 1 CLP = 0.001039 USD
  COP: 0.000255,    // 1 COP = 0.000255 USD
  ARS: 0.001212,    // 1 ARS = 0.001212 USD
  MAD: 0.0990,      // 1 MAD = 0.0990 USD (Moroccan Dirham)
  TND: 0.3205,      // 1 TND = 0.3205 USD (Tunisian Dinar)
  DZD: 0.007435,    // 1 DZD = 0.007435 USD (Algerian Dinar)
  EGP: 0.02051,     // 1 EGP = 0.02051 USD (Egyptian Pound)
}

/**
 * Convert an amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency code (e.g., "EUR")
 * @param toCurrency - The target currency code (e.g., "USD")
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string = "USD"
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const fromRate = EXCHANGE_RATES[fromCurrency.toUpperCase()]
  const toRate = EXCHANGE_RATES[toCurrency.toUpperCase()]

  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}, using 1:1`)
    return amount
  }

  // Convert to USD first, then to target currency
  // Example: 500 EUR to USD = 500 * 1.1713 = 585.65 USD
  const amountInUSD = amount * fromRate
  return amountInUSD / toRate
}

/**
 * Convert an amount to USD
 * @param amount - The amount to convert
 * @param currency - The source currency code
 * @returns The amount in USD
 */
export function toUSD(amount: number, currency: string): number {
  if (currency.toUpperCase() === 'USD') {
    return amount
  }
  
  const rate = EXCHANGE_RATES[currency.toUpperCase()]
  
  if (!rate) {
    console.warn(`Exchange rate not found for ${currency}, using 1:1`)
    return amount
  }

  // Example: 500 EUR * 1.1713 = 585.65 USD
  return amount * rate
}

/**
 * Get the exchange rate from one currency to another
 * @param fromCurrency - The source currency code
 * @param toCurrency - The target currency code
 * @returns The exchange rate
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string = "USD"): number {
  const fromRate = EXCHANGE_RATES[fromCurrency.toUpperCase()]
  const toRate = EXCHANGE_RATES[toCurrency.toUpperCase()]

  if (!fromRate || !toRate) {
    return 1
  }

  return toRate / fromRate
}

/**
 * Check if a currency code is supported
 * @param currency - The currency code to check
 * @returns True if the currency is supported
 */
export function isCurrencySupported(currency: string): boolean {
  return currency.toUpperCase() in EXCHANGE_RATES
}

/**
 * Get all supported currency codes
 * @returns Array of supported currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES)
}
