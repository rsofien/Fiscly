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

// GET single customer
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

    // Fetch customer with workspace filter
    const response = await fetch(`${STRAPI_URL}/api/customers?filters[id][$eq]=${params.id}&filters[workspace][id][$eq]=${workspaceId}`, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found or access denied' }, { status: 403 });
    }

    const customerData = data.data[0];
    const customer = {
      id: customerData.id.toString(),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      company: customerData.company,
      status: customerData.status,
    };

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update customer
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
    
    // Verify the customer belongs to user's workspace
    const getResponse = await fetch(`${STRAPI_URL}/api/customers?filters[id][$eq]=${params.id}&filters[workspace][id][$eq]=${workspaceId}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found or access denied' }, { status: 403 });
    }
    
    const documentId = getData.data[0].documentId;
    const existingCustomer = getData.data[0];

    // ============ VALIDATION ============
    
    // Validate name if provided
    if (body.name !== undefined && body.name.trim() === '') {
      return NextResponse.json({ error: 'Customer name cannot be empty' }, { status: 400 });
    }

    // Validate email if provided and changed
    if (body.email && body.email !== existingCustomer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      // Check email uniqueness within workspace
      const duplicateResponse = await fetch(
        `${STRAPI_URL}/api/customers?filters[workspace][id][$eq]=${workspaceId}&filters[email][$eq]=${body.email}&filters[id][$ne]=${params.id}`,
        { headers: buildHeaders() }
      );
      
      if (duplicateResponse.ok) {
        const duplicateData = await duplicateResponse.json();
        if (duplicateData.data && duplicateData.data.length > 0) {
          return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 400 });
        }
      }
    }

    // Validate phone format if provided
    if (body.phone && body.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(body.phone)) {
        return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status. Must be active or inactive' }, { status: 400 });
      }
    }

    // ============ END VALIDATION ============

    // Ensure workspace ID cannot be changed
    const updateData = { ...body };
    delete updateData.workspace;

    // Update using documentId
    const response = await fetch(`${STRAPI_URL}/api/customers/${documentId}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify({
        data: updateData,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update customer' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE customer
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
    
    // Verify the customer belongs to user's workspace
    const getResponse = await fetch(`${STRAPI_URL}/api/customers?filters[id][$eq]=${params.id}&filters[workspace][id][$eq]=${workspaceId}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found or access denied' }, { status: 403 });
    }
    
    const documentId = getData.data[0].documentId;

    // Delete using documentId
    const response = await fetch(`${STRAPI_URL}/api/customers/${documentId}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
