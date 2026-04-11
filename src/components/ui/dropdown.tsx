/**
 * =============================================================================
 * Dropdown Menu Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional dropdown with nested menus and icons
 * =============================================================================
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

export interface DropdownItem {
  label?: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
  children?: DropdownItem[]
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [submenuIndex, setSubmenuIndex] = React.useState<number | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSubmenuIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const renderItems = (items: DropdownItem[], depth = 0) => {
    return items.map((item, index) => {
      if (item.divider) {
        return <div key={index} className="h-px bg-gray-100 my-1" />
      }

      const hasChildren = item.children && item.children.length > 0

      return (
        <div key={index} className="relative">
          <button
            type="button"
            onClick={() => {
              if (hasChildren) {
                setSubmenuIndex(submenuIndex === index ? null : index)
              } else {
                item.onClick?.()
                setIsOpen(false)
              }
            }}
            disabled={item.disabled}
            className={cn(
              'w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-3',
              'hover:bg-gray-100 transition-colors',
              item.disabled && 'opacity-50 cursor-not-allowed',
              item.danger && 'text-red-600 hover:bg-red-50',
              depth > 0 && 'pl-8'
            )}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {hasChildren && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {hasChildren && submenuIndex === index && (
            <div
              className={cn(
                'absolute top-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] py-1 z-50',
                align === 'left' ? 'left-full ml-1' : 'right-full mr-1'
              )}
            >
              {renderItems(item.children!, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-1 z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {renderItems(items)}
        </div>
      )}
    </div>
  )
}

export default Dropdown