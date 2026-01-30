"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"
import { formatCurrency, type Currency } from "@/lib/currency"

const translations = {
  en: {
    invoice: "INVOICE",
    status: "Status",
    from: "From:",
    billTo: "Bill To:",
    issueDate: "Issue Date",
    dueDate: "Due Date",
    description: "Description",
    items: "Items",
    itemDescription: "Description",
    quantity: "Quantity",
    unitPrice: "Unit Price",
    total: "Total",
    totalAmount: "Total Amount",
    notes: "Notes",
    paymentMethod: "Payment Method",
    matriculeFiscale: "Tax ID",
    noCustomer: "No customer assigned",
    back: "Back",
    print: "Print",
    downloadPDF: "Download PDF",
    thankYou: "Thank you for your business!",
    statusDraft: "DRAFT",
    statusSent: "SENT",
    statusPaid: "PAID",
    statusOverdue: "OVERDUE",
    statusCancelled: "CANCELLED",
    taxClarification: "VAT not applicable – DevSync SUARL, fully exporting company. Export of services – Article 262 CGI.",
    authorizedSignature: "Authorized Signature",
  },
  fr: {
    invoice: "FACTURE",
    status: "Statut",
    from: "De :",
    billTo: "Facturer à :",
    issueDate: "Date d'émission",
    dueDate: "Date d'échéance",
    description: "Description",
    items: "Articles",
    itemDescription: "Description",
    quantity: "Quantité",
    unitPrice: "Prix unitaire",
    total: "Total",
    totalAmount: "Montant total",
    notes: "Notes",
    paymentMethod: "Mode de paiement",
    matriculeFiscale: "Matricule Fiscale",
    noCustomer: "Aucun client assigné",
    back: "Retour",
    print: "Imprimer",
    downloadPDF: "Télécharger PDF",
    thankYou: "Merci pour votre confiance !",
    statusDraft: "BROUILLON",
    statusSent: "ENVOYÉ",
    statusPaid: "PAYÉ",
    statusOverdue: "EN RETARD",
    statusCancelled: "ANNULÉ",
    taxClarification: "TVA non applicable – DevSync SUARL, société totalement exportatrice. Export de services – article 262 CGI.",
    authorizedSignature: "Signature autorisée",
  },
}

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
  customer?: { name: string; email: string; phone?: string; address?: string; company?: string }
  amount: number
  currency?: Currency
  language?: "en" | "fr"
  issuerType?: "company" | "personal"
  status: string
  issueDate: string
  dueDate: string
  description?: string
  notes?: string
  paymentMethod?: string
  paidDate?: string
  items?: LineItem[]
}

type Workspace = {
  name: string
  email: string
  phone: string
  address: string
  matriculeFiscale: string
  personal_name?: string
  personal_email?: string
  personal_phone?: string
  logo?: {
    url: string
  }
  signature?: {
    url: string
  }
}

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
    fetchWorkspace()
  }, [params.id])

  const fetchWorkspace = async () => {
    try {
      const response = await fetch("/api/workspace")
      if (response.ok) {
        const data = await response.json()
        setWorkspace(data)
      }
    } catch (error) {
      console.error("Failed to fetch workspace:", error)
    }
  }

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

  const lang = invoice.language || "en"
  const t = translations[lang]
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"
  
  // Debug workspace logo
  console.log('[PREVIEW] Workspace:', { 
    hasWorkspace: !!workspace, 
    hasLogo: !!workspace?.logo, 
    logoUrl: workspace?.logo?.url,
    logoId: workspace?.logo?.id,
    logoName: workspace?.logo?.name,
    signatureUrl: workspace?.signature?.url,
    signatureId: workspace?.signature?.id,
    fullWorkspace: workspace 
  });
  
  // Try logo.id as fallback if url is empty
  const logoUrl = workspace?.logo?.url ? 
    (workspace.logo.url.startsWith('http') ? workspace.logo.url : `${API_URL}${workspace.logo.url}`) 
    : workspace?.logo?.id ?
    `${API_URL}/uploads/${workspace.logo.id}` 
    : null
  
  const signatureUrl = workspace?.signature?.url ? 
    (workspace.signature.url.startsWith('http') ? workspace.signature.url : `${API_URL}${workspace.signature.url}`) 
    : workspace?.signature?.id ?
    `${API_URL}/uploads/${workspace.signature.id}` 
    : null
  
  console.log('[PREVIEW] Computed URLs:', { logoUrl, signatureUrl, issuerType: invoice.issuerType });

  // Debug invoice items
  console.log('[PREVIEW] Invoice items:', invoice.items);

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden border-b bg-background sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              {t.print}
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              {t.downloadPDF}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-4 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                {logoUrl && invoice.issuerType !== "personal" && (
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="h-8 object-contain mb-1"
                  />
                )}
                <h1 className="text-xl font-bold">{t.invoice}</h1>
                <p className="text-xs text-muted-foreground">#{invoice.invoiceNumber}</p>
                {workspace?.matriculeFiscale && invoice.issuerType !== "personal" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.matriculeFiscale}: {workspace.matriculeFiscale}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">{t.status}</div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status === 'draft' ? t.statusDraft :
                   invoice.status === 'sent' ? t.statusSent :
                   invoice.status === 'paid' ? t.statusPaid :
                   invoice.status === 'overdue' ? t.statusOverdue :
                   invoice.status === 'cancelled' ? t.statusCancelled :
                   invoice.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* From/To */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-xs font-semibold mb-1">{t.from}</h3>
                <div className="text-xs">
                  {invoice.issuerType === "personal" ? (
                    <>
                      <p className="font-medium">{workspace?.personal_name || "Your Name"}</p>
                      {workspace?.personal_email && <p className="text-muted-foreground">{workspace.personal_email}</p>}
                      {workspace?.personal_phone && <p className="text-muted-foreground">{workspace.personal_phone}</p>}
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{workspace?.name || "Your Company"}</p>
                      {workspace?.email && <p className="text-muted-foreground">{workspace.email}</p>}
                      {workspace?.phone && <p className="text-muted-foreground">{workspace.phone}</p>}
                      {workspace?.address && (
                        <p className="text-muted-foreground whitespace-pre-line">{workspace.address}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold mb-1">{t.billTo}</h3>
                <div className="text-xs">
                  {invoice.customer ? (
                    <>
                      <p className="font-medium">{invoice.customer.company || invoice.customer.name}</p>
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
                    <p className="text-muted-foreground">{t.noCustomer}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{t.issueDate}</div>
                <div className="font-medium">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{t.dueDate}</div>
                <div className="font-medium text-xs">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
              </div>
              {invoice.description && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">{t.description}</div>
                  <div className="font-medium text-xs">{invoice.description}</div>
                </div>
              )}
            </div>

            {/* Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold mb-2">{t.items}</h3>
                <table className="w-full text-xs">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-1 font-semibold">{t.itemDescription}</th>
                      <th className="text-right py-1 font-semibold">{t.quantity}</th>
                      <th className="text-right py-1 font-semibold">{t.unitPrice}</th>
                      <th className="text-right py-1 font-semibold">{t.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-1">{item.description}</td>
                        <td className="text-right py-1">{item.quantity}</td>
                        <td className="text-right py-1">{formatCurrency(item.unitPrice, invoice.currency || 'USD')}</td>
                        <td className="text-right py-1 font-medium">{formatCurrency(item.total, invoice.currency || 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Amount */}
            <div className="border-t border-b py-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.totalAmount}</span>
                <span className="text-xl font-bold">{formatCurrency(invoice.amount, invoice.currency || 'USD')}</span>
              </div>
              {invoice.paymentMethod && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">{t.paymentMethod}</span>
                  <span className="text-xs capitalize">{invoice.paymentMethod.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            {/* Tax Clarification */}
            {invoice.issuerType !== "personal" && (
              <div className="mb-3 text-xs text-muted-foreground italic">
                {t.taxClarification}
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold mb-1">{t.notes}</h3>
                <p className="text-xs text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {/* Signature */}
            {signatureUrl && invoice.issuerType !== "personal" && (
              <div className="mt-4 mb-3">
                <div className="flex flex-col items-end">
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    className="h-12 object-contain mb-1"
                  />
                  <div className="border-t border-gray-400 pt-0.5 text-xs text-muted-foreground">
                    {t.authorizedSignature}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-3 border-t">
              <p>{t.thankYou}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
