import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { AuthUser } from '@/types'
import User from '@/models/User'
import connectDB from './mongodb'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
  iat?: number
  exp?: number
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
    issuer: 'fix-my-area',
    audience: 'fix-my-area-users'
  })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'fix-my-area',
      audience: 'fix-my-area-users'
    }) as JWTPayload
    
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Extract token from request
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Check cookies
  const tokenCookie = request.cookies.get('auth-token')
  if (tokenCookie) {
    return tokenCookie.value
  }
  
  return null
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }
    
    await connectDB()
    const user = await User.findById(payload.userId).select('-otp -otpExpires')
    
    if (!user || !user.isVerified) {
      return null
    }
    
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified
    }
  } catch (error) {
    console.error('Get current user failed:', error)
    return null
  }
}

// Middleware to check authentication
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

// Middleware to check admin role
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  
  return user
}

// Generate secure OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash OTP for storage
export async function hashOTP(otp: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(otp, salt)
}

// Verify OTP
export async function verifyOTP(plainOTP: string, hashedOTP: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(plainOTP, hashedOTP)
}

// Create session cookie options
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  }
}

// Rate limiting for OTP requests
const otpRequestTracker = new Map<string, { count: number; lastRequest: number }>()

export function checkOTPRateLimit(email: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // Max 5 OTP requests per 15 minutes
  
  const userRequests = otpRequestTracker.get(email)
  
  if (!userRequests) {
    otpRequestTracker.set(email, { count: 1, lastRequest: now })
    return true
  }
  
  // Reset counter if window has passed
  if (now - userRequests.lastRequest > windowMs) {
    otpRequestTracker.set(email, { count: 1, lastRequest: now })
    return true
  }
  
  // Check if limit exceeded
  if (userRequests.count >= maxRequests) {
    return false
  }
  
  // Increment counter
  userRequests.count++
  userRequests.lastRequest = now
  
  return true
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  
  for (const [email, data] of otpRequestTracker.entries()) {
    if (now - data.lastRequest > windowMs) {
      otpRequestTracker.delete(email)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength (if needed for future features)
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Generate secure random string
export function generateSecureRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

