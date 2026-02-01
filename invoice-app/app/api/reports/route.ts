import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = (session.user as any).token;
    if (!token) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Fetch invoices from MongoDB backend
    const response = await fetch(`${API_URL}/api/invoices`, {
      headers,
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    const invoices = await response.json();
    const invoiceArray = Array.isArray(invoices) ? invoices : [];

    // Calculate metrics
    const totalRevenue = invoiceArray.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
    const paidInvoices = invoiceArray.filter((inv: any) => inv.status === 'paid');
    const paidAmount = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);

    // Group by status
    const byStatus = {
      draft: invoiceArray.filter((inv: any) => inv.status === 'draft').length,
      sent: invoiceArray.filter((inv: any) => inv.status === 'sent').length,
      paid: paidInvoices.length,
      overdue: invoiceArray.filter((inv: any) => inv.status === 'overdue').length,
      cancelled: invoiceArray.filter((inv: any) => inv.status === 'cancelled').length,
    };

    return NextResponse.json({
      totalRevenue,
      paidAmount,
      outstanding: totalRevenue - paidAmount,
      invoiceCount: invoiceArray.length,
      byStatus,
      invoices: invoiceArray.map((inv: any) => ({
        id: inv._id,
        number: inv.invoiceNumber,
        amount: inv.amount,
        status: inv.status,
        issueDate: inv.issueDate,
      })),
    });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
