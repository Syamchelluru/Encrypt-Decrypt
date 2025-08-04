import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Issue from '@/models/Issue'
import User from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { ApiResponse, DashboardStats, PaginatedResponse, IIssue } from '@/types'

// GET /api/admin/issues - Get all issues for admin dashboard
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin(request)
    
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    
    // Build query
    const query: any = {}
    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo
    if (search) query.$text = { $search: search }
    
    // Get total count
    const totalItems = await Issue.countDocuments(query)
    const totalPages = Math.ceil(totalItems / limit)
    
    // Get issues with pagination
    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
    
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
    
    const paginatedResponse: PaginatedResponse<IIssue> = {
      data: issues,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
    
    return NextResponse.json<ApiResponse<PaginatedResponse<IIssue>>>({
      success: true,
      message: 'Admin issues retrieved successfully',
      data: paginatedResponse
    })
    
  } catch (error: any) {
    console.error('Get admin issues error:', error)
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: error.message
      }, { status: 401 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to retrieve admin issues',
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

