import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Issue from '@/models/Issue'
import Vote from '@/models/Vote'
import { requireAuth } from '@/lib/auth'
import { ApiResponse } from '@/types'
import mongoose from 'mongoose'

// POST /api/issues/[id]/vote - Toggle vote for issue
export async function POST(
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
    
    // Check if issue exists
    const issue = await Issue.findById(id)
    if (!issue) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Issue not found'
      }, { status: 404 })
    }
    
    // Use transaction to ensure data consistency
    const session = await mongoose.startSession()
    
    try {
      await session.withTransaction(async () => {
        // Toggle vote in Vote collection
        const voteResult = await Vote.toggleVote(user.id, id)
        
        // Update issue vote count and votedBy array
        if (voteResult.action === 'added') {
          await Issue.findByIdAndUpdate(
            id,
            {
              $inc: { votes: 1 },
              $addToSet: { votedBy: user.id }
            },
            { session }
          )
        } else {
          await Issue.findByIdAndUpdate(
            id,
            {
              $inc: { votes: -1 },
              $pull: { votedBy: user.id }
            },
            { session }
          )
        }
      })
      
      // Get updated issue
      const updatedIssue = await Issue.findById(id)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
      
      return NextResponse.json<ApiResponse>({
        success: true,
        message: `Vote ${updatedIssue!.votedBy.includes(user.id) ? 'added' : 'removed'} successfully`,
        data: {
          issueId: id,
          votes: updatedIssue!.votes,
          hasVoted: updatedIssue!.votedBy.includes(user.id),
          issue: updatedIssue
        }
      })
      
    } finally {
      await session.endSession()
    }
    
  } catch (error: any) {
    console.error('Toggle vote error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to toggle vote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// GET /api/issues/[id]/vote - Check if user has voted
export async function GET(
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
    
    // Check if issue exists
    const issue = await Issue.findById(id)
    if (!issue) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Issue not found'
      }, { status: 404 })
    }
    
    // Check if user has voted
    const hasVoted = await Vote.hasUserVoted(user.id, id)
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Vote status retrieved successfully',
      data: {
        issueId: id,
        hasVoted: !!hasVoted,
        votes: issue.votes
      }
    })
    
  } catch (error: any) {
    console.error('Get vote status error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to get vote status',
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

