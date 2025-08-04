import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logged out successfully'
    })
    
    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })
    
    return response
    
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

