import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Issue from '@/models/Issue'
import { requireAuth } from '@/lib/auth'
import { ApiResponse, IssueFilters, PaginatedResponse, IIssue } from '@/types'

// GET /api/issues - Get all issues with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters: IssueFilters = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      priority: searchParams.get('priority') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined
    }
    
    // Parse location filter if provided
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    
    if (lat && lng && radius) {
      filters.location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
        radius: parseFloat(radius)
      }
    }
    
    // Validate pagination
    if (filters.page! < 1) filters.page = 1
    if (filters.limit! < 1 || filters.limit! > 50) filters.limit = 10
    
    // Get total count for pagination
    const countQuery: any = {}
    if (filters.status) countQuery.status = filters.status
    if (filters.category) countQuery.category = filters.category
    if (filters.priority) countQuery.priority = filters.priority
    if (filters.search) countQuery.$text = { $search: filters.search }
    
    const totalItems = await Issue.countDocuments(countQuery)
    const totalPages = Math.ceil(totalItems / filters.limit!)
    
    // Get issues with filters
    const issues = await Issue.findWithFilters(filters)
    
    const paginatedResponse: PaginatedResponse<IIssue> = {
      data: issues,
      meta: {
        currentPage: filters.page!,
        totalPages,
        totalItems,
        itemsPerPage: filters.limit!,
        hasNextPage: filters.page! < totalPages,
        hasPrevPage: filters.page! > 1
      }
    }
    
    return NextResponse.json<ApiResponse<PaginatedResponse<IIssue>>>({
      success: true,
      message: 'Issues retrieved successfully',
      data: paginatedResponse
    })
    
  } catch (error: any) {
    console.error('Get issues error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to retrieve issues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// POST /api/issues - Create new issue
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request)
    
    const body = await request.json()
    const {
      title,
      description,
      category,
      priority = 'medium',
      location,
      address,
      images = []
    } = body
    
    // Validate required fields
    if (!title || !description || !category || !location || !address) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Title, description, category, location, and address are required'
      }, { status: 400 })
    }
    
    // Validate location format
    if (!location.coordinates || 
        !Array.isArray(location.coordinates) || 
        location.coordinates.length !== 2 ||
        typeof location.coordinates[0] !== 'number' ||
        typeof location.coordinates[1] !== 'number') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid location format. Expected coordinates array [longitude, latitude]'
      }, { status: 400 })
    }
    
    // Validate coordinates range
    const [lng, lat] = location.coordinates
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      }, { status: 400 })
    }
    
    await connectDB()
    
    // Create new issue
    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      address: address.trim(),
      images: Array.isArray(images) ? images : [],
      reportedBy: user.id,
      status: 'pending',
      votes: 0,
      votedBy: [],
      comments: []
    })
    
    await issue.save()
    
    // Populate the reportedBy field for response
    await issue.populate('reportedBy', 'name email')
    
    return NextResponse.json<ApiResponse<IIssue>>({
      success: true,
      message: 'Issue created successfully',
      data: issue
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create issue error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Validation error',
        error: validationErrors.join(', ')
      }, { status: 400 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to create issue',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

