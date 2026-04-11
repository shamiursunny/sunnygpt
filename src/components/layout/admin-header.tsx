/**
 * =============================================================================
 * Admin Header Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional admin header with search, notifications, and quick actions
 * =============================================================================
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Bell,
  Search,
  Settings,
  HelpCircle,
  Menu,
  Plus,
  ChevronDown
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useSession } from 'next-auth/react'

interface AdminHeaderProps {
  onMenuClick: () => void
  sidebarCollapsed: boolean
}

export function AdminHeader({ onMenuClick, sidebarCollapsed }: AdminHeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showNotifications, setShowNotifications] = React.useState(false)

  // Get current page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/').filter(Boolean)
    const lastSegment = path[path.length - 1] || 'Dashboard'
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
  }

  // Sample notifications
  const notifications = [
    { id: 1, title: 'New user signed up', message: 'John Doe registered', time: '2 min ago', unread: true },
    { id: 2, title: 'Payment received', message: '$299 from stripe payment', time: '15 min ago', unread: true },
    { id: 3, title: 'New ticket', message: 'Support request from user', time: '1 hour ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {session?.user?.name || 'Admin'}
          </p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, invoices, orders..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Quick Add Button */}
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer',
                      notification.unread && 'bg-indigo-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {notification.unread && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                      )}
                      <div className={cn(!notification.unread && 'ml-5')}>
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <Link href="/admin/notifications" className="text-sm text-indigo-600 hover:underline">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>

        {/* Settings */}
        <Link href="/admin/settings" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 ml-2 border-l border-gray-200">
          <Avatar
            src={session?.user?.image}
            fallback={session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'A'}
            size="sm"
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader