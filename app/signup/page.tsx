'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, User, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { validateEmail, validateOTP } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const router = useRouter()

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Please enter a valid name (at least 2 characters)')
      return
    }
    
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          isSignup: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('OTP sent to your email!')
        setStep('otp')
        setCountdown(60) // 60 seconds countdown
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateOTP(otp)) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
          isSignup: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account created successfully!')
        router.push('/dashboard/user')
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          isSignup: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('New OTP sent to your email!')
        setCountdown(60)
      } else {
        toast.error(data.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <ArrowLeft className="h-5 w-5 text-secondary-600" />
            <span className="text-secondary-600">Back to home</span>
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="text-4xl">🏘️</div>
          </div>
          
          <h2 className="text-3xl font-bold text-secondary-900">
            Join Fix My Area
          </h2>
          <p className="mt-2 text-secondary-600">
            Create your account to start reporting issues
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 rounded-xl">
          {step === 'details' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                leftIcon={<User className="h-4 w-4" />}
                required
                disabled={loading}
                minLength={2}
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                leftIcon={<Mail className="h-4 w-4" />}
                required
                disabled={loading}
              />

              <div className="text-xs text-secondary-600 bg-secondary-50 p-3 rounded-lg">
                <p className="font-medium mb-1">By creating an account, you agree to:</p>
                <ul className="space-y-1">
                  <li>• Use the platform responsibly</li>
                  <li>• Report genuine civic issues only</li>
                  <li>• Respect community guidelines</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-secondary-700">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Change details
                  </button>
                </div>
                
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  disabled={loading}
                  className="text-center text-lg tracking-widest"
                />
                
                <p className="mt-2 text-sm text-secondary-600">
                  We sent a verification code to <strong>{formData.email}</strong>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading || otp.length !== 6}
              >
                Create Account
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:text-secondary-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-secondary-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

