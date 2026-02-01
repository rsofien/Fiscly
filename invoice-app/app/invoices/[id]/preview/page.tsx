"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
    taxClarification: "VAT not applicable – Export of services – Article 262 CGI.",
    authorizedSignature: "Authorized Signature",
    paymentMethods: {
      bank_transfer: "Bank Transfer",
      card: "Card",
      crypto: "Crypto",
      cash: "Cash"
    }
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
    taxClarification: "TVA non applicable – Export de services – article 262 CGI.",
    authorizedSignature: "Signature autorisée",
    paymentMethods: {
      bank_transfer: "Virement bancaire",
      card: "Carte",
      crypto: "Crypto",
      cash: "Espèces"
    }
  },
}

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const lang = (invoice?.language || "en") as "en" | "fr"
  const t = translations[lang]

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
        // Also fetch workspace settings
        fetchWorkspace()
      }
    } catch (error) {
      console.error("Failed to fetch invoice:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800">Invoice not found</div>
      </div>
    )
  }

  // Compute logo and signature URLs
  const logoUrl = workspace?.logo?.url ? 
    (workspace.logo.url.startsWith('http') ? workspace.logo.url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${workspace.logo.url}`) 
    : workspace?.logo?.id ?
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/uploads/${workspace.logo.id}` 
    : null
  
  const signatureUrl = workspace?.signature?.url ? 
    (workspace.signature.url.startsWith('http') ? workspace.signature.url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${workspace.signature.url}`) 
    : workspace?.signature?.id ?
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/uploads/${workspace.signature.id}` 
    : null

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Toolbar - hidden when printing */}
      <div className="print:hidden border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="bg-white text-black border-gray-300 hover:bg-gray-100"
            >
              <Printer className="mr-2 h-4 w-4" />
              {t.print}
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="bg-white text-black border-gray-300 hover:bg-gray-100"
            >
              <Download className="mr-2 h-4 w-4" />
              {t.downloadPDF}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-4 max-w-4xl">
        {/* Invoice Card - WHITE BACKGROUND FOR PRINT */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
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
                <h1 className="text-xl font-bold text-black">{t.invoice}</h1>
                <p className="text-xs text-gray-500">#{invoice.invoiceNumber}</p>
                {workspace?.matriculeFiscale && invoice.issuerType !== "personal" && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.matriculeFiscale}: {workspace.matriculeFiscale}
                  </p>
                )}
              </div>
              {/* Status - HIDDEN WHEN PRINTING */}
              <div className="text-right print:hidden">
                <div className="text-xs text-gray-500 mb-1">{t.status}</div>
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
                <h3 className="text-xs font-semibold mb-1 text-black">{t.from}</h3>
                <div className="text-xs text-black">
                  {invoice.issuerType === "personal" ? (
                    <>
                      <p className="font-medium">{workspace?.personal_name || "Your Name"}</p>
                      {workspace?.personal_email && <p className="text-gray-600">{workspace.personal_email}</p>}
                      {workspace?.personal_phone && <p className="text-gray-600">{workspace.personal_phone}</p>}
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{workspace?.name || "Your Company"}</p>
                      {workspace?.email && <p className="text-gray-600">{workspace.email}</p>}
                      {workspace?.phone && <p className="text-gray-600">{workspace.phone}</p>}
                      {workspace?.address && (
                        <p className="text-gray-600 whitespace-pre-line">{workspace.address}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold mb-1 text-black">{t.billTo}</h3>
                <div className="text-xs text-black">
                  {invoice.customer ? (
                    <>
                      <p className="font-medium">{invoice.customer.company || invoice.customer.name}</p>
                      {invoice.customer.email && (
                        <p className="text-gray-600">{invoice.customer.email}</p>
                      )}
                      {invoice.customer.phone && (
                        <p className="text-gray-600">{invoice.customer.phone}</p>
                      )}
                      {invoice.customer.address && (
                        <p className="text-gray-600 whitespace-pre-line">{invoice.customer.address}</p>
                      )}
                      {invoice.customer.vat && (
                        <p className="text-gray-600">VAT: {invoice.customer.vat}</p>
                      )}
                      {invoice.customer.siren && (
                        <p className="text-gray-600">SIREN: {invoice.customer.siren}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-600">{t.noCustomer}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">{t.issueDate}</div>
                <div className="font-medium text-black">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">{t.dueDate}</div>
                <div className="font-medium text-xs text-black">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
              </div>
              {invoice.description && (
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t.description}</div>
                  <div className="font-medium text-xs text-black">{invoice.description}</div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold mb-2 text-black">{t.items}</h3>
              <table className="w-full text-xs">
                <thead className="border-b border-gray-300">
                  <tr>
                    <th className="text-left py-1 font-semibold text-black">{t.itemDescription}</th>
                    <th className="text-right py-1 font-semibold text-black">{t.quantity}</th>
                    <th className="text-right py-1 font-semibold text-black">{t.unitPrice}</th>
                    <th className="text-right py-1 font-semibold text-black">{t.total}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-1 text-black">{item.description}</td>
                        <td className="text-right py-1 text-black">{item.quantity}</td>
                        <td className="text-right py-1 text-black">{formatCurrency(item.unitPrice, invoice.currency || 'USD')}</td>
                        <td className="text-right py-1 font-medium text-black">{formatCurrency(item.total, invoice.currency || 'USD')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500 italic">No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t border-b border-gray-300 py-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-black">{t.totalAmount}</span>
                <span className="text-xl font-bold text-black">{formatCurrency(invoice.amount, invoice.currency || 'USD')}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{t.paymentMethod}</span>
                <span className="text-xs text-black">{t.paymentMethods[invoice.paymentMethod as keyof typeof t.paymentMethods] || t.paymentMethods.bank_transfer}</span>
              </div>
            </div>

            {/* TVA Exemption Notice */}
            <div className="mb-3 text-xs text-gray-600 italic border-l-2 border-gray-300 pl-2">
              {t.taxClarification}
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold mb-1 text-black">{t.notes}</h3>
                <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {/* Signature */}
            {signatureUrl && invoice.issuerType !== "personal" && (
              <div className="mt-4 mb-3">
                <div className="flex flex-col items-end">
                  <img src={signatureUrl} alt="Signature" className="h-12 object-contain mb-1" />
                  <div className="border-t border-gray-400 pt-0.5 text-xs text-gray-500">{t.authorizedSignature}</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-3 border-t border-gray-200">
              <p>{t.thankYou}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
