"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Download, Trash2, Eye, Printer, Pencil, Calendar } from "lucide-react"
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
import { formatCurrency, type Currency } from "@/lib/currency"

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
  currency?: Currency
  language?: "en" | "fr"
  issuerType?: "company" | "personal"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Invoice["status"]>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState<Partial<Invoice>>({ 
    status: "draft", 
    currency: "USD",
    language: "en",
    issuerType: "company",
  })
  const year = searchParams.get("year") || "2026"

  useEffect(() => {
    fetchInvoices()
    fetchCustomers()
  }, [year])

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

  const handleYearChange = (newYear: string) => {
    if (newYear === "2026") {
      router.push("/invoices")
    } else {
      router.push(`/invoices?year=${newYear}`)
    }
  }

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const yearParam = `?year=${year}`
      const response = await fetch(`/api/invoices${yearParam}`)
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
      
      // Keep customer as string (MongoDB ObjectId), don't convert to number
      const invoiceData = {
        ...formData,
        customer: formData.customer, // Keep as string ObjectId
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
          currency: "USD",
          language: "en",
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

  const handleEditInvoice = async (invoice: Invoice) => {
    try {
      // Fetch full invoice details with items from the API
      const response = await fetch(`/api/invoices/${invoice.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invoice details')
      }
      const fullInvoice = await response.json()
      
      console.log('Editing invoice:', fullInvoice)
      setEditingInvoice(fullInvoice)
      
      // Pre-fill form with existing invoice data
      const items = fullInvoice.items && fullInvoice.items.length > 0 
        ? fullInvoice.items.map(item => ({
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: item.total || (item.quantity * item.unitPrice) || 0
          }))
        : [{ description: '', quantity: 1, unitPrice: fullInvoice.amount || 0, total: fullInvoice.amount || 0 }]
      
      console.log('Invoice items:', fullInvoice.items)
      console.log('Transformed items:', items)
      
      // Extract customer ID - handle both string and object formats
      const customerId = typeof fullInvoice.customer === 'string' 
        ? fullInvoice.customer 
        : fullInvoice.customer?.id || fullInvoice.customer?._id || ''
      
      // Format dates for HTML date input (yyyy-MM-dd)
      const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        // Handle both ISO timestamp and yyyy-MM-dd formats
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };
      
      setFormData({
        invoiceNumber: fullInvoice.invoiceNumber || '',
        customer: customerId,
        issueDate: formatDateForInput(fullInvoice.issueDate),
        dueDate: formatDateForInput(fullInvoice.dueDate),
        amount: fullInvoice.amount || 0,
        currency: fullInvoice.currency || 'USD',
        language: fullInvoice.language || 'en',
        issuerType: fullInvoice.issuerType || 'company',
        status: fullInvoice.status || 'draft',
        description: fullInvoice.description || '',
        notes: fullInvoice.notes || '',
        paymentMethod: fullInvoice.paymentMethod || 'bank_transfer',
        items: items
      })
      
      console.log('Form data set:', {
        customer: customerId,
        paymentMethod: fullInvoice.paymentMethod,
        notes: fullInvoice.notes,
        items: items
      })
      
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error('Failed to fetch invoice details:', error)
      alert('Failed to load invoice details. Please try again.')
    }
  }

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return

    // Validation: all items must have a non-empty description
    if (formData.items && formData.items.some(item => !item.description || item.description.trim() === "")) {
      alert("All invoice items must have a description.")
      return
    }

    try {
      // Calculate total amount from line items
      const totalAmount = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0

      // Prepare invoice data, including items
      const invoiceData = {
        ...formData,
        customer_id: formData.customer, // Send as customer_id for backend
        amount: totalAmount,
        items: formData.items, // Send items to backend for update
      }

      console.log('[UPDATE INVOICE] Sending data:', invoiceData)

      const response = await fetch(`/api/invoices/${editingInvoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingInvoice(null)
        setFormData({ 
          status: "draft", 
          currency: "USD",
        })
        fetchInvoices()
      } else {
        const error = await response.json()
        console.error("Failed to update invoice:", error)
        alert(`Failed to update invoice: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Failed to update invoice:", error)
      alert("Failed to update invoice. Please try again.")
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
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
          <div className="flex items-center gap-2 ml-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Year:</span>
            <div className="flex gap-1">
                {["2024", "2025", "2026", "all"].map((yearOption) => (
                <Button
                  key={yearOption}
                  variant={year === yearOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearChange(yearOption)}
                  className={year === yearOption ? "bg-primary" : ""}
                >
                  {yearOption === "all" ? "All" : yearOption}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="icon" onClick={exportToCSV} className="sm:hidden">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
          <Button size="icon" onClick={() => setIsAddDialogOpen(true)} className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
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
                    <TableCell>{formatCurrency(invoice.amount, invoice.currency || 'USD')}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
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
        </div>
      </Card>

      {/* Add Invoice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Add a new invoice</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
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
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start p-3 border rounded-md bg-dark-800">
                    <div className="sm:col-span-4">
                      <Label htmlFor={`item-desc-${index}`} className="text-xs">Description *</Label>
                      <Input
                        id={`item-desc-${index}`}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
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
                    <div className="sm:col-span-2">
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
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="text-sm bg-dark-700"
                      />
                    </div>
                    <div className="sm:col-span-2 flex sm:items-end">
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
              <div className="flex justify-end mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                <div className="text-right">
                  <div className="text-sm text-dark-400">Total Amount</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(formData.items?.reduce((sum, item) => sum + item.total, 0) || 0, formData.currency || 'USD')}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency || "USD"}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="TND">TND - Tunisian Dinar</option>
                  <option value="USDT">USDT - Tether</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={formData.language || "en"}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as "en" | "fr" })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
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
              <Label htmlFor="issuer-type">Invoice From</Label>
              <select
                id="issuer-type"
                value={formData.issuerType || "company"}
                onChange={(e) => setFormData({ ...formData, issuerType: e.target.value as "company" | "personal" })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="company">Company</option>
                <option value="personal">Personal</option>
              </select>
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

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>Update invoice details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-issue-date">Issue Date *</Label>
                <Input
                  id="edit-issue-date"
                  type="date"
                  value={formData.issueDate || ""}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-due-date">Due Date *</Label>
                <Input
                  id="edit-due-date"
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
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start p-3 border rounded-md bg-dark-800">
                    <div className="sm:col-span-4">
                      <Label htmlFor={`edit-item-desc-${index}`} className="text-xs">Description *</Label>
                      <Input
                        id={`edit-item-desc-${index}`}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor={`edit-item-qty-${index}`} className="text-xs">Quantity *</Label>
                      <Input
                        id={`edit-item-qty-${index}`}
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="1"
                        className="text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor={`edit-item-price-${index}`} className="text-xs">Unit Price *</Label>
                      <Input
                        id={`edit-item-price-${index}`}
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="text-sm bg-dark-700"
                      />
                    </div>
                    <div className="sm:col-span-2 flex sm:items-end">
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
              <div className="flex justify-end mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                <div className="text-right">
                  <div className="text-sm text-dark-400">Total Amount</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(formData.items?.reduce((sum, item) => sum + item.total, 0) || 0, formData.currency || 'USD')}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency || "USD"}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="TND">TND - Tunisian Dinar</option>
                  <option value="USDT">USDT - Tether</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={formData.language || "en"}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as "en" | "fr" })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-payment-method">Payment Method</Label>
                <select
                  id="edit-payment-method"
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
              <Label htmlFor="edit-issuer-type">Invoice From</Label>
              <select
                id="edit-issuer-type"
                value={formData.issuerType || "company"}
                onChange={(e) => setFormData({ ...formData, issuerType: e.target.value as "company" | "personal" })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="company">Company</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
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
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of services..."
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <textarea
                id="edit-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or payment terms..."
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingInvoice(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInvoice}>Update Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
