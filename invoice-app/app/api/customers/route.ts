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

// GET all customers for current user's workspace
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace first
    const workspaceResponse = await fetch(`${STRAPI_URL}/api/workspaces`, {
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

    // Fetch only customers for this workspace
    const response = await fetch(`${STRAPI_URL}/api/customers?filters[workspace][id][$eq]=${workspaceId}`, {
      headers: buildHeaders(true),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: response.status });
    }

    const data = await response.json();
    // Transform Strapi response to match frontend format
    const customers = data.data?.map((item: any) => ({
      id: item.id.toString(),      documentId: item.documentId,      name: item.name,
      email: item.email,
      phone: item.phone,
      company: item.company,
      address: item.address,
      taxId: item.taxId,
      status: item.status,
      notes: item.notes,
    })) || [];

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create customer
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

    // Add workspace ID to the customer
    const customerData = {
      ...body,
      workspace: workspaceId,
    };

    const response = await fetch(`${STRAPI_URL}/api/customers`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({
        data: customerData,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
