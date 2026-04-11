/**
 * =============================================================================
 * Badge Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional status badges with multiple variants
 * =============================================================================
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-gray-100 text-gray-700',
      primary: 'bg-indigo-100 text-indigo-700',
      secondary: 'bg-violet-100 text-violet-700',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-cyan-100 text-cyan-700',
      outline: 'border border-gray-300 text-gray-700 bg-transparent',
      gold: 'bg-yellow-100 text-yellow-700',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1 text-sm',
    }

    const dotColors: Record<string, string> = {
      default: 'bg-gray-500',
      primary: 'bg-indigo-500',
      secondary: 'bg-violet-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-cyan-500',
      outline: 'bg-gray-500',
      gold: 'bg-yellow-500',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export default Badge