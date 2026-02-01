"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Clock, CheckCircle, AlertCircle, XCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const CURRENT_YEAR = "2026"
const YEAR_OPTIONS = ["2024", "2025", "2026", "all"]

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Get year from URL - default to CURRENT_YEAR
  const year = searchParams.get("year") || CURRENT_YEAR

  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Always include year param for consistency
      const yearParam = `?year=${year}`
      
      console.log(`[REPORTS] Fetching data for year: ${year}`)
      
      const response = await fetch(`/api/reports${yearParam}`)
      
      if (!response.ok) {
        console.error("[REPORTS] Fetch failed:", response.status)
        setData(null)
        return
      }
      
      const result = await response.json()
      
      console.log(`[REPORTS] Received data for year ${year}:`, {
        invoiceCount: result.invoiceCount,
        totalRevenue: result.totalRevenue,
        paidAmount: result.paidAmount,
        outstanding: result.outstanding
      })
      
      setData(result)
    } catch (error) {
      console.error("[REPORTS] Failed to fetch reports:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    fetchReportsData()
  }, [fetchReportsData])

  const handleYearChange = (newYear: string) => {
    if (newYear === CURRENT_YEAR) {
      router.push("/reports")
    } else {
      router.push(`/reports?year=${newYear}`)
    }
  }

  const exportToCSV = () => {
    if (!data?.invoices.length) return

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
    a.download = `invoices_report_${year}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; icon: any; label: string }> = {
      paid: { variant: 'success', icon: CheckCircle, label: 'Paid' },
      sent: { variant: 'default', icon: Clock, label: 'Sent' },
      draft: { variant: 'secondary', icon: FileText, label: 'Draft' },
      overdue: { variant: 'destructive', icon: AlertCircle, label: 'Overdue' },
      cancelled: { variant: 'outline', icon: XCircle, label: 'Cancelled' },
    }
    const config = variants[status] || variants.draft
    const Icon = config.icon
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading reports for {year}...</div>
  }

  if (!data) {
    return <div className="text-center py-8">Failed to load reports data</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold">Key Metrics ({year === "all" ? "All Years" : year})</h2>
        
        <div className="flex items-center gap-2">
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
          
          <Button variant="outline" onClick={exportToCSV} disabled={!data.invoices.length} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue ({year === "all" ? "All" : year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.invoiceCount} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Amount ({year === "all" ? "All" : year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(data.paidAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.byStatus.paid} paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding ({year === "all" ? "All" : year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(data.outstanding)}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices ({year === "all" ? "All" : year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.invoiceCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.byStatus.paid} paid, {data.byStatus.sent} sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown ({year === "all" ? "All Years" : year})</CardTitle>
          <CardDescription>Invoice counts by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{data.byStatus.paid}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-info/10 border border-info/20">
              <Clock className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold text-info">{data.byStatus.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-800 border border-dark-700">
              <FileText className="h-5 w-5 text-dark-300" />
              <div>
                <p className="text-2xl font-bold text-dark-100">{data.byStatus.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <AlertCircle className="h-5 w-5 text-danger" />
              <div>
                <p className="text-2xl font-bold text-danger">{data.byStatus.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-800 border border-dark-700">
              <XCircle className="h-5 w-5 text-dark-400" />
              <div>
                <p className="text-2xl font-bold text-dark-300">{data.byStatus.cancelled}</p>
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
            <CardTitle>Currency Breakdown ({year === "all" ? "All Years" : year})</CardTitle>
            <CardDescription>Totals by original invoice currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices ({year === "all" ? "All Years" : year})</CardTitle>
          <CardDescription>All invoices with USD conversion</CardDescription>
        </CardHeader>
        <CardContent>
          {data.invoices.length > 0 ? (
            <div className="overflow-x-auto">
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
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No invoices found for {year === "all" ? "any year" : year}. Create your first invoice to see data here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
