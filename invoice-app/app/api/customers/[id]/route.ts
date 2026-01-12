import { NextRequest, NextResponse } from 'next/server';

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
    const response = await fetch(`${STRAPI_URL}/api/customers/${params.id}`, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const data = await response.json();
    const customer = {
      id: data.data.id.toString(),
      name: data.data.name,
      email: data.data.email,
      phone: data.data.phone,
      company: data.data.company,
      status: data.data.status,
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
    const body = await request.json();
    
    // First, get the customer to find its documentId
    const getResponse = await fetch(`${STRAPI_URL}/api/customers?filters[id][$eq]=${params.id}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const documentId = getData.data[0].documentId;

    // Now update using documentId
    const response = await fetch(`${STRAPI_URL}/api/customers/${documentId}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify({
        data: body,
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
    // First, get the customer to find its documentId
    const getResponse = await fetch(`${STRAPI_URL}/api/customers?filters[id][$eq]=${params.id}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const documentId = getData.data[0].documentId;

    // Now delete using documentId
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
