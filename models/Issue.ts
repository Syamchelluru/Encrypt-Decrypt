import mongoose, { Schema, model, models } from 'mongoose'
import { IIssue, IComment } from '@/types'

const CommentSchema = new Schema<IComment>({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

const IssueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['infrastructure', 'sanitation', 'safety', 'environment', 'transportation', 'other'],
      message: 'Category must be one of: infrastructure, sanitation, safety, environment, transportation, other'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90      // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      }
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url)
      },
      message: 'Invalid image URL format'
    }
  }],
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  votes: {
    type: Number,
    default: 0,
    min: [0, 'Votes cannot be negative']
  },
  votedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  resolvedAt: {
    type: Date
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

// Indexes for efficient queries
IssueSchema.index({ location: '2dsphere' }) // Geospatial index for location-based queries
IssueSchema.index({ status: 1, createdAt: -1 }) // Compound index for status and date
IssueSchema.index({ category: 1, createdAt: -1 }) // Compound index for category and date
IssueSchema.index({ reportedBy: 1, createdAt: -1 }) // Index for user's issues
IssueSchema.index({ votes: -1 }) // Index for sorting by votes
IssueSchema.index({ createdAt: -1 }) // Index for sorting by date
IssueSchema.index({ 
  title: 'text', 
  description: 'text', 
  address: 'text' 
}, {
  weights: {
    title: 10,
    description: 5,
    address: 1
  }
}) // Text index for search functionality

// Pre-save middleware to set resolvedAt when status changes to resolved
IssueSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date()
    } else if (this.status !== 'resolved') {
      this.resolvedAt = undefined
    }
  }
  next()
})

// Method to add vote
IssueSchema.methods.addVote = function(userId: string) {
  if (!this.votedBy.includes(userId)) {
    this.votedBy.push(userId)
    this.votes += 1
    return true
  }
  return false
}

// Method to remove vote
IssueSchema.methods.removeVote = function(userId: string) {
  const index = this.votedBy.indexOf(userId)
  if (index > -1) {
    this.votedBy.splice(index, 1)
    this.votes -= 1
    return true
  }
  return false
}

// Method to add comment
IssueSchema.methods.addComment = function(text: string, authorId: string, authorName: string) {
  this.comments.push({
    text,
    author: authorId,
    authorName,
    createdAt: new Date()
  })
}

// Static method to find issues near location
IssueSchema.statics.findNearLocation = function(
  longitude: number, 
  latitude: number, 
  maxDistance: number = 5000 // 5km default
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  })
}

// Static method to get issues with filters
IssueSchema.statics.findWithFilters = function(filters: any = {}) {
  const query: any = {}
  
  if (filters.status) query.status = filters.status
  if (filters.category) query.category = filters.category
  if (filters.priority) query.priority = filters.priority
  if (filters.reportedBy) query.reportedBy = filters.reportedBy
  if (filters.assignedTo) query.assignedTo = filters.assignedTo
  
  if (filters.search) {
    query.$text = { $search: filters.search }
  }
  
  if (filters.location && filters.location.coordinates && filters.location.radius) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: filters.location.coordinates
        },
        $maxDistance: filters.location.radius * 1000 // Convert km to meters
      }
    }
  }
  
  let queryBuilder = this.find(query)
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email')
  
  // Sorting
  if (filters.sortBy) {
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1
    queryBuilder = queryBuilder.sort({ [filters.sortBy]: sortOrder })
  } else {
    queryBuilder = queryBuilder.sort({ createdAt: -1 })
  }
  
  // Pagination
  if (filters.page && filters.limit) {
    const skip = (filters.page - 1) * filters.limit
    queryBuilder = queryBuilder.skip(skip).limit(filters.limit)
  }
  
  return queryBuilder
}

// Static method to get dashboard stats
IssueSchema.statics.getDashboardStats = async function(userId?: string) {
  const pipeline: any[] = [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]
  
  if (userId) {
    pipeline.unshift({
      $match: { reportedBy: new mongoose.Types.ObjectId(userId) }
    })
  }
  
  const stats = await this.aggregate(pipeline)
  
  const result = {
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0
  }
  
  stats.forEach((stat: any) => {
    result.totalIssues += stat.count
    switch (stat._id) {
      case 'pending':
        result.pendingIssues = stat.count
        break
      case 'in-progress':
        result.inProgressIssues = stat.count
        break
      case 'resolved':
        result.resolvedIssues = stat.count
        break
    }
  })
  
  return result
}

const Issue = models.Issue || model<IIssue>('Issue', IssueSchema)

export default Issue

