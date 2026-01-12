import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const buildHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {};
  if (STRAPI_API_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  return headers;
}

export async function GET() {
  try {
    // Fetch invoices to generate reports
    const response = await fetch(`${STRAPI_URL}/api/invoices?populate=*`, {
      headers: buildHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    const data = await response.json();
    const invoices = data.data || [];

    // Calculate metrics
    const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
    const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid');
    const paidAmount = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);

    // Group by status
    const byStatus = {
      draft: invoices.filter((inv: any) => inv.status === 'draft').length,
      sent: invoices.filter((inv: any) => inv.status === 'sent').length,
      paid: paidInvoices.length,
      overdue: invoices.filter((inv: any) => inv.status === 'overdue').length,
      cancelled: invoices.filter((inv: any) => inv.status === 'cancelled').length,
    };

    return NextResponse.json({
      totalRevenue,
      paidAmount,
      outstanding: totalRevenue - paidAmount,
      invoiceCount: invoices.length,
      byStatus,
      invoices: invoices.map((inv: any) => ({
        id: inv.id,
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
