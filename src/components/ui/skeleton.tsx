/**
 * =============================================================================
 * Skeleton Loader Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional loading skeleton with shimmer animation
 * =============================================================================
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-200 rounded animate-pulse',
              i === lines - 1 && 'w-3/4',
              className
            )}
            style={{ width: i === lines - 1 ? '75%' : width, height }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-gray-200 animate-pulse',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-5 border border-gray-200 rounded-xl', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2">
          <Skeleton width={120} />
          <Skeleton width={80} height={12} />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="flex-1" height={16} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="flex-1" height={40} variant="rectangular" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Chart Skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-5 border border-gray-200 rounded-xl', className)}>
      <Skeleton width={150} className="mb-4" />
      <Skeleton height={200} variant="rectangular" />
    </div>
  )
}
export default Skeleton;
