import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, DollarSign, Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // TODO: Fetch real data from Strapi
  const stats = {
    totalInvoices: 156,
    outstandingAmount: 48750.00,
    paidThisMonth: 125890.00,
    totalCustomers: 42,
    dueInvoices: 12,
    overdueInvoices: 3,
  }

  const topCustomers = [
    { id: 1, name: "Acme Corporation", totalSpent: 45600.00, invoiceCount: 24 },
    { id: 2, name: "TechStart Inc.", totalSpent: 32400.00, invoiceCount: 18 },
    { id: 3, name: "Global Solutions", totalSpent: 28900.00, invoiceCount: 15 },
    { id: 4, name: "Digital Ventures", totalSpent: 21300.00, invoiceCount: 12 },
    { id: 5, name: "Innovation Labs", totalSpent: 18700.00, invoiceCount: 9 },
  ]

  return (
    <AppLayout user={session.user}>
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
            <Button size="sm" variant="outline">
              Get Started Guide
            </Button>
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
              <div className="text-2xl font-semibold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.dueInvoices} due, {stats.overdueInvoices} overdue
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
              <div className="text-2xl font-semibold">${stats.outstandingAmount.toLocaleString()}</div>
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
              <div className="text-2xl font-semibold">${stats.paidThisMonth.toLocaleString()}</div>
              <p className="text-xs text-success mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
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
              <div className="text-2xl font-semibold">{stats.totalCustomers}</div>
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
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
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
                      ${customer.totalSpent.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
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
