import { Router, Response } from "express"
import { Customer } from "../models/customer.js"
import { Workspace } from "../models/workspace.js"
import AuthRequest, { authMiddleware } from "../middleware/auth.js"

const router = Router()

// GET all customers for workspace
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    const customers = await Customer.find({ workspace_id: workspace._id })
    res.json(customers)
  } catch (error) {
    console.error("[customer GET] error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST create customer
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    const customer = await Customer.create({
      workspace_id: workspace._id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
      address: req.body.address,
      taxId: req.body.taxId,
      vat: req.body.vat,
      siren: req.body.siren,
      status: req.body.status || "active",
      notes: req.body.notes,
    })

    res.status(201).json(customer)
  } catch (error) {
    console.error("[customer POST] error:", error)
    res.status(500).json({ error: "Failed to create customer" })
  }
})

// GET customer by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    const customer = await Customer.findOne({ _id: req.params.id, workspace_id: workspace._id })
    if (!customer) return res.status(404).json({ error: "Customer not found" })

    res.json(customer)
  } catch (error) {
    console.error("[customer GET by ID] error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT update customer
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, workspace_id: workspace._id },
      req.body,
      { new: true }
    )
    if (!customer) return res.status(404).json({ error: "Customer not found" })

    res.json(customer)
  } catch (error) {
    console.error("[customer PUT] error:", error)
    res.status(500).json({ error: "Failed to update customer" })
  }
})

// DELETE customer
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: "Invalid user" })

    const workspace = await Workspace.findOne({ user_id: userId })
    if (!workspace) return res.status(404).json({ error: "Workspace not found" })

    await Customer.deleteOne({ _id: req.params.id, workspace_id: workspace._id })
    res.json({ success: true })
  } catch (error) {
    console.error("[customer DELETE] error:", error)
    res.status(500).json({ error: "Failed to delete customer" })
  }
})

export default router
