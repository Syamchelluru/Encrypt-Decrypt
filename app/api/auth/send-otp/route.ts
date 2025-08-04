import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendOTPEmail } from '@/lib/nodemailer'
import { checkOTPRateLimit, isValidEmail } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, name, isSignup } = await request.json()
    
    // Validate input
    if (!email || !isValidEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Valid email is required'
      }, { status: 400 })
    }
    
    if (isSignup && (!name || name.trim().length < 2)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Name is required for signup and must be at least 2 characters'
      }, { status: 400 })
    }
    
    // Check rate limiting
    if (!checkOTPRateLimit(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Too many OTP requests. Please try again in 15 minutes.'
      }, { status: 429 })
    }
    
    await connectDB()
    
    let user = await User.findByEmail(email)
    
    if (isSignup) {
      // Signup flow
      if (user) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'User with this email already exists'
        }, { status: 409 })
      }
      
      // Create new user
      user = new User({
        email: email.toLowerCase(),
        name: name.trim(),
        role: 'user',
        isVerified: false
      })
    } else {
      // Login flow
      if (!user) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'No account found with this email address'
        }, { status: 404 })
      }
      
      if (!user.isVerified) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Account not verified. Please complete signup first.'
        }, { status: 403 })
      }
    }
    
    // Generate and set OTP
    const otp = user.generateOTP()
    await user.save()
    
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name)
    
    if (!emailSent) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      }, { status: 500 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: `OTP sent successfully to ${email}`,
      data: {
        email,
        expiresIn: 10 * 60 * 1000 // 10 minutes in milliseconds
      }
    })
    
  } catch (error: any) {
    console.error('Send OTP error:', error)
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

