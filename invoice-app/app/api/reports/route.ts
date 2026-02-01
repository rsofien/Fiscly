import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = (session.user as any).token;
    if (!token) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2026';
    const backendUrl = `${API_URL}/api/invoices?${searchParams.toString()}`;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(backendUrl, {
      headers,
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    const invoices = await response.json();
    const invoiceArray = Array.isArray(invoices) ? invoices : [];

    // Calculate metrics using usdAmount for consistency
    const totalRevenue = invoiceArray.reduce((sum: number, inv: any) => 
      sum + (inv.usdAmount || inv.amount || 0), 0);
    const paidInvoices = invoiceArray.filter((inv: any) => inv.status === 'paid');
    const paidAmount = paidInvoices.reduce((sum: number, inv: any) => 
      sum + (inv.usdAmount || inv.amount || 0), 0);

    // Group by status
    const byStatus = {
      draft: invoiceArray.filter((inv: any) => inv.status === 'draft').length,
      sent: invoiceArray.filter((inv: any) => inv.status === 'sent').length,
      paid: paidInvoices.length,
      overdue: invoiceArray.filter((inv: any) => inv.status === 'overdue').length,
      cancelled: invoiceArray.filter((inv: any) => inv.status === 'cancelled').length,
    };

    // Calculate currency breakdown
    const currencyBreakdown = invoiceArray.reduce<Record<string, { count: number; originalTotal: number; usdTotal: number }>>(
      (acc, inv: any) => {
        const currency = inv.currency || 'USD';
        const originalAmount = inv.amount || 0;
        const usdAmount = inv.usdAmount || inv.amount || 0;
        
        if (!acc[currency]) {
          acc[currency] = { count: 0, originalTotal: 0, usdTotal: 0 };
        }
        acc[currency].count += 1;
        acc[currency].originalTotal += originalAmount;
        acc[currency].usdTotal += usdAmount;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      totalRevenue,
      paidAmount,
      outstanding: totalRevenue - paidAmount,
      invoiceCount: invoiceArray.length,
      byStatus,
      currencyBreakdown,
      year,
      invoices: invoiceArray.map((inv: any) => ({
        id: inv._id,
        number: inv.invoiceNumber,
        amount: inv.amount,
        currency: inv.currency || 'USD',
        usdAmount: inv.usdAmount || inv.amount,
        status: inv.status,
        issueDate: inv.issueDate,
      })),
    });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
