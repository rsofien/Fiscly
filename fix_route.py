content = """import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = (session.user as any).token || session.user.id;
    const response = await fetch(`${API_URL}/api/customers/${params.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('[CUSTOMER GET] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function export async function export async function export async function export a{
export async function export async function export async function exnsexport async function export asyn { export async function export async function export async function exnsexposerexport async function export async function export async function exnsexport async funL}/aexpoustoexport async function export asyUTexport async function export async function export async function exnsexport async fu boexport async function export async function export async functiespexport async function export async function export async function exnsexport async function export asyn { export async function export async h (error) {
    console.error('[CUSTOMER PUT] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function export async function export async function expms: export async function export async function export async function expms: expon) return Nexexport async function export async function export async function expms: export async functios any).token || session.user.id;
    const response = await fetch(`${API_URL}/api/customers/${params.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return NextResponse.json({ error: 'Failed to delete customer' }, { status: response.status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CUSTOMER DELETE] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
"""

with open('invoice-app/app/api/customers/[id]/route.ts', 'w') as f:
    f.write(content)
print("DONE")
