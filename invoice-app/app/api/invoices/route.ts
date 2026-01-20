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

// GET all invoices for current user's workspace
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user's workspace by user_id
    const workspaceResponse = await fetch(
      `${STRAPI_URL}/api/workspaces?filters[user_id][$eq]=${userId}&populate=logo`,
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
      return NextResponse.json([]);
    }

    const workspaceId = workspaces[0].id;

    // Fetch only invoices for this workspace
    const response = await fetch(`${STRAPI_URL}/api/invoices?filters[workspace][id][$eq]=${workspaceId}&populate=*`, {
      headers: buildHeaders(true),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: response.status });
    }

    const data = await response.json();
    const invoices = data.data?.map((item: any) => ({
      id: item.id.toString(),
      documentId: item.documentId,
      invoiceNumber: item.invoiceNumber,
      customer: item.customer?.id?.toString() || '',
      customerName: item.customer?.name || '',
      amount: item.amount,
      currency: item.currency,
      language: item.language || 'en',
      status: item.status,
      issueDate: item.issueDate,
      dueDate: item.dueDate,
      description: item.description || '',
      notes: item.notes || '',
      paymentMethod: item.paymentMethod || 'bank_transfer',
      items: item.items?.map((lineItem: any) => ({
        description: lineItem.description || '',
        quantity: lineItem.quantity || 1,
        unitPrice: lineItem.unitPrice || 0,
        total: lineItem.total || 0,
      })) || [],
    })) || [];

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create invoice
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user's workspace by user_id
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
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    const workspaceId = workspaces[0].id;
    const body = await request.json();

    // ============ VALIDATION ============
    
    // Validate invoice number
    if (!body.invoiceNumber || body.invoiceNumber.trim() === '') {
      return NextResponse.json({ error: 'Invoice number is required' }, { status: 400 });
    }

    // Check invoice number uniqueness within workspace
    const existingInvoiceResponse = await fetch(
      `${STRAPI_URL}/api/invoices?filters[workspace][id][$eq]=${workspaceId}&filters[invoiceNumber][$eq]=${body.invoiceNumber}`,
      { headers: buildHeaders() }
    );
    
    if (existingInvoiceResponse.ok) {
      const existingData = await existingInvoiceResponse.json();
      if (existingData.data && existingData.data.length > 0) {
        return NextResponse.json({ error: 'Invoice number already exists' }, { status: 400 });
      }
    }

    // Validate customer
    if (!body.customer) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }

    // Verify customer belongs to workspace
    const customerResponse = await fetch(
      `${STRAPI_URL}/api/customers?filters[id][$eq]=${body.customer}&filters[workspace][id][$eq]=${workspaceId}`,
      { headers: buildHeaders() }
    );
    
    if (!customerResponse.ok || !(await customerResponse.json()).data?.length) {
      return NextResponse.json({ error: 'Customer not found or access denied' }, { status: 403 });
    }

    // Validate dates
    if (!body.issueDate) {
      return NextResponse.json({ error: 'Issue date is required' }, { status: 400 });
    }

    if (!body.dueDate) {
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 });
    }

    const issueDate = new Date(body.issueDate);
    const dueDate = new Date(body.dueDate);

    if (isNaN(issueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid issue date' }, { status: 400 });
    }

    if (isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid due date' }, { status: 400 });
    }

    if (dueDate < issueDate) {
      return NextResponse.json({ error: 'Due date must be after issue date' }, { status: 400 });
    }

    // Validate amount
    if (body.amount === undefined || body.amount === null) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    if (body.amount < 0) {
      return NextResponse.json({ error: 'Amount cannot be negative' }, { status: 400 });
    }

    // Validate currency
    const validCurrencies = ['USD', 'CAD', 'EUR', 'USDT'];
    if (body.currency && !validCurrencies.includes(body.currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // ============ END VALIDATION ============

    // Add workspace ID to the invoice
    const invoiceData = {
      ...body,
      workspace: workspaceId,
    };

    const response = await fetch(`${STRAPI_URL}/api/invoices`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({
        data: invoiceData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Strapi error:', errorData);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
