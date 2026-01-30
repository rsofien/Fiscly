import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/user.js"

interface AuthRequest extends Request {
  user?: { id: string; email: string; userId: string }
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any
    
    // Validate user still exists in database
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      userId: user._id.toString(),
    }
    next()
  } catch (error) {
    console.error("[auth middleware] error:", error)
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

export default AuthRequest
