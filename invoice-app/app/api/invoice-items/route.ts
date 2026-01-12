import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const buildHeaders = (json = false): HeadersInit => {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (STRAPI_API_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  return headers;
}

// POST create invoice item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${STRAPI_URL}/api/invoice-items`, {
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
