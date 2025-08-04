import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken, getSessionCookieOptions } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/nodemailer'
import { ApiResponse, AuthUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, otp, isSignup } = await request.json()
    
    // Validate input
    if (!email || !otp) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Email and OTP are required'
      }, { status: 400 })
    }
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'OTP must be a 6-digit number'
      }, { status: 400 })
    }
    
    await connectDB()
    
    // Find user with OTP fields
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+otp +otpExpires')
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid email or OTP'
      }, { status: 400 })
    }
    
    // Check if OTP exists and hasn't expired
    if (!user.otp || !user.otpExpires) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'No OTP found. Please request a new one.'
      }, { status: 400 })
    }
    
    if (user.otpExpires < new Date()) {
      // Clear expired OTP
      user.clearOTP()
      await user.save()
      
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      }, { status: 400 })
    }
    
    // Verify OTP
    const isOTPValid = await user.compareOTP(otp)
    
    if (!isOTPValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid OTP'
      }, { status: 400 })
    }
    
    // OTP is valid - complete the process
    user.isVerified = true
    user.clearOTP()
    await user.save()
    
    // Send welcome email for new signups
    if (isSignup) {
      try {
        await sendWelcomeEmail(user.email, user.name)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the request if welcome email fails
      }
    }
    
    // Generate JWT token
    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified
    }
    
    const token = generateToken(authUser)
    
    // Create response with user data
    const response = NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      message: isSignup ? 'Account created successfully!' : 'Login successful!',
      data: authUser
    })
    
    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, getSessionCookieOptions())
    
    return response
    
  } catch (error: any) {
    console.error('Verify OTP error:', error)
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

