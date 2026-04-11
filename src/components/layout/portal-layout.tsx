/**
 * =============================================================================
 * Client Portal Layout - SunnyGPT Enterprise
 * =============================================================================
 * Main layout for authenticated client users
 * =============================================================================
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut, useSession } from 'next-auth/react'
import { 
  MessageSquare,
  Settings,
  CreditCard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Plus
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const PORTAL_NAV_ITEMS = [
  { 
    label: 'AI Chat', 
    href: '/portal/chat', 
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Chat with AI assistant'
  },
  { 
    label: 'My Chats', 
    href: '/portal/chats', 
    icon: <Zap className="w-5 h-5" />,
    description: 'View conversation history'
  },
  { 
    label: 'Billing', 
    href: '/portal/billing', 
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Manage subscription'
  },
  { 
    label: 'Invoices', 
    href: '/portal/invoices', 
    icon: <FileText className="w-5 h-5" />,
    description: 'View invoices'
  },
  { 
    label: 'Team', 
    href: '/portal/team', 
    icon: <Users className="w-5 h-5" />,
    description: 'Manage team members'
  },
  { 
    label: 'Settings', 
    href: '/portal/settings', 
    icon: <Settings className="w-5 h-5" />,
    description: 'Account settings'
  },
]

interface PortalLayoutProps {
  children: React.ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = React.useState(false)

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/portal/chat" className="font-bold text-xl text-indigo-600">
              SunnyGPT
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Link
            href="/portal/chat"
            className={cn(
              'flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors',
              collapsed && 'px-2'
            )}
          >
            <Plus className="w-5 h-5" />
            {!collapsed && <span>New Chat</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {PORTAL_NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center'
                )}
                title={item.description}
              >
                {item.icon}
                {!collapsed && (
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-100">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar
              src={session?.user?.image}
              fallback={
                session?.user?.name?.charAt(0) || 
                session?.user?.email?.charAt(0) || 
                'U'
              }
              size="sm"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 min-h-screen transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {children}
      </main>
    </div>
  )
}

export default PortalLayout