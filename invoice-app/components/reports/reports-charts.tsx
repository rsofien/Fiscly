"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data - replace with Strapi API call
const monthlyRevenueData = [
  { month: "Jan", revenue: 12500, invoices: 18 },
  { month: "Feb", revenue: 15800, invoices: 22 },
  { month: "Mar", revenue: 18200, invoices: 25 },
  { month: "Apr", revenue: 22400, invoices: 28 },
  { month: "May", revenue: 19600, invoices: 24 },
  { month: "Jun", revenue: 24800, invoices: 31 },
  { month: "Jul", revenue: 28300, invoices: 35 },
  { month: "Aug", revenue: 26100, invoices: 33 },
  { month: "Sep", revenue: 29500, invoices: 37 },
  { month: "Oct", revenue: 32200, invoices: 40 },
  { month: "Nov", revenue: 28900, invoices: 36 },
  { month: "Dec", revenue: 31400, invoices: 39 },
]

const invoiceStatusData = [
  { name: "Paid", value: 156, color: "#10b981" },
  { name: "Sent", value: 42, color: "#3b82f6" },
  { name: "Overdue", value: 12, color: "#ef4444" },
  { name: "Draft", value: 8, color: "#6b7280" },
]

const topCustomersData = [
  { name: "Acme Corp", revenue: 45600 },
  { name: "TechStart Inc.", revenue: 32400 },
  { name: "Global Solutions", revenue: 28900 },
  { name: "Digital Ventures", revenue: 21300 },
  { name: "Innovation Labs", revenue: 18700 },
  { name: "StartUp Co.", revenue: 15200 },
]

export function ReportsCharts() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Revenue over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ fill: "#2563eb" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
                <CardDescription>Current invoice breakdown by status</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={invoiceStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {invoiceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Volume</CardTitle>
              <CardDescription>Number of invoices issued per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="invoices" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Detailed revenue breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  $
                  {monthlyRevenueData
                    .reduce((sum, item) => sum + item.revenue, 0)
                    .toLocaleString()}
                </div>
                <p className="text-sm text-success mt-2">+24.5% from previous year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Invoice Value</CardTitle>
                <CardDescription>Per invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  $
                  {(
                    monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0) /
                    monthlyRevenueData.reduce((sum, item) => sum + item.invoices, 0)
                  ).toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Across all invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Month</CardTitle>
                <CardDescription>Highest revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {
                    monthlyRevenueData.reduce((max, item) =>
                      item.revenue > max.revenue ? item : max
                    ).month
                  }
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  $
                  {monthlyRevenueData
                    .reduce((max, item) => (item.revenue > max.revenue ? item : max))
                    .revenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
              <CardDescription>Highest spending customers this year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topCustomersData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
