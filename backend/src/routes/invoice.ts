import { Router, Response } from "express"
import { Invoice, InvoiceItem } from "../models/invoice.js"
import { Workspace } from "../models/workspace.js"
import AuthRequest, { authMiddleware } from "../middleware/auth.js"
import { ensureInvoiceUSDConversion } from "../services/fxService.js"

const router = Router()

// GET all invoices for workspace
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    // Build query with optional year filter
    let query: any = { workspace_id: workspace._id }
    
    // Check for year filter
    const year = req.query.year as string
    if (year && year !== "all") {
      const yearNum = parseInt(year)
      if (!isNaN(yearNum)) {
        // Use start and end of year in ISO format for MongoDB
        const startOfYear = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0)) // Jan 1, 00:00:00
        const endOfYear = new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0, 0)) // Jan 1 of next year, 00:00:00
        
        query.issueDate = { 
          $gte: startOfYear, 
          $lt: endOfYear 
        }
        
        console.log(`[invoice GET] Year filter: ${yearNum}`)
        console.log(`[invoice GET] Start: ${startOfYear.toISOString()}`)
        console.log(`[invoice GET] End: ${endOfYear.toISOString()}`)
        console.log(`[invoice GET] Query:`, JSON.stringify(query))
      }
    }

    console.log(`[invoice GET] Final query:`, JSON.stringify(query))
    
    // First, let's see ALL invoices without filter to understand the data
    const allInvoices = await Invoice.find({ workspace_id: workspace._id }).populate("customer_id")
    console.log(`[invoice GET] Total invoices in workspace: ${allInvoices.length}`)
    allInvoices.forEach(inv => {
      const issueDateType = inv.issueDate instanceof Date ? "Date" : typeof inv.issueDate
      console.log(`[invoice GET] ALL: ${inv.invoiceNumber} | issueDate=${inv.issueDate} | type=${issueDateType}`)
    })
    
    // Now apply the filter
    const invoices = await Invoice.find(query).populate("customer_id")
    
    // Debug: log what we got after filtering
    console.log(`[invoice GET] FILTERED: Found ${invoices.length} invoices`)
    invoices.forEach(inv => {
      console.log(`[invoice GET] FILTERED: ${inv.invoiceNumber}: issueDate=${inv.issueDate}`)
    })
    const invoicesWithConversion = await Promise.all(
      invoices.map(async (invoice) => {
        try {
          return await ensureInvoiceUSDConversion(invoice)
        } catch (error) {
          console.error(`[invoice GET] conversion error for ${invoice._id}:`, error)
          return invoice
        }
      })
    )
    res.json(invoicesWithConversion)
  } catch (error) {
    console.error("[invoice GET] error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST create invoice
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    const invoice = await Invoice.create({
      workspace_id: workspace._id,
      customer_id: req.body.customer_id,
      invoiceNumber: req.body.invoiceNumber,
      issueDate: req.body.issueDate,
      dueDate: req.body.dueDate,
      amount: req.body.amount,
      currency: req.body.currency || "USD",
      language: req.body.language || "en",
      status: req.body.status || "draft",
      description: req.body.description,
      notes: req.body.notes,
      paymentMethod: req.body.paymentMethod || "bank_transfer",
      issuerType: req.body.issuerType || "company",
      paidDate: req.body.paidDate,
    })

    try {
      const invoiceWithConversion = await ensureInvoiceUSDConversion(invoice)
      res.status(201).json(invoiceWithConversion)
    } catch (conversionError) {
      console.error("[invoice POST] conversion error:", conversionError)
      res.status(201).json(invoice)
    }
  } catch (error) {
    console.error("[invoice POST] error:", error)
    res.status(500).json({ error: "Failed to create invoice" })
  }
})

// GET invoice by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    const invoice = await Invoice.findOne({ _id: req.params.id, workspace_id: workspace._id })
      .populate("customer_id")
      .populate("workspace_id")
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })

    const items = await InvoiceItem.find({ invoice_id: invoice._id })
    
    try {
      const invoiceWithConversion = await ensureInvoiceUSDConversion(invoice)
      res.json({ ...invoiceWithConversion.toObject(), items })
    } catch (conversionError) {
      console.error("[invoice GET by ID] conversion error:", conversionError)
      res.json({ ...invoice.toObject(), items })
    }
  } catch (error) {
    console.error("[invoice GET by ID] error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT update invoice
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    // Get existing invoice to check if conversion fields need recalculation
    const existingInvoice = await Invoice.findOne({ _id: req.params.id, workspace_id: workspace._id })
    if (!existingInvoice) return res.status(404).json({ error: "Invoice not found" })

    // Check if amount, currency, or issueDate changed
    const needsConversion = 
      req.body.amount !== undefined && req.body.amount !== existingInvoice.amount ||
      req.body.currency !== undefined && req.body.currency !== existingInvoice.currency ||
      req.body.issueDate !== undefined && req.body.issueDate !== existingInvoice.issueDate?.toISOString()

    // Update invoice document
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, workspace_id: workspace._id },
      req.body,
      { new: true }
    )

    // Handle invoice items
    if (Array.isArray(req.body.items)) {
      // Remove all old items for this invoice
      await InvoiceItem.deleteMany({ invoice_id: invoice._id })
      // Insert new items
      const itemsToInsert = req.body.items.map(item => ({
        invoice_id: invoice._id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      }))
      await InvoiceItem.insertMany(itemsToInsert)
    }

    // Return updated invoice with items
    const items = await InvoiceItem.find({ invoice_id: invoice._id })
    
    try {
      if (needsConversion) {
        const invoiceWithConversion = await ensureInvoiceUSDConversion(invoice!)
        res.json({ ...invoiceWithConversion.toObject(), items })
      } else {
        res.json({ ...invoice!.toObject(), items })
      }
    } catch (conversionError) {
      console.error("[invoice PUT] conversion error:", conversionError)
      res.json({ ...invoice!.toObject(), items })
    }
  } catch (error) {
    console.error("[invoice PUT] error:", error)
    res.status(500).json({ error: "Failed to update invoice" })
  }
})

// DELETE invoice
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    await InvoiceItem.deleteMany({ invoice_id: req.params.id })
    await Invoice.deleteOne({ _id: req.params.id, workspace_id: workspace._id })
    res.json({ success: true })
  } catch (error) {
    console.error("[invoice DELETE] error:", error)
    res.status(500).json({ error: "Failed to delete invoice" })
  }
})

export default router
