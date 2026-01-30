import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

export async function POST(request: NextRequest) {
  try {
    console.log('[FRONTEND REGISTER] Received registration request')
    const body = await request.json()
    console.log('[FRONTEND REGISTER] Body:', JSON.stringify(body, null, 2))
    
    const { email, password, name, companyName } = body

    if (!email || !password || !name) {
      console.log('[FRONTEND REGISTER] ❌ Missing required fields')
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }
    console.log('[FRONTEND REGISTER] ✓ All fields present')

    // Register user with MongoDB backend
    console.log('[FRONTEND REGISTER] Calling backend API:', `${API_URL}/api/auth/register`)
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        companyName: companyName || name,
      }),
    })

    console.log('[FRONTEND REGISTER] Backend response status:', registerResponse.status)
    const registerData = await registerResponse.json()
    console.log('[FRONTEND REGISTER] Backend response:', JSON.stringify(registerData, null, 2))

    if (!registerResponse.ok) {
      console.log('[FRONTEND REGISTER] ❌ Backend returned error')
      return NextResponse.json(
        { error: registerData.error || 'Registration failed' },
        { status: registerResponse.status }
      )
    }

    // User created successfully
    console.log('[FRONTEND REGISTER] ✅ Registration successful!')
    return NextResponse.json({
      user: registerData.user,
      token: registerData.token,
    }, { status: 201 })
  } catch (error) {
    console.error('[FRONTEND REGISTER] ❌ ERROR:', error)
    console.error('[FRONTEND REGISTER] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
