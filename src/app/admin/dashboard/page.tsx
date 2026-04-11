/**
 * =============================================================================
 * Admin Dashboard Page - SunnyGPT Enterprise
 * =============================================================================
 * Comprehensive dashboard with stats, charts, and quick actions
 * =============================================================================
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Users,
  DollarSign,
  MessageSquare,
  Ticket,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileText,
  ShoppingCart,
  BarChart3,
  Globe,
  Zap
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { AdminLayout } from '@/components/layout/admin-layout'

// ============================================================================
// STATS DATA
// ============================================================================

const STATS_CARDS = [
  {
    title: 'Total Users',
    value: '12,458',
    change: '+12.5%',
    trend: 'up',
    icon: <Users className="w-6 h-6 text-white" />,
    color: 'bg-blue-500',
    href: '/admin/users',
  },
  {
    title: 'Monthly Revenue',
    value: '$84,320',
    change: '+8.2%',
    trend: 'up',
    icon: <DollarSign className="w-6 h-6 text-white" />,
    color: 'bg-emerald-500',
    href: '/admin/subscriptions',
  },
  {
    title: 'Active Chats',
    value: '3,847',
    change: '+23.1%',
    trend: 'up',
    icon: <MessageSquare className="w-6 h-6 text-white" />,
    color: 'bg-violet-500',
    href: '/admin/chat',
  },
  {
    title: 'Open Tickets',
    value: '156',
    change: '-5.3%',
    trend: 'down',
    icon: <Ticket className="w-6 h-6" />,
    color: 'bg-amber-500',
    href: '/admin/helpdesk',
  },
]

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

const RECENT_ACTIVITY = [
  { id: 1, user: 'John Doe', action: 'Upgraded to Pro plan', time: '2 min ago', type: 'upgrade' },
  { id: 2, user: 'Sarah Smith', action: 'New user registration', time: '15 min ago', type: 'signup' },
  { id: 3, user: 'Mike Johnson', action: 'Submitted support ticket', time: '1 hour ago', type: 'ticket' },
  { id: 4, user: 'Emily Brown', action: 'Payment received $299', time: '2 hours ago', type: 'payment' },
  { id: 5, user: 'David Wilson', action: 'Completed onboarding', time: '3 hours ago', type: 'onboarding' },
]

// ============================================================================
// TOP PLANS
// ============================================================================

const TOP_PLANS = [
  { name: 'Pro Plan', users: 2847, revenue: '$82563', color: 'bg-indigo-500' },
  { name: 'Business Plan', users: 1234, revenue: '$97586', color: 'bg-violet-500' },
  { name: 'Starter Plan', users: 5892, revenue: '$53028', color: 'bg-emerald-500' },
  { name: 'Free Plan', users: 3123, revenue: '$0', color: 'bg-gray-400' },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your business performance</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_CARDS.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <Badge variant={stat.trend === 'up' ? 'success' : 'danger'}>
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Revenue Overview</CardTitle>
              <select className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {[65, 45, 78, 52, 90, 68, 85, 72, 95, 88, 76, 92].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$843,200</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Growth</p>
                  <p className="text-lg font-semibold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +18.2%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TOP_PLANS.map((plan) => (
                  <div key={plan.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{plan.name}</span>
                      <span className="text-sm text-gray-500">{plan.users.toLocaleString()} users</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${plan.color} rounded-full`}
                        style={{ width: `${(plan.users / 12096) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{plan.revenue}/mo</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link href="/admin/activity" className="text-sm text-indigo-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECENT_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <Avatar
                      fallback={activity.user.charAt(0)}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/admin/users/create" 
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                >
                  <Users className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mb-2" />
                  <p className="font-medium text-gray-900">Add User</p>
                  <p className="text-xs text-gray-500">Create new account</p>
                </Link>
                <Link 
                  href="/admin/subscriptions/create" 
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                >
                  <ShoppingCart className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mb-2" />
                  <p className="font-medium text-gray-900">New Sale</p>
                  <p className="text-xs text-gray-500">Process payment</p>
                </Link>
                <Link 
                  href="/admin/marketing/emails" 
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                >
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mb-2" />
                  <p className="font-medium text-gray-900">Send Email</p>
                  <p className="text-xs text-gray-500">Campaign campaign</p>
                </Link>
                <Link 
                  href="/admin/ads/create" 
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                >
                  <Globe className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mb-2" />
                  <p className="font-medium text-gray-900">Create Ad</p>
                  <p className="text-xs text-gray-500">Start campaign</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}