"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"

type LineItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

type Invoice = {
  id: string
  invoiceNumber: string
  customer?: { name: string; email: string; phone?: string; address?: string }
  amount: number
  status: string
  issueDate: string
  dueDate: string
  description?: string
  notes?: string
  paymentMethod?: string
  paidDate?: string
  items?: LineItem[]
}

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data.data || data)
      }
    } catch (error) {
      console.error("Failed to fetch invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Invoice not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden border-b bg-background sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        <Card>
          <CardContent className="p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
                <p className="text-muted-foreground">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* From/To */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="font-semibold mb-3">From:</h3>
                <div className="text-sm">
                  <p className="font-medium">Your Company</p>
                  <p className="text-muted-foreground">123 Business Street</p>
                  <p className="text-muted-foreground">City, State 12345</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Bill To:</h3>
                <div className="text-sm">
                  {invoice.customer ? (
                    <>
                      <p className="font-medium">{invoice.customer.name}</p>
                      {invoice.customer.email && (
                        <p className="text-muted-foreground">{invoice.customer.email}</p>
                      )}
                      {invoice.customer.phone && (
                        <p className="text-muted-foreground">{invoice.customer.phone}</p>
                      )}
                      {invoice.customer.address && (
                        <p className="text-muted-foreground whitespace-pre-line">{invoice.customer.address}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No customer assigned</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              {invoice.paidDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Paid Date</p>
                  <p className="font-medium">{new Date(invoice.paidDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {invoice.description && (
              <div className="mb-8">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{invoice.description}</p>
              </div>
            )}

            {/* Line Items Table */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Items</h3>
                <table className="w-full">
                  <thead className="border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left py-2 font-semibold">Description</th>
                      <th className="text-right py-2 font-semibold">Quantity</th>
                      <th className="text-right py-2 font-semibold">Unit Price</th>
                      <th className="text-right py-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">${item.unitPrice.toFixed(2)}</td>
                        <td className="text-right py-3 font-medium">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Amount */}
            <div className="border-t border-b py-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-3xl font-bold">${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {invoice.paymentMethod && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="text-sm capitalize">{invoice.paymentMethod.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground pt-8 border-t">
              <p>Thank you for your business!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
