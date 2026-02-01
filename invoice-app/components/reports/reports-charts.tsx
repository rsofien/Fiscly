"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, DollarSign, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ReportData {
  totalRevenue: number
  paidAmount: number
  outstanding: number
  invoiceCount: number
  byStatus: {
    draft: number
    sent: number
    paid: number
    overdue: number
    cancelled: number
  }
  currencyBreakdown: Record<string, { count: number; originalTotal: number; usdTotal: number }>
  invoices: Array<{
    id: string
    number: string
    amount: number
    currency?: string
    usdAmount?: number
    status: string
    issueDate: string
  }>
}

export function ReportsCharts() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>
  }

  if (!data) {
    return <div className="text-center py-8">Failed to load reports data</div>
  }

  const exportToCSV = () => {
    if (!data.invoices.length) return

    const headers = ['Invoice #', 'Amount', 'Currency', 'USD Amount', 'Status', 'Issue Date']
    const rows = data.invoices.map(inv => [
      inv.number,
      inv.amount,
      inv.currency || 'USD',
      inv.usdAmount || inv.amount,
      inv.status,
      inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '-',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; icon: any }> = {
      paid: { variant: 'success', icon: CheckCircle },
      sent: { variant: 'default', icon: Clock },
      draft: { variant: 'secondary', icon: FileText },
      overdue: { variant: 'destructive', icon: AlertCircle },
      cancelled: { variant: 'outline', icon: XCircle },
    }
    const config = variants[status] || variants.draft
    const Icon = config.icon
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Key Metrics</h2>
        <Button variant="outline" onClick={exportToCSV} disabled={!data.invoices.length}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Main Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.invoiceCount} invoices total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.paidAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.byStatus.paid} paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.outstanding)}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.invoiceCount}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>Invoice counts by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{data.byStatus.paid}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{data.byStatus.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <FileText className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{data.byStatus.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{data.byStatus.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <XCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{data.byStatus.cancelled}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Breakdown */}
      {data.currencyBreakdown && Object.keys(data.currencyBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currency Breakdown</CardTitle>
            <CardDescription>Totals by original invoice currency</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Original Total</TableHead>
                  <TableHead>USD Equivalent</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.currencyBreakdown).map(([currency, breakdown]) => (
                  <TableRow key={currency}>
                    <TableCell className="font-medium">{currency}</TableCell>
                    <TableCell>{breakdown.count}</TableCell>
                    <TableCell>{formatCurrency(breakdown.originalTotal, currency as any)}</TableCell>
                    <TableCell>{formatCurrency(breakdown.usdTotal)}</TableCell>
                    <TableCell className="text-right">
                      {data.totalRevenue > 0 
                        ? `${((breakdown.usdTotal / data.totalRevenue) * 100).toFixed(1)}%` 
                        : '0%'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell>{data.invoiceCount}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{formatCurrency(data.totalRevenue)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>All invoices with USD conversion</CardDescription>
        </CardHeader>
        <CardContent>
          {data.invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>USD Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell>
                      {formatCurrency(inv.amount, (inv.currency || 'USD') as any)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(inv.usdAmount || inv.amount)}
                    </TableCell>
                    <TableCell>
                      {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No invoices found. Create your first invoice to see data here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
