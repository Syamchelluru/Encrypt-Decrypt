'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-primary-200 border-t-primary-600',
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-secondary-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// Full page loading component
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="glass-card p-8 rounded-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  )
}

// Inline loading component
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}

// Button loading state
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4',
        className
      )}
    />
  )
}

// Card loading skeleton
export function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-xl animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
        <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-secondary-200 rounded"></div>
          <div className="h-3 bg-secondary-200 rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-6 bg-secondary-200 rounded w-16"></div>
          <div className="h-6 bg-secondary-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

// List loading skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-secondary-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-secondary-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b border-secondary-100 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-secondary-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Map loading component
export function MapLoader() {
  return (
    <div className="w-full h-full bg-secondary-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-secondary-600">Loading map...</p>
      </div>
    </div>
  )
}

// Image loading placeholder
export function ImageLoader({ className }: { className?: string }) {
  return (
    <div className={cn(
      'bg-secondary-100 animate-pulse flex items-center justify-center',
      className
    )}>
      <svg
        className="w-8 h-8 text-secondary-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

