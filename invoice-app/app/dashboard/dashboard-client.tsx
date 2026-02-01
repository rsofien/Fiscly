"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Users, CheckCircle2, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { Button } from "@/components/ui/button"

const CURRENT_YEAR = "2026"
const YEAR_OPTIONS = ["2024", "2025", "2026", "all"]

interface DashboardData {
  invoices: any[]
  customers: any[]
  totalInvoices: number
  totalCustomers: number
  dueInvoices: number
  overdueInvoices: number
  paidThisMonth: number
  outstandingAmount: number
  totalRevenueUSD: number
  currencyBreakdown: Record<string, { count: number; originalTotal: number; usdTotal: number }>
  topCustomers: any[]
}

function calculateDashboardMetrics(invoices: any[], customers: any[]) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Calculate metrics
  const paidThisMonth = invoices
    .filter((inv: any) => {
      if (inv.status !== "paid" || !inv.issueDate) return false
      const issued = new Date(inv.issueDate)
      return issued.getMonth() === currentMonth && issued.getFullYear() === currentYear
    })
    .reduce((sum: number, inv: any) => sum + (Number(inv.usdAmount) || Number(inv.amount) || 0), 0)

  const totalRevenueUSD = invoices.reduce((sum: number, inv: any) => sum + (Number(inv.usdAmount) || Number(inv.amount) || 0), 0)
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid')
  const paidAmountUSD = paidInvoices.reduce((sum: number, inv: any) => sum + (Number(inv.usdAmount) || Number(inv.amount) || 0), 0)
  const outstandingAmount = totalRevenueUSD - paidAmountUSD

  const totalInvoices = invoices.length
  const totalCustomers = customers.length
  const dueInvoices = invoices.filter((inv: any) => inv.status === 'sent').length
  const overdueInvoices = invoices.filter((inv: any) => inv.status === 'overdue').length
  
  // Calculate currency breakdown
  const currencyBreakdown = invoices.reduce<Record<string, { count: number; originalTotal: number; usdTotal: number }>>(
    (acc: any, inv: any) => {
      const currency = inv.currency || 'USD'
      const originalAmount = Number(inv.amount) || 0
      const usdAmount = Number(inv.usdAmount) || Number(inv.amount) || 0
      
      if (!acc[currency]) {
        acc[currency] = { count: 0, originalTotal: 0, usdTotal: 0 }
      }
      acc[currency].count += 1
      acc[currency].originalTotal += originalAmount
      acc[currency].usdTotal += usdAmount
      return acc
    },
    {}
  )

  // Calculate top customers
  const topCustomers = Object.values(
    invoices.reduce<Record<string, { name: string; totalSpent: number; invoiceCount: number }>>(
      (acc: any, inv: any) => {
        const name = inv.customerName || "Unknown"
        const amount = Number(inv.usdAmount) || Number(inv.amount) || 0
        if (!acc[name]) {
          acc[name] = { name, totalSpent: 0, invoiceCount: 0 }
        }
        acc[name].totalSpent += amount
        acc[name].invoiceCount += 1
        return acc
      },
      {}
    )
  )
    .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  return {
    invoices,
    customers,
    totalInvoices,
    totalCustomers,
    dueInvoices,
    overdueInvoices,
    paidThisMonth,
    outstandingAmount,
    totalRevenueUSD,
    currencyBreakdown,
    topCustomers,
  }
}

export function DashboardPageClient({ user }: { user: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  
  // Get year from URL - default to CURRENT_YEAR
  const year = searchParams.get("year") || CURRENT_YEAR

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build URL with year filter - always include year param for consistency
      const yearParam = year !== CURRENT_YEAR ? `?year=${year}` : "?year=2026"
      
      console.log(`[DASHBOARD] Fetching data for year: ${year}`)
      
      const [invoicesRes, customersRes] = await Promise.all([
        fetch(`/api/invoices${yearParam}`),
        fetch(`/api/customers`),
      ])

      if (!invoicesRes.ok) {
        console.error("[DASHBOARD] Invoices fetch failed:", invoicesRes.status)
        setData(null)
        return
      }

      const invoicesData = await invoicesRes.json()
      const customersData = customersRes.ok ? await customersRes.json() : []
      
      console.log(`[DASHBOARD] Received ${invoicesData.length} invoices for year ${year}`)
      
      // Log invoice dates for verification
      invoicesData.forEach((inv: any) => {
        if (inv.issueDate) {
          const date = new Date(inv.issueDate)
          console.log(`[DASHBOARD] Invoice ${inv.invoiceNumber}: ${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`)
        }
      })
      
      const invoices = (Array.isArray(invoicesData) ? invoicesData : []).map((item: any) => ({
        id: item._id?.toString() || item.id,
        invoiceNumber: item.invoiceNumber,
        customerName: item.customer_id?.name || item.customer?.name || '',
        amount: item.amount,
        usdAmount: item.usdAmount || item.amount,
        currency: item.currency || 'USD',
        status: item.status,
        issueDate: item.issueDate,
        dueDate: item.dueDate,
      }))
      
      const customers = Array.isArray(customersData) ? customersData : []

      const metrics = calculateDashboardMetrics(invoices, customers)
      setData(metrics)
      
      console.log(`[DASHBOARD] Calculated total revenue: ${metrics.totalRevenueUSD} USD for year ${year}`)
    } catch (error) {
      console.error("[DASHBOARD] Failed to fetch data:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleYearChange = (newYear: string) => {
    if (newYear === CURRENT_YEAR) {
      // Default year - go to base URL
      router.push("/dashboard")
    } else {
      router.push(`/dashboard?year=${newYear}`)
    }
  }

  if (loading) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout user={user}>
        <div className="text-red-500 p-4">Failed to load dashboard data. Please try again.</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Year Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.name || user.email}</p>
          </div>
          
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-card p-2 rounded-lg border">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Year:</span>
            <div className="flex gap-1">
              {YEAR_OPTIONS.map((y) => (
                <Button
                  key={y}
                  variant={year === y ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearChange(y)}
                  className={year === y ? "bg-primary" : ""}
                >
                  {y === "all" ? "All" : y}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoices ({year === "all" ? "All" : year})
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{data.totalInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.dueInvoices} due, {data.overdueInvoices} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue ({year === "all" ? "All" : year})
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatCurrency(data.totalRevenueUSD)}</div>
              <p className="text-xs text-muted-foreground mt-1">USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding ({year === "all" ? "All" : year})
              </CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatCurrency(data.outstandingAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">USD pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid This Month
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatCurrency(data.paidThisMonth)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleString('default', { month: 'long' })} 2026
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers ({year === "all" ? "All" : year})</CardTitle>
              <CardDescription>By total revenue (USD)</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {data.topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.invoiceCount} invoices</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(customer.totalSpent)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No customer data for selected period.</p>
              )}
            </CardContent>
          </Card>

          {/* Currency Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Breakdown ({year === "all" ? "All" : year})</CardTitle>
              <CardDescription>By original currency</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(data.currencyBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.currencyBreakdown).map(([currency, breakdown]) => (
                    <div key={currency} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {currency}
                        </div>
                        <div>
                          <p className="font-medium">{breakdown.count} invoices</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(breakdown.originalTotal, currency as any)} original
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(breakdown.usdTotal)}</p>
                        <p className="text-xs text-muted-foreground">USD</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total USD</span>
                      <span className="font-bold">{formatCurrency(data.totalRevenueUSD)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No invoices for selected period.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
