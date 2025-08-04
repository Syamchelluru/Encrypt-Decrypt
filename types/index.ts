import { Document } from 'mongoose'

// User Types
export interface IUser extends Document {
  _id: string
  email: string
  name: string
  role: 'user' | 'admin'
  isVerified: boolean
  otp?: string
  otpExpires?: Date
  createdAt: Date
  updatedAt: Date
}

// Issue Types
export interface IIssue extends Document {
  _id: string
  title: string
  description: string
  category: 'infrastructure' | 'sanitation' | 'safety' | 'environment' | 'transportation' | 'other'
  status: 'pending' | 'in-progress' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  address: string
  images: string[]
  reportedBy: string // User ID
  assignedTo?: string // Admin ID
  votes: number
  votedBy: string[] // Array of User IDs
  comments: IComment[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

// Comment Types
export interface IComment {
  _id: string
  text: string
  author: string // User ID
  authorName: string
  createdAt: Date
}

// Vote Types
export interface IVote extends Document {
  _id: string
  userId: string
  issueId: string
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Auth Types
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  isVerified: boolean
}

export interface LoginCredentials {
  email: string
  otp: string
}

export interface SignupCredentials {
  email: string
  name: string
  otp: string
}

// Issue Form Types
export interface CreateIssueData {
  title: string
  description: string
  category: string
  priority: string
  location: {
    coordinates: [number, number]
  }
  address: string
  images: File[]
}

export interface UpdateIssueData {
  title?: string
  description?: string
  category?: string
  priority?: string
  status?: string
  assignedTo?: string
}

// Map Types
export interface MapLocation {
  longitude: number
  latitude: number
  address?: string
}

export interface IssueMarker {
  id: string
  title: string
  status: string
  location: {
    coordinates: [number, number]
  }
  category: string
  votes: number
}

// Dashboard Types
export interface DashboardStats {
  totalIssues: number
  pendingIssues: number
  inProgressIssues: number
  resolvedIssues: number
  userIssues?: number
  totalVotes?: number
}

// Filter Types
export interface IssueFilters {
  status?: string
  category?: string
  priority?: string
  sortBy?: 'createdAt' | 'votes' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  search?: string
  location?: {
    coordinates: [number, number]
    radius: number // in kilometers
  }
}

// Pagination Types
export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Notification Types
export interface Notification {
  id: string
  type: 'issue_created' | 'issue_updated' | 'issue_resolved' | 'vote_received'
  title: string
  message: string
  read: boolean
  createdAt: Date
  relatedIssueId?: string
}

// Error Types
export interface AppError {
  message: string
  statusCode: number
  code?: string
}

// Form Validation Types
export interface ValidationError {
  field: string
  message: string
}

// File Upload Types
export interface UploadedFile {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
  size?: number
}

