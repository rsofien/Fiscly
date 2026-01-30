import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ message: "Upload endpoint is working" })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Forward the file to the backend upload endpoint
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const token = (session.user as any).token || session.user.id

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[upload] backend error:", error)
      return NextResponse.json({ error: "Upload failed" }, { status: response.status })
    }

    const result = await response.json()
    console.log("[upload] backend response:", result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("[upload] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
