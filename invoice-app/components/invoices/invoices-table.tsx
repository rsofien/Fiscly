"use client"

import { useState, useEffect } from "react"
import { Plus, Download, Trash2, Eye, Printer } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MoreHorizontal } from "lucide-react"

type LineItem = {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

type Invoice = {
  id: string
  invoiceNumber: string
  customerName?: string
  customer?: string
  amount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  issueDate: string
  dueDate: string
  description?: string
  notes?: string
  paymentMethod?: string
  items?: LineItem[]
}

type Customer = {
  id: string
  name: string
  email: string
}

export function InvoicesTable() {
  const [data, setData] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Invoice["status"]>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Invoice>>({ 
    status: "draft", 
    paymentMethod: "bank_transfer",
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }]
  })

  useEffect(() => {
    fetchInvoices()
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const result = await response.json()
        setCustomers(Array.isArray(result) ? result : result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const invoices = await response.json()
        setData(Array.isArray(invoices) ? invoices : invoices.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInvoice = async () => {
    try {
      // Calculate total amount from line items
      const totalAmount = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0
      
      // Convert customer string ID to number for Strapi
      const invoiceData = {
        ...formData,
        customer: formData.customer ? parseInt(formData.customer as string) : undefined,
        amount: totalAmount,
        items: undefined, // Remove items from invoice data, will be created separately
      }
      
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })
      
      if (response.ok) {
        const result = await response.json()
        const invoiceId = result.data?.id || result.data?.documentId
        
        // Create line items for the invoice
        if (invoiceId && formData.items) {
          for (const item of formData.items) {
            await fetch("/api/invoice-items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...item,
                invoice: invoiceId,
              }),
            })
          }
        }
        
        setFormData({ 
          status: "draft", 
          paymentMethod: "bank_transfer",
          items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }]
        })
        setIsAddDialogOpen(false)
        fetchInvoices()
      } else {
        const error = await response.json()
        console.error("Failed to add invoice:", error)
        alert(`Failed to create invoice: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Failed to add invoice:", error)
      alert("Failed to create invoice. Please try again.")
    }
  }

  const addLineItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), { description: "", quantity: 1, unitPrice: 0, total: 0 }]
    })
  }

  const removeLineItem = (index: number) => {
    const newItems = formData.items?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, items: newItems })
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...(formData.items || [])]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Auto-calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setFormData({ ...formData, items: newItems })
  }

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      const response = await fetch(`/api/invoices/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error)
    }
  }

  const exportToCSV = () => {
    const headers = ["Invoice Number", "Customer", "Amount", "Status", "Issue Date", "Due Date"]
    const rows = data.map((inv) => [
      inv.invoiceNumber,
      inv.customerName || "Unknown",
      inv.amount.toString(),
      inv.status,
      inv.issueDate,
      inv.dueDate,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoices_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredInvoices = data.filter((invoice) => {
    const matchesSearch = invoice.invoiceNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors: Record<Invoice["status"], string> = {
    draft: "secondary",
    sent: "default",
    paid: "success",
    overdue: "destructive",
    cancelled: "secondary",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customerName || "-"}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[invoice.status] as any}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/${invoice.id}/preview`} className="flex items-center">
                            <Printer className="mr-2 h-4 w-4" />
                            View/Print
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Invoice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Add a new invoice</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number">Invoice Number *</Label>
                <Input
                  id="number"
                  value={formData.invoiceNumber || ""}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-2026-001"
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <select
                  id="customer"
                  value={formData.customer || ""}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue-date">Issue Date *</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={formData.issueDate || ""}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date *</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            {/* Line Items */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-base font-semibold">Invoice Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md bg-gray-50">
                    <div className="col-span-4">
                      <Label htmlFor={`item-desc-${index}`} className="text-xs">Description *</Label>
                      <Input
                        id={`item-desc-${index}`}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-qty-${index}`} className="text-xs">Quantity *</Label>
                      <Input
                        id={`item-qty-${index}`}
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="1"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-price-${index}`} className="text-xs">Unit Price *</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="text-sm bg-gray-100"
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={(formData.items?.length || 0) <= 1}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Amount Display */}
              <div className="flex justify-end mt-4 p-3 bg-blue-50 rounded-md">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold">
                    ${(formData.items?.reduce((sum, item) => sum + item.total, 0) || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <select
                  id="payment-method"
                  value={formData.paymentMethod || "bank_transfer"}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="crypto">Crypto</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status || "draft"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of services..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or payment terms..."
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInvoice}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
