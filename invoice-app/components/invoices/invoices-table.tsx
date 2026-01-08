"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  MoreHorizontal,
  Plus,
  Search,
  Download,
  Eye,
  Send,
  Trash2,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"

type Invoice = {
  id: string
  invoiceNumber: string
  customerName: string
  customerEmail: string
  amount: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  month: string
}

// Mock data - replace with Strapi API call
const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customerName: "Acme Corporation",
    customerEmail: "john@acme.com",
    amount: 2500.0,
    status: "paid",
    issueDate: "2024-04-01",
    dueDate: "2024-04-15",
    month: "April 2024",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    customerName: "TechStart Inc.",
    customerEmail: "sarah@techstart.io",
    amount: 1800.0,
    status: "sent",
    issueDate: "2024-04-05",
    dueDate: "2024-04-20",
    month: "April 2024",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    customerName: "Global Solutions",
    customerEmail: "m.chen@global.com",
    amount: 3200.0,
    status: "overdue",
    issueDate: "2024-03-10",
    dueDate: "2024-03-25",
    month: "March 2024",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    customerName: "Digital Ventures",
    customerEmail: "emily@digital.ventures",
    amount: 950.0,
    status: "draft",
    issueDate: "2024-04-10",
    dueDate: "2024-04-25",
    month: "April 2024",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    customerName: "Acme Corporation",
    customerEmail: "john@acme.com",
    amount: 4200.0,
    status: "paid",
    issueDate: "2024-03-15",
    dueDate: "2024-03-30",
    month: "March 2024",
  },
]

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  paid: { label: "Paid", variant: "success" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
}

export function InvoicesTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all")

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Group invoices by month
  const groupedInvoices = filteredInvoices.reduce((acc, invoice) => {
    if (!acc[invoice.month]) {
      acc[invoice.month] = []
    }
    acc[invoice.month].push(invoice)
    return acc
  }, {} as Record<string, Invoice[]>)

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log("Exporting CSV...")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[300px]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-6 mt-6">
          {Object.entries(groupedInvoices).map(([month, invoices]) => (
            <div key={month} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-2">{month}</h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invoice.invoiceNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.customerName}</div>
                            <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(invoice.issueDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="font-medium">${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[invoice.status].variant}>
                            {statusConfig[invoice.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/invoices/${invoice.id}/preview`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View/Print
                                </Link>
                              </DropdownMenuItem>
                              {invoice.status === "draft" && (
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Invoice
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          ))}

          {filteredInvoices.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {statusFilter === "all" 
                    ? "Get started by creating your first invoice."
                    : `No ${statusFilter} invoices at the moment.`}
                </p>
                {statusFilter === "all" && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
