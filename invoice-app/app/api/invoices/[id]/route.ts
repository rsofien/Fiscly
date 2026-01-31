import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = (session.user as any).token || session.user.id;
    const response = await fetch(`${API_URL}/api/invoices/${params.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    const data = await response.json();
    console.log('[INVOICE GET by ID] Backend data:', data);
    console.log('[INVOICE GET by ID] Items:', data.items);
    
    // Transform customer_id to customer object for frontend
    const transformed = {
      ...data,
      id: data._id || data.id,
      customer: data.customer_id ? {
        id: data.customer_id._id || data.customer_id.id,
        name: data.customer_id.name,
        email: data.customer_id.email,
        phone: data.customer_id.phone,
        address: data.customer_id.address,
        company: data.customer_id.company,
        vat: data.customer_id.vat,
        siren: data.customer_id.siren,
      } : null,
      items: data.items || [],
      issueDate: data.issueDate ? new Date(data.issueDate).toISOString().split('T')[0] : '',
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
    };
    console.log('[INVOICE GET by ID] Transformed items:', transformed.items);
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('[INVOICE GET] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = (session.user as any).token || session.user.id;
    const body = await request.json();
    
    // Transform customer to customer_id for MongoDB backend
    const transformedBody = {
      ...body,
      customer_id: body.customer,
      customer: undefined,
    };
    
    const response = await fetch(`${API_URL}/api/invoices/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(transformedBody) });
    if (!response.ok) return NextResponse.json({ error: 'Failed to update invoice' }, { status: response.status });
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('[INVOICE PUT] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = (session.user as any).token || session.user.id;
    const response = await fetch(`${API_URL}/api/invoices/${params.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return NextResponse.json({ error: 'Failed to delete invoice' }, { status: response.status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[INVOICE DELETE] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
