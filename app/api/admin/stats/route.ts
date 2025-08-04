import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Issue from '@/models/Issue'
import User from '@/models/User'
import Vote from '@/models/Vote'
import { requireAdmin } from '@/lib/auth'
import { ApiResponse, DashboardStats } from '@/types'

// GET /api/admin/stats - Get dashboard statistics for admin
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin(request)
    
    await connectDB()
    
    // Get issue statistics
    const issueStats = await Issue.getDashboardStats()
    
    // Get user statistics
    const totalUsers = await User.countDocuments({ isVerified: true })
    const totalAdmins = await User.countDocuments({ role: 'admin', isVerified: true })
    const newUsersThisMonth = await User.countDocuments({
      isVerified: true,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    })
    
    // Get voting statistics
    const votingStats = await Vote.getVotingStats()
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentIssues = await Issue.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })
    
    const recentVotes = await Vote.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })
    
    // Get issues by category
    const issuesByCategory = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])
    
    // Get issues by priority
    const issuesByPriority = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])
    
    // Get resolution rate (resolved issues / total issues)
    const resolutionRate = issueStats.totalIssues > 0 
      ? Math.round((issueStats.resolvedIssues / issueStats.totalIssues) * 100)
      : 0
    
    // Get average resolution time for resolved issues
    const avgResolutionTime = await Issue.aggregate([
      {
        $match: {
          status: 'resolved',
          resolvedAt: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $subtract: ['$resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ])
    
    const avgResolutionDays = avgResolutionTime.length > 0 
      ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60 * 24))
      : 0
    
    const stats = {
      // Issue statistics
      ...issueStats,
      
      // User statistics
      totalUsers,
      totalAdmins,
      newUsersThisMonth,
      
      // Voting statistics
      totalVotes: votingStats.totalVotes,
      uniqueVoters: votingStats.uniqueVoters,
      
      // Recent activity
      recentIssues,
      recentVotes,
      
      // Performance metrics
      resolutionRate,
      avgResolutionDays,
      
      // Breakdowns
      issuesByCategory: issuesByCategory.map(item => ({
        category: item._id,
        count: item.count
      })),
      issuesByPriority: issuesByPriority.map(item => ({
        priority: item._id,
        count: item.count
      }))
    }
    
    return NextResponse.json<ApiResponse<typeof stats>>({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: stats
    })
    
  } catch (error: any) {
    console.error('Get admin stats error:', error)
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: error.message
      }, { status: 401 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to retrieve admin statistics',
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

