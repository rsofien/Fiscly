import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, DollarSign, Users, AlertCircle, CheckCircle2 } from "lucide-react"
import { GetStartedButton } from "@/components/dashboard/get-started-button"
import { formatCurrency } from "@/lib/currency"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  if (!userId) {
    redirect("/auth/login")
  }

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
  const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`
  }

  // Get user's workspace
  const workspaceRes = await fetch(
    `${STRAPI_URL}/api/workspaces?filters[user_id][$eq]=${userId}`,
    { headers, cache: "no-store" }
  )

  let invoices: any[] = []
  let customers: any[] = []
  let paidThisMonth = 0
  let outstandingAmount = 0
  let totalInvoices = 0
  let totalCustomers = 0
  let dueInvoices = 0
  let overdueInvoices = 0
  let topCustomers: any[] = []
  let reports = null

  if (workspaceRes.ok) {
    const workspaceData = await workspaceRes.json()
    const workspaces = workspaceData.data || []
    
    if (workspaces.length > 0) {
      const workspaceId = workspaces[0].id

      // Fetch data directly from Strapi
      const [invoicesRes, customersRes] = await Promise.all([
        fetch(`${STRAPI_URL}/api/invoices?filters[workspace][id][$eq]=${workspaceId}&populate=*`, { 
          headers, 
          cache: "no-store" 
        }),
        fetch(`${STRAPI_URL}/api/customers?filters[workspace][id][$eq]=${workspaceId}`, { 
          headers, 
          cache: "no-store" 
        }),
      ])

      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { data: [] }
      const customersData = customersRes.ok ? await customersRes.json() : { data: [] }
      
      invoices = (invoicesData.data || []).map((item: any) => ({
        id: item.id.toString(),
        invoiceNumber: item.invoiceNumber,
        customerName: item.customer?.name || '',
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        issueDate: item.issueDate,
        dueDate: item.dueDate,
      }))
      
      customers = customersData.data || []

      const now = new Date()
      paidThisMonth = invoices
        .filter((inv: any) => {
          if (inv.status !== "paid" || !inv.issueDate) return false
          const issued = new Date(inv.issueDate)
          return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
        })
        .reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0)

      const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0)
      const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid')
      const paidAmount = paidInvoices.reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0)
      outstandingAmount = totalRevenue - paidAmount

      totalInvoices = invoices.length
      totalCustomers = customers.length
      dueInvoices = invoices.filter((inv: any) => inv.status === 'sent').length
      overdueInvoices = invoices.filter((inv: any) => inv.status === 'overdue').length

      reports = {
        totalRevenue,
        paidAmount,
        outstanding: outstandingAmount,
        invoiceCount: totalInvoices,
        byStatus: {
          draft: invoices.filter((inv: any) => inv.status === 'draft').length,
          sent: dueInvoices,
          paid: paidInvoices.length,
          overdue: overdueInvoices,
          cancelled: invoices.filter((inv: any) => inv.status === 'cancelled').length,
        }
      }

      topCustomers = Object.values(
        invoices.reduce<Record<string, { name: string; totalSpent: number; invoiceCount: number }>>(
          (acc: any, inv: any) => {
            const name = inv.customerName || "Unknown"
            const amount = Number(inv.amount) || 0
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
  }

  const user = {
    name: session.user.name,
    email: session.user.email || "",
    workspaceName: (session.user as any).workspaceName ?? null,
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session.user.name || session.user.email}</p>
        </div>

        {/* Announcement Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span>Important Announcement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Welcome to Fiscly! Start by adding your first customer and creating your first invoice. 
              Need help getting started? Check out our documentation or contact support.
            </p>
            <GetStartedButton />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                Outstanding
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
                Paid This Month
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

        <div className="grid gap-6 md:grid-cols-2">
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

          {/* Payment Support */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Connect your payment processors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <p className="font-medium">Redotpay</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accept crypto payments
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <p className="font-medium">Stripe</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accept card payments
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground">
                  More payment options coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
