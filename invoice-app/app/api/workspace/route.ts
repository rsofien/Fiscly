import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ""

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get workspace for the current user by user_id
    const response = await fetch(
      `${STRAPI_URL}/api/workspaces?filters[user_id][$eq]=${userId}&populate=logo&populate=signature`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch workspace" }, { status: response.status })
    }

    const data = await response.json()
    const workspaces = data.data || []

    if (workspaces.length === 0) {
      // No workspace exists - create a default one for this user
      const createResponse = await fetch(`${STRAPI_URL}/api/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
        },
        body: JSON.stringify({
          data: {
            user_id: parseInt(userId),
            user_email: userEmail,
            name: "My Company",
            invoicePrefix: "INV",
            defaultPaymentTerms: 15,
          },
        }),
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        console.error("Failed to create workspace:", errorText)
        return NextResponse.json({ error: "Failed to create workspace" }, { status: createResponse.status })
      }

      const created = await createResponse.json()
      const newWorkspace = created.data
      
      return NextResponse.json({
        id: newWorkspace.id,
        documentId: newWorkspace.documentId,
        name: newWorkspace.name,
        email: newWorkspace.email || "",
        address: newWorkspace.address || "",
        phone: newWorkspace.phone || "",
        invoicePrefix: newWorkspace.invoicePrefix,
        defaultPaymentTerms: newWorkspace.defaultPaymentTerms,
        defaultNotes: newWorkspace.defaultNotes || "",
        matriculeFiscale: newWorkspace.matriculeFiscale || "",
        logo: newWorkspace.logo || null,
        signature: newWorkspace.signature || null,
      })
    }

    // Return the user's workspace
    const workspace = workspaces[0]
    return NextResponse.json({
      id: workspace.id,
      documentId: workspace.documentId,
      name: workspace.name,
      email: workspace.email || "",
      address: workspace.address || "",
      phone: workspace.phone || "",
      invoicePrefix: workspace.invoicePrefix,
      defaultPaymentTerms: workspace.defaultPaymentTerms,
      defaultNotes: workspace.defaultNotes || "",
      matriculeFiscale: workspace.matriculeFiscale || "",
      logo: workspace.logo || null,
      signature: workspace.signature || null,
    })
  } catch (error) {
    console.error("Workspace GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()

    // Get workspace to find documentId - filter by user_id
    const getResponse = await fetch(
      `${STRAPI_URL}/api/workspaces?filters[user_id][$eq]=${userId}&populate=logo&populate=signature`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
        },
      }
    )

    if (!getResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch workspace" }, { status: getResponse.status })
    }

    const data = await getResponse.json()
    const workspaces = data.data || []

    if (workspaces.length === 0) {
      // Create new workspace instead of failing - assign to this user
      const createResponse = await fetch(`${STRAPI_URL}/api/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
        },
        body: JSON.stringify({
          data: {
            user_id: parseInt(userId),
            user_email: userEmail,
            name: body.name || "My Company",
            email: body.email,
            address: body.address,
            phone: body.phone,
            invoicePrefix: body.invoicePrefix || "INV",
            defaultPaymentTerms: body.defaultPaymentTerms || 15,
            defaultNotes: body.defaultNotes,
            matriculeFiscale: body.matriculeFiscale,
            ...(body.logoId && { logo: body.logoId }),
            ...(body.signatureId && { signature: body.signatureId }),
          },
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.text()
        console.error("Strapi create error:", error)
        return NextResponse.json(
          { error: "Failed to create workspace" },
          { status: createResponse.status }
        )
      }

      const created = await createResponse.json()
      return NextResponse.json(created.data)
    }

    const workspace = workspaces[0]
    const documentId = workspace.documentId

    // Ensure user can only update their own workspace
    if (workspace.user_id !== parseInt(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update workspace - prevent user_id and user_email from being modified
    const updateData = { ...body }
    delete updateData.user_id
    delete updateData.user_email

    const updateResponse = await fetch(`${STRAPI_URL}/api/workspaces/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
      },
      body: JSON.stringify({
        data: {
          name: updateData.name,
          email: updateData.email,
          address: updateData.address,
          phone: updateData.phone,
          invoicePrefix: updateData.invoicePrefix,
          defaultPaymentTerms: updateData.defaultPaymentTerms,
          defaultNotes: updateData.defaultNotes,
          matriculeFiscale: updateData.matriculeFiscale,
          ...(updateData.logoId && { logo: updateData.logoId }),
          ...(updateData.signatureId && { signature: updateData.signatureId }),
        },
      }),
    })

    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      console.error("Strapi error:", error)
      return NextResponse.json(
        { error: "Failed to update workspace" },
        { status: updateResponse.status }
      )
    }

    const updated = await updateResponse.json()
    return NextResponse.json(updated.data)
  } catch (error) {
    console.error("Workspace PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
