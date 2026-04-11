/**
 * =============================================================================
 * Avatar Component - SunnyGPT Enterprise
 * =============================================================================
 * User avatar with image, initials fallback, and status indicator
 * =============================================================================
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    const [loaded, setLoaded] = React.useState(false)

    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    }

    const statusSizes = {
      xs: 'w-1.5 h-1.5 border',
      sm: 'w-2 h-2 border',
      md: 'w-2.5 h-2.5 border-2',
      lg: 'w-3 h-3 border-2',
      xl: 'w-4 h-4 border-2',
    }

    const statusColors = {
      online: 'bg-emerald-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
    }

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    }

    const showFallback = !src || imageError

    return (
      <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
        <div
          className={cn(
            'rounded-full flex items-center justify-center overflow-hidden bg-gray-200',
            sizes[size]
          )}
        >
          {showFallback ? (
            fallback ? (
              <span className="font-medium text-gray-600">{getInitials(fallback)}</span>
            ) : (
              <User className="text-gray-400" />
            )
          ) : (
            <img
              src={src}
              alt={alt || 'Avatar'}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-200',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-white',
              statusSizes[size],
              statusColors[status]
            )}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

// AvatarImage component
function AvatarImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={src} alt={alt} className={cn('w-full h-full object-cover', className)} {...props} />
}

// AvatarFallback component
function AvatarFallback({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('w-full h-full flex items-center justify-center bg-gray-100 text-gray-600', className)} {...props}>
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
export default Avatar