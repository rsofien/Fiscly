import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = (session.user as any).token || session.user.id;

    const response = await fetch(`${API_URL}/api/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const invoices = await response.json();
    const transformedInvoices = invoices.map((inv: any) => ({
      ...inv,
      id: inv._id || inv.id,
      customer: inv.customer_id?._id || inv.customer_id,
      customerName: inv.customer_id?.name || inv.customer_id?.email || '-',
      issueDate: inv.issueDate ? new Date(inv.issueDate).toISOString().split('T')[0] : '',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
    }));

    return NextResponse.json(transformedInvoices);
  } catch (error) {
    console.error('[INVOICES GET] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = (session.user as any).token || session.user.id;
    const body = await request.json();

    // Transform customer to customer_id for MongoDB backend
    const transformedBody = {
      ...body,
      customer_id: body.customer,
      customer: undefined,
    };

    const response = await fetch(`${API_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transformedBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const invoice = await response.json();
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('[INVOICES POST] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
