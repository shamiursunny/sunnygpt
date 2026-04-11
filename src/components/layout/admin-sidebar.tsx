/**
 * =============================================================================
 * Admin Sidebar Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional admin sidebar with navigation and user info
 * =============================================================================
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut, useSession } from 'next-auth/react'
import { 
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Mail,
  Megaphone,
  Search,
  Globe,
  Database,
  Shield,
  HelpCircle,
  MessageSquare,
  Package,
  Briefcase,
  Wallet,
  Receipt,
  Building,
  Target,
  PieChart,
  FileBarChart,
  Zap
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
  children?: NavItem[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Analytics', href: '/admin/analytics', icon: <PieChart className="w-5 h-5" /> },
    ],
  },
  {
    title: 'CRM & Sales',
    items: [
      { label: 'CRM Dashboard', href: '/admin/crm', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Contacts', href: '/admin/crm/contacts', icon: <Users className="w-5 h-5" /> },
      { label: 'Companies', href: '/admin/crm/companies', icon: <Building className="w-5 h-5" /> },
      { label: 'Deals', href: '/admin/crm/deals', icon: <Target className="w-5 h-5" /> },
      { label: 'Quotes', href: '/admin/crm/quotations', icon: <FileText className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Accounting',
    items: [
      { label: 'Accounting', href: '/admin/accounting', icon: <Receipt className="w-5 h-5" /> },
      { label: 'Invoices', href: '/admin/accounting/invoices', icon: <FileBarChart className="w-5 h-5" /> },
      { label: 'Payments', href: '/admin/accounting/payments', icon: <Wallet className="w-5 h-5" /> },
      { label: 'Expenses', href: '/admin/accounting/expenses', icon: <CreditCard className="w-5 h-5" /> },
      { label: 'Taxes', href: '/admin/accounting/taxes', icon: <Database className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Billing & Subscriptions',
    items: [
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: <Layers className="w-5 h-5" /> },
      { label: 'Payment Gateways', href: '/admin/payments/gateways', icon: <CreditCard className="w-5 h-5" /> },
      { label: 'Transactions', href: '/admin/payments/transactions', icon: <ShoppingCart className="w-5 h-5" /> },
      { label: 'Payouts', href: '/admin/payments/payouts', icon: <Wallet className="w-5 h-5" /> },
    ],
  },
  {
    title: 'User Management',
    items: [
      { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" />, badge: 156 },
      { label: 'Roles & Permissions', href: '/admin/roles', icon: <Shield className="w-5 h-5" /> },
      { label: 'Teams', href: '/admin/teams', icon: <Users className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Projects',
    items: [
      { label: 'Projects', href: '/admin/projects', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Tasks', href: '/admin/projects/tasks', icon: <Zap className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Helpdesk',
    items: [
      { label: 'Tickets', href: '/admin/helpdesk', icon: <MessageSquare className="w-5 h-5" />, badge: 12 },
      { label: 'Knowledge Base', href: '/admin/helpdesk/kb', icon: <HelpCircle className="w-5 h-5" /> },
      { label: 'Canned Responses', href: '/admin/helpdesk/canned', icon: <Mail className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Products', href: '/admin/inventory', icon: <Package className="w-5 h-5" /> },
      { label: 'Stock', href: '/admin/inventory/stock', icon: <Database className="w-5 h-5" /> },
      { label: 'Suppliers', href: '/admin/inventory/suppliers', icon: <Building className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Email Campaigns', href: '/admin/marketing/emails', icon: <Mail className="w-5 h-5" /> },
      { label: 'Templates', href: '/admin/marketing/templates', icon: <FileText className="w-5 h-5" /> },
      { label: 'Automation', href: '/admin/marketing/automation', icon: <Zap className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Advertisement',
    items: [
      { label: 'Ads Manager', href: '/admin/ads', icon: <Megaphone className="w-5 h-5" /> },
      { label: 'Facebook', href: '/admin/ads/facebook', icon: <Globe className="w-5 h-5" /> },
      { label: 'Google', href: '/admin/ads/google', icon: <Search className="w-5 h-5" /> },
      { label: 'Instagram', href: '/admin/ads/instagram', icon: <Globe className="w-5 h-5" /> },
      { label: 'LinkedIn', href: '/admin/ads/linkedin', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Internal Ads', href: '/admin/ads/internal', icon: <Megaphone className="w-5 h-5" /> },
    ],
  },
  {
    title: 'SEO',
    items: [
      { label: 'SEO Dashboard', href: '/admin/seo', icon: <Search className="w-5 h-5" /> },
      { label: 'Page Settings', href: '/admin/seo/pages', icon: <FileText className="w-5 h-5" /> },
      { label: 'Sitemap', href: '/admin/seo/sitemap', icon: <Globe className="w-5 h-5" /> },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'General Settings', href: '/admin/system/general', icon: <Settings className="w-5 h-5" /> },
      { label: 'Email Config', href: '/admin/system/email', icon: <Mail className="w-5 h-5" /> },
      { label: 'Backup', href: '/admin/system/backup', icon: <Database className="w-5 h-5" /> },
      { label: 'Logs', href: '/admin/system/logs', icon: <FileText className="w-5 h-5" /> },
      { label: 'API Keys', href: '/admin/system/api', icon: <Zap className="w-5 h-5" /> },
    ],
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const userRole = (session?.user as any)?.role || 'user'
  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  if (!isAdmin) return null

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && (
          <Link href="/admin/dashboard" className="font-bold text-xl text-indigo-400">
            SunnyGPT
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                    collapsed && 'justify-center'
                  )}
                >
                  {item.icon}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-800">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar
            src={session?.user?.image}
            fallback={session?.user?.name || session?.user?.email || 'A'}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || 'Admin'}
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
            'mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar