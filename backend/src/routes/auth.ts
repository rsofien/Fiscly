import { Router, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/user.js"
import { Workspace } from "../models/workspace.js"
import AuthRequest, { authMiddleware } from "../middleware/auth.js"

const router = Router()

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    console.log('[REGISTER] Starting registration...')
    console.log('[REGISTER] Request body:', JSON.stringify(req.body, null, 2))
    const { email, password, name, companyName } = req.body

    if (!email || !password || !name) {
      console.log('[REGISTER] ❌ Missing required fields')
      return res.status(400).json({ error: "Email, password, and name are required" })
    }
    console.log('[REGISTER] ✓ All required fields present')

    // Check if user already exists
    console.log('[REGISTER] Checking if user exists:', email)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('[REGISTER] ❌ User already exists')
      return res.status(400).json({ error: "User already exists" })
    }
    console.log('[REGISTER] ✓ User does not exist, proceeding...')

    // Create new user (password will be hashed by pre-save hook)
    console.log('[REGISTER] Creating user...')
    const user = await User.create({
      email,
      password,
      name,
      role: "user",
    })
    console.log('[REGISTER] ✓ User created with ID:', user._id.toString())

    // Create default workspace for new user
    console.log('[REGISTER] Creating workspace for user...')
    const workspace = await Workspace.create({
      user_id: user._id.toString(),
      user_email: user.email,
      name: companyName || name,
      email: email,
      invoicePrefix: "INV",
      defaultPaymentTerms: 15,
    })
    console.log('[REGISTER] ✓ Workspace created with ID:', workspace._id.toString())

    // Generate JWT token
    console.log('[REGISTER] Generating JWT token...')
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email,
        userId: user._id.toString()
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    )
    console.log('[REGISTER] ✓ Token generated')

    console.log('[REGISTER] ✅ Registration complete!')
    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token,
    })
  } catch (error) {
    console.error("[REGISTER] ❌ ERROR:", error)
    console.error("[REGISTER] Error stack:", error instanceof Error ? error.stack : 'No stack')
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    console.log('[LOGIN] Login attempt for:', req.body.email)
    const { email, password } = req.body

    if (!email || !password) {
      console.log('[LOGIN] ❌ Missing credentials')
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    console.log('[LOGIN] Looking up user...')
    const user = await User.findOne({ email })
    if (!user) {
      console.log('[LOGIN] ❌ User not found')
      return res.status(401).json({ error: "Invalid credentials" })
    }
    console.log('[LOGIN] ✓ User found:', user._id.toString())

    // Check password
    console.log('[LOGIN] Validating password...')
    const isValid = await (user as any).comparePassword(password)
    if (!isValid) {
      console.log('[LOGIN] ❌ Invalid password')
      return res.status(401).json({ error: "Invalid credentials" })
    }
    console.log('[LOGIN] ✓ Password valid')

    // Generate JWT token
    console.log('[LOGIN] Generating token...')
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email,
        userId: user._id.toString()
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    )
    console.log('[LOGIN] ✅ Login successful!')

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token,
    })
  } catch (error) {
    console.error("[LOGIN] ❌ ERROR:", error)
    console.error("[LOGIN] Error stack:", error instanceof Error ? error.stack : 'No stack')
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/auth/session - validate current session
router.get("/session", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[SESSION] Checking session for user:', req.user?.id)
    const userId = req.user?.id
    if (!userId) {
      console.log('[SESSION] ❌ No user ID in request')
      return res.status(401).json({ error: "Invalid session" })
    }

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("[auth/session] error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/auth/logout (client-side token removal, no server action needed)
router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" })
})

export default router
