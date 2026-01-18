import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, DollarSign, Users, AlertCircle, CheckCircle2 } from "lucide-react"
import { GetStartedButton } from "@/components/dashboard/get-started-button"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const [reportsRes, invoicesRes, customersRes] = await Promise.all([
    fetch(`${baseUrl}/api/reports`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/invoices`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/customers`, { cache: "no-store" }),
  ])

  const reports = reportsRes.ok ? await reportsRes.json() : null
  const invoicesData = invoicesRes.ok ? await invoicesRes.json() : []
  const customersData = customersRes.ok ? await customersRes.json() : []
  const invoices = Array.isArray(invoicesData) ? invoicesData : []
  const user = {
    name: session.user.name,
    email: session.user.email || "",
    workspaceName: (session.user as any).workspaceName ?? null,
  }

  const now = new Date()
  const paidThisMonth = invoices
    .filter((inv) => {
      if (inv.status !== "paid" || !inv.issueDate) return false
      const issued = new Date(inv.issueDate)
      return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
    })
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)

  const outstandingAmount = reports?.outstanding
    ?? invoices
      .filter((inv) => inv.status !== "paid")
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)

  const totalInvoices = reports?.invoiceCount ?? invoices.length
  const totalCustomers = Array.isArray(customersData) ? customersData.length : 0
  const dueInvoices = reports?.byStatus?.sent ?? 0
  const overdueInvoices = reports?.byStatus?.overdue ?? 0

  const topCustomers = Object.values(
    invoices.reduce<Record<string, { name: string; totalSpent: number; invoiceCount: number }>>(
      (acc, inv) => {
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
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  const formatCurrency = (value: number) =>
    `$${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

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
