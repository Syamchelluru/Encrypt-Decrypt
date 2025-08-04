import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Issue from '@/models/Issue'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { sendIssueStatusUpdateEmail } from '@/lib/nodemailer'
import { ApiResponse, IIssue } from '@/types'
import mongoose from 'mongoose'

// GET /api/issues/[id] - Get single issue
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid issue ID'
      }, { status: 400 })
    }
    
    await connectDB()
    
    const issue = await Issue.findById(id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name email')
    
    if (!issue) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Issue not found'
      }, { status: 404 })
    }
    
    return NextResponse.json<ApiResponse<IIssue>>({
      success: true,
      message: 'Issue retrieved successfully',
      data: issue
    })
    
  } catch (error: any) {
    console.error('Get issue error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to retrieve issue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// PUT /api/issues/[id] - Update issue (admin only for status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth(request)
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid issue ID'
      }, { status: 400 })
    }
    
    const body = await request.json()
    const { title, description, category, priority, status, assignedTo } = body
    
    await connectDB()
    
    const issue = await Issue.findById(id).populate('reportedBy', 'name email')
    
    if (!issue) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Issue not found'
      }, { status: 404 })
    }
    
    // Check permissions
    const isOwner = issue.reportedBy._id.toString() === user.id
    const isAdmin = user.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Permission denied'
      }, { status: 403 })
    }
    
    // Only admins can change status and assignment
    if ((status || assignedTo) && !isAdmin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Only admins can change issue status or assignment'
      }, { status: 403 })
    }
    
    // Store old status for email notification
    const oldStatus = issue.status
    
    // Update allowed fields
    if (title && (isOwner || isAdmin)) issue.title = title.trim()
    if (description && (isOwner || isAdmin)) issue.description = description.trim()
    if (category && (isOwner || isAdmin)) issue.category = category
    if (priority && (isOwner || isAdmin)) issue.priority = priority
    if (status && isAdmin) issue.status = status
    if (assignedTo !== undefined && isAdmin) {
      issue.assignedTo = assignedTo || undefined
    }
    
    await issue.save()
    
    // Send email notification if status changed
    if (status && status !== oldStatus && issue.reportedBy.email) {
      try {
        await sendIssueStatusUpdateEmail(
          issue.reportedBy.email,
          issue.reportedBy.name,
          issue.title,
          oldStatus,
          status,
          issue._id.toString()
        )
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the request if email fails
      }
    }
    
    // Populate fields for response
    await issue.populate('assignedTo', 'name email')
    
    return NextResponse.json<ApiResponse<IIssue>>({
      success: true,
      message: 'Issue updated successfully',
      data: issue
    })
    
  } catch (error: any) {
    console.error('Update issue error:', error)
    
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
      message: 'Failed to update issue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// DELETE /api/issues/[id] - Delete issue (owner or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth(request)
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid issue ID'
      }, { status: 400 })
    }
    
    await connectDB()
    
    const issue = await Issue.findById(id)
    
    if (!issue) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Issue not found'
      }, { status: 404 })
    }
    
    // Check permissions
    const isOwner = issue.reportedBy.toString() === user.id
    const isAdmin = user.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Permission denied'
      }, { status: 403 })
    }
    
    await Issue.findByIdAndDelete(id)
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Issue deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Delete issue error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to delete issue',
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

