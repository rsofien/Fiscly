import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { email, password, name, companyName } = body

    // Register user with Strapi
    const registerResponse = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        email,
        password,
      }),
    })

    const registerData = await registerResponse.json()

    if (!registerResponse.ok) {
      return NextResponse.json(
        { error: registerData.error?.message || 'Registration failed' },
        { status: registerResponse.status }
      )
    }

    // User created successfully
    // The name and companyName can be stored in user profile later
    return NextResponse.json({
      jwt: registerData.jwt,
      user: registerData.user,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
