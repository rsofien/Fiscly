import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const buildHeaders = (json = false): HeadersInit => {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (STRAPI_API_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  return headers;
}

// GET single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user's workspace to verify ownership
    const workspaceResponse = await fetch(
      `${STRAPI_URL}/api/workspaces?filters[user_id][$eq]=${userId}`,
      {
        headers: buildHeaders(true),
      }
    );

    if (!workspaceResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 });
    }

    const workspaceData = await workspaceResponse.json();
    const workspaces = workspaceData.data || [];
    
    if (workspaces.length === 0) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 403 });
    }

    const workspaceId = workspaces[0].id;

    // Fetch invoice with workspace filter to ensure ownership
    const url = `${STRAPI_URL}/api/invoices?filters[id][\$eq]=${params.id}&filters[workspace][id][\$eq]=${workspaceId}&populate=*`

    const response = await fetch(url, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ data: data.data[0] });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user's workspace to verify ownership
    const workspaceResponse = await fetch(
      `${STRAPI_URL}/api/workspaces?filters[user_id][$eq]=${userId}`,
      {
        headers: buildHeaders(true),
      }
    );

    if (!workspaceResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 });
    }

    const workspaceData = await workspaceResponse.json();
    const workspaces = workspaceData.data || [];
    
    if (workspaces.length === 0) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 403 });
    }

    const workspaceId = workspaces[0].id;
    
    // Verify the invoice belongs to user's workspace
    const getResponse = await fetch(`${STRAPI_URL}/api/invoices?filters[id][$eq]=${params.id}&filters[workspace][id][$eq]=${workspaceId}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 403 });
    }
    
    const documentId = getData.data[0].documentId;
    const existingInvoice = getData.data[0];

    // ============ VALIDATION ============
    
    // Validate invoice number if changed
    if (body.invoiceNumber && body.invoiceNumber !== existingInvoice.invoiceNumber) {
      if (body.invoiceNumber.trim() === '') {
        return NextResponse.json({ error: 'Invoice number cannot be empty' }, { status: 400 });
      }

      // Check uniqueness
      const duplicateResponse = await fetch(
        `${STRAPI_URL}/api/invoices?filters[workspace][id][$eq]=${workspaceId}&filters[invoiceNumber][$eq]=${body.invoiceNumber}&filters[id][$ne]=${params.id}`,
        { headers: buildHeaders() }
      );
      
      if (duplicateResponse.ok) {
        const duplicateData = await duplicateResponse.json();
        if (duplicateData.data && duplicateData.data.length > 0) {
          return NextResponse.json({ error: 'Invoice number already exists' }, { status: 400 });
        }
      }
    }

    // Validate customer if changed
    if (body.customer && body.customer !== existingInvoice.customer?.id) {
      const customerResponse = await fetch(
        `${STRAPI_URL}/api/customers?filters[id][$eq]=${body.customer}&filters[workspace][id][$eq]=${workspaceId}`,
        { headers: buildHeaders() }
      );
      
      if (!customerResponse.ok || !(await customerResponse.json()).data?.length) {
        return NextResponse.json({ error: 'Customer not found or access denied' }, { status: 403 });
      }
    }

    // Validate dates if provided
    if (body.issueDate || body.dueDate) {
      const issueDate = new Date(body.issueDate || existingInvoice.issueDate);
      const dueDate = new Date(body.dueDate || existingInvoice.dueDate);

      if (isNaN(issueDate.getTime())) {
        return NextResponse.json({ error: 'Invalid issue date' }, { status: 400 });
      }

      if (isNaN(dueDate.getTime())) {
        return NextResponse.json({ error: 'Invalid due date' }, { status: 400 });
      }

      if (dueDate < issueDate) {
        return NextResponse.json({ error: 'Due date must be after issue date' }, { status: 400 });
      }
    }

    // Validate amount if provided
    if (body.amount !== undefined && body.amount < 0) {
      return NextResponse.json({ error: 'Amount cannot be negative' }, { status: 400 });
    }

    // Validate currency if provided
    if (body.currency) {
      const validCurrencies = ['USD', 'CAD', 'EUR', 'USDT'];
      if (!validCurrencies.includes(body.currency)) {
        return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
    }

    // ============ END VALIDATION ============

    // Ensure workspace ID cannot be changed
    const updateData = { ...body };
    delete updateData.workspace;

    // Update using documentId
    const response = await fetch(`${STRAPI_URL}/api/invoices/${documentId}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify({
        data: updateData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Strapi error:', errorData);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Invoice update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user's workspace to verify ownership
    const workspaceResponse = await fetch(
      `${STRAPI_URL}/api/workspaces?filters[user_id][$eq]=${userId}`,
      {
        headers: buildHeaders(true),
      }
    );

    if (!workspaceResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 });
    }

    const workspaceData = await workspaceResponse.json();
    const workspaces = workspaceData.data || [];
    
    if (workspaces.length === 0) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 403 });
    }

    const workspaceId = workspaces[0].id;
    
    // Verify the invoice belongs to user's workspace
    const getResponse = await fetch(`${STRAPI_URL}/api/invoices?filters[id][$eq]=${params.id}&filters[workspace][id][$eq]=${workspaceId}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 403 });
    }
    
    const documentId = getData.data[0].documentId;

    // Delete using documentId
    const response = await fetch(`${STRAPI_URL}/api/invoices/${documentId}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invoice deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
