import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse, AuthUser } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 })
    }
    
    return NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      message: 'User retrieved successfully',
      data: user
    })
    
  } catch (error: any) {
    console.error('Get current user error:', error)
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

