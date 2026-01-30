import { Router, Response } from "express"
import { Workspace } from "../models/workspace.js"
import AuthRequest, { authMiddleware } from "../middleware/auth.js"

const router = Router()

// Helper to get workspace for user
const getUserWorkspace = async (userId: string) => {
  return Workspace.findOne({ user_id: userId })
}

// GET workspace for current user
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    console.log("[workspace GET] Request from userId:", userId)
    if (!userId) {
      return res.status(401).json({ error: "Invalid user" })
    }

    let workspace = await getUserWorkspace(userId)
    console.log("[workspace GET] Found workspace:", workspace?._id, "Logo:", workspace?.logo, "Signature:", workspace?.signature)

    if (!workspace) {
      // Create default workspace
      workspace = await Workspace.create({
        user_id: userId,
        user_email: req.user.email,
        name: "My Company",
        invoicePrefix: "INV",
        defaultPaymentTerms: 15,
      })
      console.log("[workspace GET] Created new workspace:", workspace._id)
    }

    const response = {
      id: workspace._id.toString(),
      documentId: workspace._id.toString(),
      name: workspace.name,
      email: workspace.email || "",
      address: workspace.address || "",
      phone: workspace.phone || "",
      invoicePrefix: workspace.invoicePrefix,
      defaultPaymentTerms: workspace.defaultPaymentTerms,
      defaultNotes: workspace.defaultNotes || "",
      matriculeFiscale: workspace.matriculeFiscale || "",
      personal_name: workspace.personal_name || "",
      personal_email: workspace.personal_email || "",
      personal_phone: workspace.personal_phone || "",
      logo: workspace.logo || null,
      signature: workspace.signature || null,
    }
    console.log("[workspace GET] Returning logo:", response.logo, "signature:", response.signature)
    res.json(response)
  } catch (error) {
    console.error("[workspace GET] error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT update workspace
router.put("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: "Invalid user" })
    }

    const body = req.body
    console.log("[workspace PUT] updating for userId", userId, "body:", body)

    let workspace = await getUserWorkspace(userId)
    if (!workspace) {
      workspace = await Workspace.create({
        user_id: userId,
        user_email: req.user.email,
        name: body.name || "My Company",
        email: body.email,
        address: body.address,
        phone: body.phone,
        invoicePrefix: body.invoicePrefix || "INV",
        defaultPaymentTerms: body.defaultPaymentTerms || 15,
        defaultNotes: body.defaultNotes,
        matriculeFiscale: body.matriculeFiscale,
      })
    } else {
      workspace.name = body.name
      workspace.email = body.email
      workspace.address = body.address
      workspace.phone = body.phone
      workspace.invoicePrefix = body.invoicePrefix
      workspace.defaultPaymentTerms = body.defaultPaymentTerms
      workspace.defaultNotes = body.defaultNotes
      workspace.matriculeFiscale = body.matriculeFiscale
      workspace.personal_name = body.personal_name
      workspace.personal_email = body.personal_email
      workspace.personal_phone = body.personal_phone

      console.log("[workspace PUT] logo from body:", body.logo)
      console.log("[workspace PUT] signature from body:", body.signature)
      
      if (body.logo) {
        console.log("[workspace PUT] Setting logo:", body.logo)
        workspace.logo = body.logo
        workspace.markModified('logo')
      }
      if (body.signature) {
        console.log("[workspace PUT] Setting signature:", body.signature)
        workspace.signature = body.signature
        workspace.markModified('signature')
      }
      
      console.log("[workspace PUT] workspace before save:", { logo: workspace.logo, signature: workspace.signature })

      await workspace.save()
      
      console.log("[workspace PUT] workspace after save:", { logo: workspace.logo, signature: workspace.signature })
    }

    console.log("[workspace PUT] update success")
    res.json({
      id: workspace._id.toString(),
      documentId: workspace._id.toString(),
      name: workspace.name,
      email: workspace.email || "",
      address: workspace.address || "",
      phone: workspace.phone || "",
      invoicePrefix: workspace.invoicePrefix,
      defaultPaymentTerms: workspace.defaultPaymentTerms,
      defaultNotes: workspace.defaultNotes || "",
      matriculeFiscale: workspace.matriculeFiscale || "",
      personal_name: workspace.personal_name || "",
      personal_email: workspace.personal_email || "",
      personal_phone: workspace.personal_phone || "",
      logo: workspace.logo || null,
      signature: workspace.signature || null,
    })
  } catch (error) {
    console.error("[workspace PUT] error:", error)
    res.status(500).json({ error: "Failed to update workspace" })
  }
})

export default router
