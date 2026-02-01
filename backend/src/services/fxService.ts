import { Invoice } from '../models/invoice.js'

// Cache for FX rates to avoid repeated API calls
const fxCache: Map<string, { rate: number; date: string }> = new Map()

// Better API for FX rates (Frankfurter is free and reliable)
const FX_API_BASE = 'https://api.frankfurter.app'

/**
 * Get FX rate for a specific currency pair on a specific date
 * Falls back to closest previous day if exact date not available
 */
export async function getFXRate(
  fromCurrency: string,
  toCurrency: string,
  date: Date
): Promise<{ rate: number; actualDate: string; source: string }> {
  const dateStr = date.toISOString().split('T')[0]
  const cacheKey = `${fromCurrency}-${toCurrency}-${dateStr}`
  
  // Check cache first
  if (fxCache.has(cacheKey)) {
    const cached = fxCache.get(cacheKey)!
    console.log(`[FX] Cache hit: ${cacheKey} = ${cached.rate}`)
    return { 
      rate: cached.rate, 
      actualDate: cached.date,
      source: 'cache'
    }
  }
  
  try {
    // Try to get rate for the specific date first
    console.log(`[FX] Fetching rate for ${fromCurrency} -> ${toCurrency} on ${dateStr}`)
    const rate = await fetchHistoricalRate(fromCurrency, toCurrency, dateStr)
    
    if (rate && rate !== 1) {
      console.log(`[FX] Got rate: ${rate} for ${dateStr}`)
      fxCache.set(cacheKey, { rate, date: dateStr })
      return { rate, actualDate: dateStr, source: 'api' }
    }
    
    // Fallback: try previous days up to 7 days back
    console.log(`[FX] No rate for ${dateStr}, trying fallback dates...`)
    for (let i = 1; i <= 7; i++) {
      const prevDate = new Date(date)
      prevDate.setDate(prevDate.getDate() - i)
      const prevDateStr = prevDate.toISOString().split('T')[0]
      const prevCacheKey = `${fromCurrency}-${toCurrency}-${prevDateStr}`
      
      if (fxCache.has(prevCacheKey)) {
        const cached = fxCache.get(prevCacheKey)!
        console.log(`[FX] Using cached rate from ${prevDateStr}: ${cached.rate}`)
        return { 
          rate: cached.rate, 
          actualDate: prevDateStr,
          source: 'cache-fallback'
        }
      }
      
      const prevRate = await fetchHistoricalRate(fromCurrency, toCurrency, prevDateStr)
      if (prevRate && prevRate !== 1) {
        fxCache.set(prevCacheKey, { rate: prevRate, date: prevDateStr })
        console.log(`[FX] Using rate from ${prevDateStr}: ${prevRate} (fallback)`)
        return { 
          rate: prevRate, 
          actualDate: prevDateStr,
          source: 'api-fallback'
        }
      }
    }
    
    // Final fallback: try alternative API for current rate
    console.log(`[FX] WARNING: No historical rate found from Frankfurter, trying alternative API...`)
    const altRate = await fetchCurrentRateAlternative(fromCurrency, toCurrency)
    
    if (altRate && altRate > 0 && altRate !== 1) {
      console.log(`[FX] Got rate from alternative API: ${altRate}`)
      return { 
        rate: altRate, 
        actualDate: new Date().toISOString().split('T')[0],
        source: 'alt-api-fallback'
      }
    }
    
    // Very last resort: use current rate (which may be 1)
    console.log(`[FX] CRITICAL: Using current rate as last resort...`)
    const currentRate = await fetchCurrentRate(fromCurrency, toCurrency)
    console.log(`[FX] Final rate: ${currentRate} (source: current-fallback)`)
    return { 
      rate: currentRate, 
      actualDate: new Date().toISOString().split('T')[0],
      source: 'current-fallback'
    }
    
  } catch (error) {
    console.error(`[FX] Error fetching rate:`, error)
    // Fallback to current rate on error
    const currentRate = await fetchCurrentRate(fromCurrency, toCurrency)
    return { 
      rate: currentRate, 
      actualDate: new Date().toISOString().split('T')[0],
      source: 'error-fallback'
    }
  }
}

/**
 * Fetch historical rate for a specific date using Frankfurter API
 * Example: https://api.frankfurter.app/2026-01-01?from=CAD&to=USD
 * Note: Frankfurter doesn't support all currencies (e.g., TND). 
 * For unsupported currencies, we return null and let the caller handle fallback.
 */
async function fetchHistoricalRate(
  fromCurrency: string,
  toCurrency: string,
  dateStr: string
): Promise<number | null> {
  try {
    // Frankfurter API format: /{date}?from={base}&to={target}
    const url = `${FX_API_BASE}/${dateStr}?from=${fromCurrency}&to=${toCurrency}`
    console.log(`[FX] API call: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.log(`[FX] API error: ${response.status} ${response.statusText} for ${fromCurrency} -> ${toCurrency}`)
      // Don't return 1 here - return null so caller knows API failed
      return null
    }
    
    const data: any = await response.json()
    console.log(`[FX] API response:`, JSON.stringify(data))
    
    // Frankfurter returns: { "rates": { "USD": 0.735 }, "base": "CAD", "date": "2026-01-01" }
    // OR for unsupported currencies: { "rates": {}, "base": "TND", "date": "2026-01-01" }
    const rate = data.rates?.[toCurrency]
    
    if (rate && typeof rate === 'number' && rate > 0) {
      console.log(`[FX] Got rate ${rate} for ${fromCurrency} -> ${toCurrency}`)
      return rate
    }
    
    // Check if rates object is empty (unsupported currency)
    if (data.rates && Object.keys(data.rates).length === 0) {
      console.log(`[FX] Currency ${fromCurrency} not supported by Frankfurter API`)
    } else {
      console.log(`[FX] No rate found in response for ${toCurrency}`)
    }
    return null
  } catch (error) {
    console.error(`[FX] Error fetching historical rate:`, error)
    return null
  }
}

/**
 * Fetch current FX rate from alternative API (for currencies not supported by Frankfurter)
 * Uses exchangerate-api.com as fallback
 */
async function fetchCurrentRateAlternative(fromCurrency: string, toCurrency: string): Promise<number | null> {
  try {
    // exchangerate-api.com free tier - supports more currencies including TND
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    console.log(`[FX] Alternative API call: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.log(`[FX] Alternative API error: ${response.status}`)
      return null
    }
    
    const data: any = await response.json()
    const rate = data.rates?.[toCurrency]
    
    if (rate && typeof rate === 'number' && rate > 0) {
      console.log(`[FX] Alternative API got rate: ${rate} for ${fromCurrency} -> ${toCurrency}`)
      return rate
    }
    
    console.log(`[FX] Alternative API: No rate found for ${toCurrency}`)
    return null
  } catch (error) {
    console.error(`[FX] Error fetching from alternative API:`, error)
    return null
  }
}

/**
 * Fetch current FX rate
 * Tries Frankfurter first, falls back to alternative API
 */
async function fetchCurrentRate(fromCurrency: string, toCurrency: string): Promise<number> {
  // Try Frankfurter first
  try {
    const url = `${FX_API_BASE}/latest?from=${fromCurrency}&to=${toCurrency}`
    console.log(`[FX] Current rate API: ${url}`)
    
    const response = await fetch(url)
    
    if (response.ok) {
      const data: any = await response.json()
      const rate = data.rates?.[toCurrency]
      
      if (rate && typeof rate === 'number' && rate > 0) {
        console.log(`[FX] Current rate from Frankfurter: ${rate}`)
        return rate
      }
    }
    
    console.log(`[FX] Frankfurter failed or unsupported currency, trying alternative API...`)
  } catch (error) {
    console.error(`[FX] Frankfurter error:`, error)
  }
  
  // Try alternative API
  const altRate = await fetchCurrentRateAlternative(fromCurrency, toCurrency)
  if (altRate && altRate > 0) {
    return altRate
  }
  
  // Last resort: return 1 with a warning
  console.error(`[FX] CRITICAL: No rate found for ${fromCurrency} -> ${toCurrency}. Using 1:1 rate.`)
  return 1
}

/**
 * Convert amount to USD using stored rate or fetch new rate
 */
export async function convertToUSD(
  amount: number,
  currency: string,
  date: Date
): Promise<{
  usdAmount: number
  fxRate: number
  fxDate: string
  fxSource: string
}> {
  console.log(`[FX] Converting ${amount} ${currency} to USD on ${date.toISOString().split('T')[0]}`)
  
  if (!currency || currency === 'USD') {
    console.log(`[FX] Native USD, no conversion needed`)
    return {
      usdAmount: amount,
      fxRate: 1,
      fxDate: date.toISOString().split('T')[0],
      fxSource: 'native'
    }
  }
  
  const { rate, actualDate, source } = await getFXRate(currency, 'USD', date)
  
  const usdAmount = amount * rate
  console.log(`[FX] Result: ${amount} ${currency} * ${rate} = ${usdAmount} USD`)
  
  return {
    usdAmount: usdAmount,
    fxRate: rate,
    fxDate: actualDate,
    fxSource: source
  }
}

/**
 * Update invoice with USD conversion if not already done
 * Also recalculate if fxRate is 1 for non-USD (indicates no conversion was done)
 */
export async function ensureInvoiceUSDConversion(invoice: any): Promise<any> {
  const currency = invoice.currency || 'USD'
  
  // If already converted with valid rate, return as-is
  if (invoice.usdAmount !== undefined && 
      invoice.usdAmount !== null && 
      invoice.fxRate !== undefined &&
      invoice.fxRate !== null &&
      (currency === 'USD' || invoice.fxRate !== 1)) {
    console.log(`[FX] Invoice ${invoice._id} already converted: ${invoice.usdAmount} USD (rate: ${invoice.fxRate})`)
    return invoice
  }
  
  if (currency === 'USD') {
    console.log(`[FX] Invoice ${invoice._id} is USD, setting native conversion`)
    await Invoice.findByIdAndUpdate(invoice._id, {
      usdAmount: invoice.amount,
      fxRate: 1,
      fxDate: new Date().toISOString().split('T')[0],
      fxSource: 'native',
    })
    return { ...invoice.toObject(), usdAmount: invoice.amount, fxRate: 1 }
  }
  
  try {
    console.log(`[FX] Converting invoice ${invoice._id}: ${invoice.amount} ${invoice.currency || 'USD'}`)
    
    const currency = invoice.currency || 'USD'
    const amount = invoice.amount || 0
    const issueDate = new Date(invoice.issueDate || Date.now())
    
    const conversion = await convertToUSD(amount, currency, issueDate)
    
    console.log(`[FX] Saving conversion to DB: usdAmount=${conversion.usdAmount}, fxRate=${conversion.fxRate}`)
    
    // Update the invoice in database
    await Invoice.findByIdAndUpdate(invoice._id, {
      usdAmount: conversion.usdAmount,
      fxRate: conversion.fxRate,
      fxDate: conversion.fxDate,
      fxSource: conversion.fxSource,
    })
    
    return {
      ...invoice.toObject(),
      usdAmount: conversion.usdAmount,
      fxRate: conversion.fxRate,
      fxDate: conversion.fxDate,
      fxSource: conversion.fxSource,
    }
  } catch (error) {
    console.error(`[FX] Error converting invoice ${invoice._id}:`, error)
    return invoice
  }
}
