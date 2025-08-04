'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight,
  Star,
  Clock,
  Shield,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { IIssue, DashboardStats } from '@/types'
import { formatRelativeTime, getCategoryIcon, getStatusColor } from '@/lib/utils'

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [featuredIssues, setFeaturedIssues] = useState<IIssue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      // Fetch featured issues (top voted, recent)
      const issuesResponse = await fetch('/api/issues?sortBy=votes&sortOrder=desc&limit=6')
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        setFeaturedIssues(issuesData.data.data || [])
      }

      // Fetch basic stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: MapPin,
      title: 'Report Issues',
      description: 'Easily report civic issues in your area with photos and precise locations.',
      color: 'text-primary-600'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Vote on issues that matter to you and help prioritize community needs.',
      color: 'text-success-600'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor the status of reported issues from pending to resolved.',
      color: 'text-warning-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures.',
      color: 'text-danger-600'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Community Member',
      content: 'Fix My Area helped me report a broken streetlight that was fixed within a week. Amazing platform!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Local Resident',
      content: 'I love how easy it is to see what issues are being reported in my neighborhood.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'City Council Member',
      content: 'This platform has revolutionized how we receive and prioritize community feedback.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6">
                Fix Your{' '}
                <span className="text-gradient">Community</span>
                <br />
                One Issue at a Time
              </h1>
              
              <p className="text-xl text-secondary-600 mb-8 max-w-2xl">
                Report civic issues, track their progress, and work together to make your neighborhood a better place to live.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/create">
                  <Button size="lg" className="w-full sm:w-auto">
                    Report an Issue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link href="/issues">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Issues
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              {stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-secondary-200"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {stats.totalIssues}
                    </div>
                    <div className="text-sm text-secondary-600">Issues Reported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">
                      {stats.resolvedIssues}
                    </div>
                    <div className="text-sm text-secondary-600">Issues Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning-600">
                      {stats.totalUsers || 0}
                    </div>
                    <div className="text-sm text-secondary-600">Active Users</div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 rounded-2xl">
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-float">🏘️</div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    Your Community Matters
                  </h3>
                  <p className="text-secondary-600">
                    Join thousands of citizens making a difference
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Our platform makes it easy for citizens to report issues and track their resolution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group hover-lift"
              >
                <div className="glass-card p-6 rounded-xl">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm mb-4 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Issues Section */}
      <section className="py-20 bg-secondary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Recent Issues
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              See what your community is working on
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
                  <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : featuredIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredIssues.map((issue, index) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 rounded-xl hover-lift"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-secondary-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>{issue.votes}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                    {issue.title}
                  </h3>
                  
                  <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-secondary-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{issue.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(issue.createdAt)}</span>
                    </div>
                  </div>

                  <Link href={`/issue/${issue._id}`} className="mt-4 block">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                No Issues Yet
              </h3>
              <p className="text-secondary-600 mb-6">
                Be the first to report an issue in your community
              </p>
              <Link href="/create">
                <Button>Report First Issue</Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/issues">
              <Button variant="outline" size="lg">
                View All Issues
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              What People Say
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Hear from community members who are making a difference
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-warning-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-secondary-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                
                <div>
                  <div className="font-semibold text-secondary-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join thousands of citizens who are actively improving their communities
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

