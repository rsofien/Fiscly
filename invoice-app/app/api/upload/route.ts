import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ""

// Configure route to allow dynamic behavior and disable body parsing
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Simple test handler
export async function GET() {
  return NextResponse.json({ message: "Upload endpoint is working" })
}

export async function POST(request: NextRequest) {
  console.log('========== UPLOAD ROUTE START ==========')
  console.log('Request method:', request.method)
  console.log('Request headers:', Object.fromEntries(request.headers.entries()))
  console.log('STRAPI_URL:', STRAPI_URL)
  console.log('STRAPI_TOKEN exists:', !!STRAPI_TOKEN)
  
  try {
    console.log('Getting form data...')
    const formData = await request.formData()
    console.log('FormData entries:', Array.from(formData.entries()).map(([key]) => key))
    
    const file = formData.get("file") as File
    console.log('File extracted:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    })

    if (!file) {
      console.error('No file in formData')
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Strapi
    console.log('Creating FormData for Strapi...')
    const uploadFormData = new FormData()
    uploadFormData.append("files", file)
    console.log('Uploading to Strapi:', `${STRAPI_URL}/api/upload`)

    const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: {
        ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
      },
      body: uploadFormData,
    })

    console.log('Strapi response status:', uploadResponse.status)
    console.log('Strapi response headers:', Object.fromEntries(uploadResponse.headers.entries()))

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error('Strapi upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: error
      })
      return NextResponse.json({ error: "Failed to upload file", details: error }, { status: uploadResponse.status })
    }

    const uploadedFiles = await uploadResponse.json()
    console.log('Strapi upload response:', uploadedFiles)
    const uploadedFile = uploadedFiles[0]
    console.log('File uploaded successfully:', {
      id: uploadedFile.id,
      url: uploadedFile.url
    })
    console.log('========== UPLOAD ROUTE SUCCESS ==========')

    return NextResponse.json({
      id: uploadedFile.id,
      url: uploadedFile.url,
    })
  } catch (error) {
    console.error('========== UPLOAD ROUTE ERROR ==========', error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
