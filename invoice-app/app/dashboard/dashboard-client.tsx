"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Users, CheckCircle2, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { Button } from "@/components/ui/button"

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

export function DashboardPageClient({ user }: { user: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  
  // Get year from URL or default to current year (2026)
  const currentYear = 2026
  const selectedYear = searchParams.get("year") || currentYear.toString()
  
  // Generate year options (2024, 2025, 2026, All)
  const yearOptions = ["2024", "2025", "2026", "all"]

  useEffect(() => {
    fetchDashboardData()
  }, [selectedYear])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Build URL with year filter
      const yearParam = selectedYear !== currentYear.toString() ? `?year=${selectedYear}` : ""
      
      const [invoicesRes, customersRes] = await Promise.all([
        fetch(`/api/invoices${yearParam}`),
        fetch(`/api/customers`),
      ])

      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : []
      const customersData = customersRes.ok ? await customersRes.json() : []
      
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

      const now = new Date()
      
      // Calculate metrics
      const paidThisMonth = invoices
        .filter((inv: any) => {
          if (inv.status !== "paid" || !inv.issueDate) return false
          const issued = new Date(inv.issueDate)
          return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
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

      setData({
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
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleYearChange = (year: string) => {
    if (year === "2026") {
      // Default year - remove param from URL
      router.push("/dashboard")
    } else {
      router.push(`/dashboard?year=${year}`)
    }
  }

  if (loading) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout user={user}>
        <div className="text-red-500">Failed to load dashboard data</div>
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
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Year:</span>
            <div className="flex gap-1">
              {yearOptions.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearChange(year)}
                  className={selectedYear === year ? "bg-primary" : ""}
                >
                  {year === "all" ? "All" : year}
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
                Total Invoices
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
                Total Revenue (USD)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatCurrency(data.totalRevenueUSD)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedYear === "all" ? "All years" : `Year ${selectedYear}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding (USD)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatCurrency(data.outstandingAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending payment
              </p>
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
                Current month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
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
                <p className="text-sm text-muted-foreground">No customer data available.</p>
              )}
            </CardContent>
          </Card>

          {/* Currency Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Breakdown</CardTitle>
              <CardDescription>Invoice totals by original currency</CardDescription>
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
                        <p className="text-xs text-muted-foreground">in USD</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total USD Equivalent</span>
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
