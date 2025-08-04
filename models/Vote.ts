import mongoose, { Schema, model, models } from 'mongoose'
import { IVote } from '@/types'

const VoteSchema = new Schema<IVote>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: [true, 'Issue ID is required']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Compound index to ensure one vote per user per issue
VoteSchema.index({ userId: 1, issueId: 1 }, { unique: true })

// Index for efficient queries
VoteSchema.index({ issueId: 1, createdAt: -1 })
VoteSchema.index({ userId: 1, createdAt: -1 })

// Static method to toggle vote
VoteSchema.statics.toggleVote = async function(userId: string, issueId: string) {
  try {
    const existingVote = await this.findOne({ userId, issueId })
    
    if (existingVote) {
      // Remove vote
      await this.deleteOne({ userId, issueId })
      return { action: 'removed', vote: existingVote }
    } else {
      // Add vote
      const newVote = await this.create({ userId, issueId })
      return { action: 'added', vote: newVote }
    }
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error - vote already exists
      const existingVote = await this.findOne({ userId, issueId })
      await this.deleteOne({ userId, issueId })
      return { action: 'removed', vote: existingVote }
    }
    throw error
  }
}

// Static method to get user's votes
VoteSchema.statics.getUserVotes = function(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit
  
  return this.find({ userId })
    .populate('issueId', 'title description status category location address images votes createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get vote count for issue
VoteSchema.statics.getIssueVoteCount = function(issueId: string) {
  return this.countDocuments({ issueId })
}

// Static method to check if user voted for issue
VoteSchema.statics.hasUserVoted = function(userId: string, issueId: string) {
  return this.exists({ userId, issueId })
}

// Static method to get voting statistics
VoteSchema.statics.getVotingStats = async function(userId?: string) {
  const pipeline: any[] = [
    {
      $group: {
        _id: null,
        totalVotes: { $sum: 1 },
        uniqueVoters: { $addToSet: '$userId' },
        uniqueIssues: { $addToSet: '$issueId' }
      }
    },
    {
      $project: {
        _id: 0,
        totalVotes: 1,
        uniqueVoters: { $size: '$uniqueVoters' },
        uniqueIssues: { $size: '$uniqueIssues' }
      }
    }
  ]
  
  if (userId) {
    pipeline.unshift({
      $match: { userId: new mongoose.Types.ObjectId(userId) }
    })
  }
  
  const result = await this.aggregate(pipeline)
  return result[0] || { totalVotes: 0, uniqueVoters: 0, uniqueIssues: 0 }
}

const Vote = models.Vote || model<IVote>('Vote', VoteSchema)

export default Vote

