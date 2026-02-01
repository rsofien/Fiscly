import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Users, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const token = session.user.token

  if (!token) {
    redirect("/auth/login")
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  // Get user's workspace
  const workspaceRes = await fetch(
    `${API_URL}/api/workspaces`,
    { headers, cache: "no-store" }
  )

  console.log('[DASHBOARD] Workspace response:', workspaceRes.status)

  let invoices: any[] = []
  let customers: any[] = []
  let paidThisMonth = 0
  let outstandingAmount = 0
  let totalInvoices = 0
  let totalCustomers = 0
  let dueInvoices = 0
  let overdueInvoices = 0
  let topCustomers: any[] = []
  let currencyBreakdown: Record<string, { count: number; originalTotal: number; usdTotal: number }> = {}
  let totalRevenueUSD = 0

  if (workspaceRes.ok) {
    // Fetch data from MongoDB backend
    const [invoicesRes, customersRes] = await Promise.all([
      fetch(`${API_URL}/api/invoices`, { 
        headers, 
        cache: "no-store" 
      }),
      fetch(`${API_URL}/api/customers`, { 
        headers, 
        cache: "no-store" 
      }),
    ])

    console.log('[DASHBOARD] Invoices response:', invoicesRes.status)
    console.log('[DASHBOARD] Customers response:', customersRes.status)

    const invoicesData = invoicesRes.ok ? await invoicesRes.json() : []
    const customersData = customersRes.ok ? await customersRes.json() : []
    
    console.log('[DASHBOARD] Invoices data:', invoicesData)
    console.log('[DASHBOARD] Customers data:', customersData)
    
    invoices = (Array.isArray(invoicesData) ? invoicesData : []).map((item: any) => ({
      id: item._id?.toString() || item.id,
      invoiceNumber: item.invoiceNumber,
      customerName: item.customer_id?.name || '',
      amount: item.amount,
      usdAmount: item.usdAmount || item.amount,
      currency: item.currency || 'USD',
      status: item.status,
      issueDate: item.issueDate,
      dueDate: item.dueDate,
      fxRate: item.fxRate,
      fxSource: item.fxSource,
    }))
    
    customers = Array.isArray(customersData) ? customersData : []

    const now = new Date()
    
    // Use usdAmount for all calculations to ensure consistency
    paidThisMonth = invoices
      .filter((inv: any) => {
        if (inv.status !== "paid" || !inv.issueDate) return false
        const issued = new Date(inv.issueDate)
        return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
      })
      .reduce((sum: number, inv: any) => sum + (Number(inv.usdAmount) || Number(inv.amount) || 0), 0)

    totalRevenueUSD = invoices.reduce((sum: number, inv: any) => sum + (Number(inv.usdAmount) || Number(inv.amount) || 0), 0)
    const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid')
    const paidAmountUSD = paidInvoices.reduce((sum: number, inv: any) => sum + (Number(inv.usdAmount) || Number(inv.amount) || 0), 0)
    outstandingAmount = totalRevenueUSD - paidAmountUSD

    totalInvoices = invoices.length
    totalCustomers = customers.length
    dueInvoices = invoices.filter((inv: any) => inv.status === 'sent').length
    overdueInvoices = invoices.filter((inv: any) => inv.status === 'overdue').length
    
    // Calculate currency breakdown (original currencies)
    currencyBreakdown = invoices.reduce<Record<string, { count: number; originalTotal: number; usdTotal: number }>>(
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

    // Calculate top customers using USD amounts
    topCustomers = Object.values(
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
  }

  const user = {
    name: session.user.name,
    email: session.user.email || "",
    workspaceName: (session.user as any).workspaceName ?? null,
  }

  return (
    <AppLayout user={user}>
        <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session.user.name || session.user.email}</p>
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
              <div className="text-2xl font-semibold">{totalInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dueInvoices} due, {overdueInvoices} overdue
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
              <div className="text-2xl font-semibold">{formatCurrency(outstandingAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid This Month (USD)
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatCurrency(paidThisMonth)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Paid invoices issued this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active clients
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Your highest spending clients this year</CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.invoiceCount} invoices
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Add invoices to see your top customers.</p>
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
              {Object.keys(currencyBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(currencyBreakdown).map(([currency, data]) => (
                    <div key={currency} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {currency}
                        </div>
                        <div>
                          <p className="font-medium">{data.count} invoices</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(data.originalTotal, currency)} original
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(data.usdTotal)}</p>
                        <p className="text-xs text-muted-foreground">in USD</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total USD Equivalent</span>
                      <span className="font-bold">{formatCurrency(totalRevenueUSD)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
