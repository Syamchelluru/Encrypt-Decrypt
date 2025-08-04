'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        destructive: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500',
        outline: 'border border-primary-200 bg-white text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500',
        secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus-visible:ring-secondary-500',
        ghost: 'text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
        warning: 'bg-warning-600 text-white hover:bg-warning-700 focus-visible:ring-warning-500',
        glass: 'glass text-primary-700 hover:bg-white/20 focus-visible:ring-primary-500 backdrop-blur-md',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }

