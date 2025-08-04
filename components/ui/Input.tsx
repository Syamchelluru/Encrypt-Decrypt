'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-secondary-300 focus-visible:border-primary-500 focus-visible:ring-primary-500',
        error: 'border-danger-500 focus-visible:border-danger-500 focus-visible:ring-danger-500',
        success: 'border-success-500 focus-visible:border-success-500 focus-visible:ring-success-500',
        glass: 'glass border-white/20 bg-white/10 text-white placeholder:text-white/70 focus-visible:border-white/40 focus-visible:ring-white/20',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerClassName,
    ...props 
  }, ref) => {
    const inputVariant = error ? 'error' : variant

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-secondary-700">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'text-xs',
            error ? 'text-danger-600' : 'text-secondary-600'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }

