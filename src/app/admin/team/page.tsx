/**
 * =============================================================================
 * Team Collaboration - SunnyGPT Enterprise
 * =============================================================================
 * Shared workspaces, team management, and collaborative features
 * 
 * FEATURES:
 * - Team workspaces
 * - Member management (roles, permissions)
 * - Shared folders and resources
 * - Team analytics
 * - Real-time collaboration
 * 
 * =============================================================================
 */

'use client'

import { useState, useEffect } from 'react'
import { 
    Users, 
    UserPlus, 
    Shield, 
    Folder,
    MessageSquare,
    BarChart3,
    Settings,
    Mail,
    MoreVertical,
    Check,
    X,
    Crown,
    Star,
    Eye,
    Edit,
    Trash2,
    UserCheck,
    Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface TeamMember {
    id: string
    name: string
    email: string
    avatar?: string
    role: TeamRole
    joinedAt: Date
    lastActive: Date
    isOnline: boolean
}

export interface Team {
    id: string
    name: string
    description?: string
    avatar?: string
    ownerId: string
    members: TeamMember[]
    createdAt: Date
    settings: TeamSettings
}

export interface TeamSettings {
    allowMemberInvite: boolean
    allowSharedFolders: boolean
    requireApproval: boolean
    maxMembers: number
}

export interface SharedFolder {
    id: string
    name: string
    ownerId: string
    members: string[] // member IDs with access
    items: number
    createdAt: Date
}

// ============================================================================
// MOCK DATA
// ============================================================================

const CURRENT_USER = {
    id: 'user-1',
    name: 'Shamiur Sunny',
    email: 'shamiur.sunny@gmail.com',
    avatar: undefined
}

const MOCK_MEMBERS: TeamMember[] = [
    {
        id: 'member-1',
        name: 'Shamiur Sunny',
        email: 'shamiur.sunny@gmail.com',
        role: 'owner',
        joinedAt: new Date('2024-01-01'),
        lastActive: new Date(),
        isOnline: true
    },
    {
        id: 'member-2',
        name: 'John Developer',
        email: 'john@example.com',
        role: 'admin',
        joinedAt: new Date('2024-02-15'),
        lastActive: new Date(Date.now() - 3600000),
        isOnline: true
    },
    {
        id: 'member-3',
        name: 'Sarah Designer',
        email: 'sarah@example.com',
        role: 'member',
        joinedAt: new Date('2024-03-10'),
        lastActive: new Date(Date.now() - 86400000),
        isOnline: false
    },
    {
        id: 'member-4',
        name: 'Mike Manager',
        email: 'mike@example.com',
        role: 'viewer',
        joinedAt: new Date('2024-04-05'),
        lastActive: new Date(Date.now() - 172800000),
        isOnline: false
    }
]

const MOCK_FOLDERS: SharedFolder[] = [
    { id: 'folder-1', name: 'Project Alpha', ownerId: 'member-1', members: ['member-2', 'member-3'], items: 24, createdAt: new Date('2024-03-01') },
    { id: 'folder-2', name: 'Marketing Assets', ownerId: 'member-2', members: ['member-1', 'member-4'], items: 56, createdAt: new Date('2024-03-15') },
    { id: 'folder-3', name: 'Development Docs', ownerId: 'member-2', members: ['member-1', 'member-3'], items: 12, createdAt: new Date('2024-04-01') },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleBadge(role: TeamRole): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold' {
    const variants = {
        owner: 'gold',
        admin: 'purple',
        member: 'blue',
        viewer: 'outline'
    }
    return variants[role] as 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold'
}

function getRoleIcon(role: TeamRole) {
    switch (role) {
        case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
        case 'admin': return <Star className="w-4 h-4 text-purple-500" />
        case 'member': return <UserPlus className="w-4 h-4 text-blue-500" />
        case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />
    }
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TeamCollaborationPage() {
    const [members] = useState<TeamMember[]>(MOCK_MEMBERS)
    const [folders] = useState<SharedFolder[]>(MOCK_FOLDERS)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [activeTab, setActiveTab] = useState('members')

    const [teamSettings, setTeamSettings] = useState<TeamSettings>({
        allowMemberInvite: true,
        allowSharedFolders: true,
        requireApproval: false,
        maxMembers: 50
    })

    // Calculate stats
    const onlineMembers = members.filter(m => m.isOnline).length
    const totalMembers = members.length
    const adminCount = members.filter(m => m.role === 'admin' || m.role === 'owner').length

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Team Collaboration
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your team members, shared resources, and collaboration settings
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        leftIcon={<Settings className="w-4 h-4" />}
                        onClick={() => setShowSettingsModal(true)}
                    >
                        Settings
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<UserCheck className="w-4 h-4" />}
                        onClick={() => setShowInviteModal(true)}
                    >
                        Add Member
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Members</p>
                                <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Online Now</p>
                                <p className="text-2xl font-bold text-gray-900">{onlineMembers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Folder className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Shared Folders</p>
                                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Admins</p>
                                <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="members" onValueChange={setActiveTab}>
                <TabList>
                    <Tab value="members">Members</Tab>
                    <Tab value="folders">Shared Folders</Tab>
                    <Tab value="activity">Activity</Tab>
                </TabList>

                <TabPanels>
                    {/* Members Tab */}
                    <TabPanel value="members">
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-gray-600">Member</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Role</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Joined</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Last Active</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Status</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {members.map((member) => (
                                            <tr key={member.id}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={member.avatar} />
                                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{member.name}</p>
                                                            <p className="text-sm text-gray-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {getRoleIcon(member.role)}
                                                        <Badge variant={getRoleBadge(member.role)}>
                                                            {member.role}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {member.joinedAt.toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {member.lastActive.toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            'w-2 h-2 rounded-full',
                                                            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                                        )} />
                                                        <span className="text-sm text-gray-600">
                                                            {member.isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {member.role !== 'owner' && (
                                                        <div className="flex gap-2">
                                                            <button className="p-2 hover:bg-gray-100 rounded" title="Edit role">
                                                                <Edit className="w-4 h-4 text-gray-500" />
                                                            </button>
                                                            <button className="p-2 hover:bg-gray-100 rounded" title="Remove">
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    {/* Folders Tab */}
                    <TabPanel value="folders">
                        <div className="grid grid-cols-3 gap-6">
                            {folders.map((folder) => (
                                <Card key={folder.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <Folder className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                                                    <p className="text-sm text-gray-500">{folder.items} items</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-100 rounded">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-gray-500">
                                                Created {folder.createdAt.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add Folder Card */}
                            <Card className="border-dashed border-2 border-gray-300 hover:border-indigo-500 transition-colors cursor-pointer">
                                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[150px]">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                        <Folder className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium">Create Shared Folder</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabPanel>

                    {/* Activity Tab */}
                    <TabPanel value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { action: 'joined the team', user: 'John Developer', time: '2 hours ago' },
                                        { action: 'shared folder "Project Alpha"', user: 'Sarah Designer', time: '5 hours ago' },
                                        { action: 'updated permissions', user: 'Shamiur Sunny', time: '1 day ago' },
                                        { action: 'left the team', user: 'Mike Manager', time: '2 days ago' },
                                    ].map((activity, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900">
                                                    <span className="font-medium">{activity.user}</span> {activity.action}
                                                </p>
                                                <p className="text-sm text-gray-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}