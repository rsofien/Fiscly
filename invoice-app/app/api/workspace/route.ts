import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

export async function GET(request: NextRequest) {
  try {
    console.log('[WORKSPACE GET] Fetching workspace...')
    const session = await auth()
    if (!session?.user) {
      console.log('[WORKSPACE GET] ❌ No session')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log('[WORKSPACE GET] ✓ Session valid for:', session.user.email)

    const token = (session.user as any).token || session.user.id
    console.log('[WORKSPACE GET] Using token:', token ? 'present' : 'missing')
    
    console.log('[WORKSPACE GET] Calling backend:', `${API_URL}/api/workspaces`)
    const response = await fetch(`${API_URL}/api/workspaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    console.log('[WORKSPACE GET] Backend response status:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.log('[WORKSPACE GET] ❌ Error response:', errorText)
      return NextResponse.json({ error: "Failed to fetch workspace" }, { status: response.status })
    }

    const workspace = await response.json()
    // Transform _id to id for frontend
    const transformedWorkspace = {
      ...workspace,
      id: workspace._id || workspace.id,
    }
    console.log('[WORKSPACE GET] ✅ Workspace fetched:', transformedWorkspace._id || 'no-id')
    return NextResponse.json(transformedWorkspace)
  } catch (error) {
    console.error("[WORKSPACE GET] ❌ ERROR:", error)
    console.error("[WORKSPACE GET] Error stack:", error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[WORKSPACE PUT] Updating workspace...')
    const session = await auth()
    if (!session?.user) {
      console.log('[WORKSPACE PUT] ❌ No session')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log('[WORKSPACE PUT] ✓ Session valid for:', session.user.email)

    const token = (session.user as any).token || session.user.id
    const body = await request.json()
    console.log('[WORKSPACE PUT] Update data:', JSON.stringify(body, null, 2))

    console.log('[WORKSPACE PUT] Calling backend:', `${API_URL}/api/workspaces`)
    const response = await fetch(`${API_URL}/api/workspaces`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    console.log('[WORKSPACE PUT] Backend response status:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[WORKSPACE PUT] ❌ Error response:", errorText)
      return NextResponse.json({ error: "Failed to update workspace" }, { status: response.status })
    }

    const workspace = await response.json()
    console.log('[WORKSPACE PUT] ✅ Workspace updated successfully')
    return NextResponse.json(workspace)
  } catch (error) {
    console.error("[WORKSPACE PUT] ❌ ERROR:", error)
    console.error("[WORKSPACE PUT] Error stack:", error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
