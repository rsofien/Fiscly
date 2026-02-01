import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

export async function GET() {
  try {
    console.log('[CUSTOMERS GET] Fetching customers...')
    const session = await auth()
    
    if (!session) {
      console.log('[CUSTOMERS GET] ❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[CUSTOMERS GET] ✓ Session valid for:', session.user.email)

    const token = session.user.token

    console.log('[CUSTOMERS GET] Calling backend:', `${API_URL}/api/customers`)
    const response = await fetch(`${API_URL}/api/customers`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    console.log('[CUSTOMERS GET] Backend response status:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.log('[CUSTOMERS GET] ❌ Error response:', errorText)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: response.status })
    }

    const customers = await response.json()
    
    // Transform MongoDB _id to id for frontend
    const transformedCustomers = customers.map((c: any) => ({
      ...c,
      id: c._id || c.id,
    }))
    
    console.log('[CUSTOMERS GET] ✅ Fetched', transformedCustomers.length || 0, 'customers')
    return NextResponse.json(transformedCustomers)
  } catch (error) {
    console.error('[CUSTOMERS GET] ❌ ERROR:', error)
    console.error('[CUSTOMERS GET] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[CUSTOMERS POST] Creating customer...')
    const session = await auth()
    
    if (!session) {
      console.log('[CUSTOMERS POST] ❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[CUSTOMERS POST] ✓ Session valid for:', session.user.email)

    const token = session.user.token
    const body = await request.json()
    console.log('[CUSTOMERS POST] Customer data:', JSON.stringify(body, null, 2))

    console.log('[CUSTOMERS POST] Calling backend:', `${API_URL}/api/customers`)
    const response = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    console.log('[CUSTOMERS POST] Backend response status:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.log('[CUSTOMERS POST] ❌ Error response:', errorText)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: response.status })
    }

    const customer = await response.json()
    console.log('[CUSTOMERS POST] ✅ Customer created:', customer._id || 'no-id')
    return NextResponse.json(customer)
  } catch (error) {
    console.error('[CUSTOMERS POST] ❌ ERROR:', error)
    console.error('[CUSTOMERS POST] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}