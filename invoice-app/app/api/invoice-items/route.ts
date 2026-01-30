import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const API_TOKEN = process.env.API_TOKEN;

const buildHeaders = (json = false): HeadersInit => {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`;
  return headers;
}

// POST create invoice item
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.invoice) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    if (!body.description || body.description.trim() === '') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    if (body.quantity === undefined || body.quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 });
    }

    if (body.unitPrice === undefined || body.unitPrice < 0) {
      return NextResponse.json({ error: 'Unit price cannot be negative' }, { status: 400 });
    }

    // Get user's workspace to verify the invoice belongs to them
    const workspaceResponse = await fetch(`${API_URL}/api/workspaces`, {
      headers: buildHeaders(true),
    });

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
    const invoiceResponse = await fetch(`${API_URL}/api/invoices?filters[id][$eq]=${body.invoice}&filters[workspace][id][$eq]=${workspaceId}`, {
      headers: buildHeaders(),
    });

    if (!invoiceResponse.ok) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoiceData = await invoiceResponse.json();
    if (!invoiceData.data || invoiceData.data.length === 0) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 403 });
    }

    // Create invoice item
    const response = await fetch(`${API_URL}/api/invoice-items`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({
        data: body,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create invoice item' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Invoice item creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
