import { NextRequest, NextResponse } from 'next/server';

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
    // Use populate=* which works in Strapi v5
    const url = `${STRAPI_URL}/api/invoices?filters[id][\$eq]=${params.id}&populate=*`

    const response = await fetch(url, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Return the first (and only) result
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
    const body = await request.json();
    
    // First, get the invoice to find its documentId
    const getResponse = await fetch(`${STRAPI_URL}/api/invoices?filters[id][$eq]=${params.id}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const documentId = getData.data[0].documentId;

    // Now update using documentId
    const response = await fetch(`${STRAPI_URL}/api/invoices/${documentId}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify({
        data: body,
      }),
    });

    if (!response.ok) {
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
    // First, get the invoice to find its documentId
    const getResponse = await fetch(`${STRAPI_URL}/api/invoices?filters[id][$eq]=${params.id}`, {
      headers: buildHeaders(),
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const getData = await getResponse.json();
    if (!getData.data || getData.data.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const documentId = getData.data[0].documentId;

    // Now delete using documentId
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
