/**
 * =============================================================================
 * Portal Layout - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Main layout for authenticated users (portal)
 * 
 * =============================================================================
 */

"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  MessageSquare, 
  Settings, 
  LogOut, 
  Users,
  LayoutDashboard,
  ChevronLeft,
  Menu
} from "lucide-react"
import { useState } from "react"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navItems = [
    { href: "/portal/chat", label: "Chat", icon: MessageSquare },
    { href: "/portal/settings", label: "Settings", icon: Settings },
  ]

  const adminItems = [
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: LayoutDashboard },
  ]

  const isAdmin = (session?.user as any)?.role === "admin"

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link href="/portal/chat" className="font-bold text-xl text-indigo-600">
              SunnyGPT
            </Link>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              {!sidebarCollapsed && (
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Admin
                </div>
              )}
              {adminItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "?"}
                </span>
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              sidebarCollapsed ? '' : ''
            }`}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}