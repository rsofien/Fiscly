import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { connectDB } from "./db.js"
import workspaceRouter from "./routes/workspace.js"
import customerRouter from "./routes/customer.js"
import invoiceRouter from "./routes/invoice.js"
import authRouter from "./routes/auth.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
const missing = requiredEnvVars.filter(v => !process.env[v])
if (missing.length > 0) {
  console.error(`✗ Missing required environment variables: ${missing.join(', ')}`)
  console.error('Please add them to backend/.env file')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 1337

// Raw request logger - fires before ANY middleware
app.use((req, res, next) => {
  console.log(`[RAW REQUEST] ${req.method} ${req.url}`)
  next()
})

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Serve static files from uploads directory
const uploadsDir = path.join(__dirname, "../public/uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("[SERVER] Created uploads directory:", uploadsDir)
}
app.use("/uploads", express.static(uploadsDir))
console.log("[SERVER] Serving static files from:", uploadsDir)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueId = Math.random().toString(36).substring(2, 9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueId}${ext}`)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Routes
app.use("/api/auth", authRouter)
app.use("/api/workspaces", workspaceRouter)
app.use("/api/customers", customerRouter)
app.use("/api/invoices", invoiceRouter)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    console.log("[UPLOAD] File upload request received")
    if (!req.file) {
      console.log("[UPLOAD] No file in request")
      return res.status(400).json({ error: "No file provided" })
    }
    
    const fileId = path.basename(req.file.filename, path.extname(req.file.filename))
    const result = {
      id: fileId,
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
    
    console.log("[UPLOAD] File saved successfully:", result)
    res.json(result)
  } catch (error) {
    console.error("[UPLOAD] Error:", error)
    res.status(500).json({ error: "Upload failed" })
  }
})

// Start server after DB connection
const startServer = async () => {
  try {
    console.log('[SERVER] Starting server...')
    console.log('[SERVER] Connecting to database...')
    await connectDB()
    console.log('[SERVER] Database connected successfully')
    
    console.log('[SERVER] Calling app.listen...')
    const server = app.listen(PORT, () => {
      console.log(`✓ Backend running on http://localhost:${PORT}`)
      console.log('[SERVER] Server is ready to accept connections')
    })
    
    server.on('connection', (socket) => {
      console.log('[SERVER] New connection received')
    })
    
    server.on('request', (req) => {
      console.log('[SERVER] Request event:', req.url)
    })
    
    console.log('[SERVER] Listener registered')
  } catch (error) {
    console.error("✗ Failed to start server:", error)
    process.exit(1)
  }
}

console.log('[SERVER] Calling startServer()')
startServer()
