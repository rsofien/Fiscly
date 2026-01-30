import { Router, Response } from "express"
import { Invoice, InvoiceItem } from "../models/invoice.js"
import { Workspace } from "../models/workspace.js"
import AuthRequest, { authMiddleware } from "../middleware/auth.js"

const router = Router()

// GET all invoices for workspace
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    const invoices = await Invoice.find({ workspace_id: workspace._id }).populate("customer_id")
    res.json(invoices)
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
      status: req.body.status || "draft",
      description: req.body.description,
      notes: req.body.notes,
      paymentMethod: req.body.paymentMethod || "bank_transfer",
      paidDate: req.body.paidDate,
    })

    res.status(201).json(invoice)
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
    res.json({ ...invoice.toObject(), items })
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

    // Update invoice document
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, workspace_id: workspace._id },
      req.body,
      { new: true }
    )
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })

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
    res.json({ ...invoice.toObject(), items })
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
