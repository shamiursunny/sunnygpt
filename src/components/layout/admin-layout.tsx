/**
 * =============================================================================
 * Admin Layout - SunnyGPT Enterprise
 * =============================================================================
 * Main admin layout with sidebar, header, and content area
 * =============================================================================
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Header */}
      <AdminHeader
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

// Export individual components for flexibility
export { AdminSidebar } from './admin-sidebar'
export { AdminHeader } from './admin-header'

export default AdminLayout