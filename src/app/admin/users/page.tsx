/**
 * =============================================================================
 * Admin Users Page - SunnyGPT Enterprise
 * =============================================================================
 * Professional user management with search, filter, and actions
 * =============================================================================
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Shield,
  Trash2,
  Edit,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Dropdown } from '@/components/ui/dropdown'
import { AdminLayout } from '@/components/layout/admin-layout'

// ============================================================================
// MOCK DATA
// ============================================================================

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'super_admin' | 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  plan: 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
  joinedAt: string
  lastActive: string
  spent: number
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Shamiur Rashid Sunny', email: 'shamiur.sunny@gmail.com', role: 'super_admin', status: 'active', plan: 'enterprise', joinedAt: '2024-01-15', lastActive: '2 min ago', spent: 15000 },
  { id: '2', name: 'John Doe', email: 'john.doe@company.com', role: 'admin', status: 'active', plan: 'business', joinedAt: '2024-03-20', lastActive: '1 hour ago', spent: 8500 },
  { id: '3', name: 'Sarah Smith', email: 'sarah.smith@tech.io', role: 'manager', status: 'active', plan: 'pro', joinedAt: '2024-05-10', lastActive: '3 hours ago', spent: 3200 },
  { id: '4', name: 'Mike Johnson', email: 'mike.j@startup.co', role: 'user', status: 'active', plan: 'starter', joinedAt: '2024-06-15', lastActive: '5 hours ago', spent: 890 },
  { id: '5', name: 'Emily Brown', email: 'emily@design.studio', role: 'user', status: 'inactive', plan: 'free', joinedAt: '2024-07-01', lastActive: '2 days ago', spent: 0 },
  { id: '6', name: 'David Wilson', email: 'david.w@agency.com', role: 'user', status: 'active', plan: 'pro', joinedAt: '2024-08-10', lastActive: '1 day ago', spent: 2800 },
  { id: '7', name: 'Lisa Chen', email: 'lisa.chen@corp.net', role: 'manager', status: 'active', plan: 'business', joinedAt: '2024-09-05', lastActive: '4 hours ago', spent: 6200 },
  { id: '8', name: 'Robert Taylor', email: 'r.taylor@mall.com', role: 'user', status: 'suspended', plan: 'starter', joinedAt: '2024-10-01', lastActive: '5 days ago', spent: 450 },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  // Filter users
  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      super_admin: 'danger' as const,
      admin: 'primary' as const,
      manager: 'secondary' as const,
      user: 'default' as const,
    }
    return variants[role]
  }

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'success' as const,
      inactive: 'default' as const,
      suspended: 'danger' as const,
    }
    return variants[status]
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-3">
                <Select
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'super_admin', label: 'Super Admin' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'user', label: 'User' },
                  ]}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  placeholder="Role"
                />
                <Select
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'suspended', label: 'Suspended' },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Status"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Spent</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar}
                            fallback={user.name.charAt(0)}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getRoleBadge(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadge(user.status)} dot>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-sm text-gray-700">{user.plan}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{user.joinedAt}</p>
                        <p className="text-xs text-gray-400">Last: {user.lastActive}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">${user.spent.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Dropdown
                          trigger={
                            <button className="p-1 rounded hover:bg-gray-100">
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          }
                          items={[
                            { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => {} },
                            { label: 'Edit User', icon: <Edit className="w-4 h-4" />, onClick: () => {} },
                            { label: 'Send Email', icon: <Mail className="w-4 h-4" />, onClick: () => {} },
                            { divider: true },
                            { label: 'Change Role', icon: <Shield className="w-4 h-4" />, onClick: () => {} },
                            { label: 'Delete User', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => {} },
                          ]}
                          align="right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}