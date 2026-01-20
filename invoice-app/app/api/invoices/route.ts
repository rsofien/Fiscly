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

    // Get user's workspace first
    const workspaceResponse = await fetch(`${STRAPI_URL}/api/workspaces?populate=logo`, {
      headers: buildHeaders(true),
    });

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

    // Get user's workspace
    const workspaceResponse = await fetch(`${STRAPI_URL}/api/workspaces`, {
      headers: buildHeaders(true),
    });

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
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
