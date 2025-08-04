import mongoose, { Schema, model, models } from 'mongoose'
import { IUser } from '@/types'
import bcrypt from 'bcryptjs'

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false // Don't include in queries by default
  },
  otpExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      delete ret.otp
      delete ret.otpExpires
      return ret
    }
  }
})

// Index for email lookups
UserSchema.index({ email: 1 })

// Index for OTP cleanup (TTL index)
UserSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 })

// Pre-save middleware to hash OTP
UserSchema.pre('save', async function(next) {
  if (!this.isModified('otp') || !this.otp) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.otp = await bcrypt.hash(this.otp, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare OTP
UserSchema.methods.compareOTP = async function(candidateOTP: string): Promise<boolean> {
  if (!this.otp) return false
  return bcrypt.compare(candidateOTP, this.otp)
}

// Method to generate and set OTP
UserSchema.methods.generateOTP = function(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  this.otp = otp
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  return otp
}

// Method to clear OTP
UserSchema.methods.clearOTP = function() {
  this.otp = undefined
  this.otpExpires = undefined
}

// Static method to find user by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to create admin user
UserSchema.statics.createAdmin = async function(email: string, name: string) {
  const existingUser = await this.findByEmail(email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }
  
  return this.create({
    email,
    name,
    role: 'admin',
    isVerified: true
  })
}

const User = models.User || model<IUser>('User', UserSchema)

export default User

