/**
 * =============================================================================
 * AI Model Management - SunnyGPT Enterprise
 * =============================================================================
 * Admin interface for managing AI models, providers, and configurations
 * 
 * FEATURES:
 * - Model listing and status monitoring
 * - Provider configuration
 * - Usage tracking and analytics
 * - Model enable/disable controls
 * - API key management
 * - Cost tracking
 * 
 * ROUTES:
 * - /admin/ai-models - Main management page
 * - /admin/ai-models/providers - Provider settings
 * - /admin/ai-models/analytics - Usage analytics
 * 
 * =============================================================================
 */

'use client'

import { useState, useEffect } from 'react'
import { 
    Brain, 
    Settings, 
    Activity, 
    DollarSign, 
    Plus, 
    Trash2, 
    Edit, 
    Eye, 
    EyeOff,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Zap,
    Clock,
    BarChart3,
    Cloud,
    Key,
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

// AI Provider types
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'cohere' | 'local' | 'huggingface'

// Model status
export type ModelStatus = 'active' | 'inactive' | 'error' | 'maintenance'

// Model interface
export interface AIModel {
    id: string
    name: string
    provider: AIProvider
    status: ModelStatus
    description: string
    contextLength: number
    pricing: {
        input: number  // per 1M tokens
        output: number // per 1M tokens
        currency: string
    }
    capabilities: string[]
    dailyLimit?: number
    dailyUsage?: number
    lastUsed?: Date
    isEnabled: boolean
}

// Provider interface
export interface AIProviderConfig {
    id: string
    name: string
    type: AIProvider
    apiKey?: string
    isEnabled: boolean
    baseUrl?: string
    models: string[]
}

// Usage analytics interface
export interface UsageAnalytics {
    totalRequests: number
    totalTokens: number
    totalCost: number
    requestsByModel: Record<string, number>
    tokensByModel: Record<string, number>
    costByModel: Record<string, number>
    dailyUsage: { date: string; requests: number; tokens: number; cost: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const INITIAL_MODELS: AIModel[] = [
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        status: 'active',
        description: 'Most capable GPT model, great for complex tasks',
        contextLength: 128000,
        pricing: { input: 10, output: 30, currency: 'USD' },
        capabilities: ['text', 'code', 'reasoning'],
        dailyLimit: 1000,
        dailyUsage: 456,
        lastUsed: new Date(),
        isEnabled: true
    },
    {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        status: 'active',
        description: 'Faster version of GPT-4 with lower pricing',
        contextLength: 128000,
        pricing: { input: 10, output: 30, currency: 'USD' },
        capabilities: ['text', 'code', 'vision'],
        dailyLimit: 5000,
        dailyUsage: 1234,
        lastUsed: new Date(),
        isEnabled: true
    },
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        status: 'active',
        description: 'Fast and affordable for simple tasks',
        contextLength: 16385,
        pricing: { input: 0.5, output: 1.5, currency: 'USD' },
        capabilities: ['text', 'code'],
        dailyLimit: 10000,
        dailyUsage: 5678,
        lastUsed: new Date(),
        isEnabled: true
    },
    {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        status: 'active',
        description: 'Google\'s multimodal AI model',
        contextLength: 32768,
        pricing: { input: 0, output: 0, currency: 'USD' },
        capabilities: ['text', 'code', 'vision', 'multimodal'],
        dailyLimit: 2000,
        dailyUsage: 345,
        lastUsed: new Date(),
        isEnabled: true
    },
    {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        status: 'maintenance',
        description: 'Anthropic\'s most capable model',
        contextLength: 200000,
        pricing: { input: 15, output: 75, currency: 'USD' },
        capabilities: ['text', 'code', 'reasoning', 'long-context'],
        dailyLimit: 500,
        dailyUsage: 0,
        isEnabled: false
    },
    {
        id: 'local-llama',
        name: 'Llama 2 (Local)',
        provider: 'local',
        status: 'active',
        description: 'Local deployment of Llama 2 70B',
        contextLength: 4096,
        pricing: { input: 0, output: 0, currency: 'USD' },
        capabilities: ['text', 'code'],
        dailyLimit: undefined,
        dailyUsage: 123,
        lastUsed: new Date(),
        isEnabled: true
    }
]

const INITIAL_PROVIDERS: AIProviderConfig[] = [
    { id: 'openai', name: 'OpenAI', type: 'openai', isEnabled: true, models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'google', name: 'Google AI', type: 'google', isEnabled: true, models: ['gemini-pro', 'gemini-ultra'] },
    { id: 'anthropic', name: 'Anthropic', type: 'anthropic', isEnabled: false, models: ['claude-3-opus', 'claude-3-sonnet'] },
    { id: 'local', name: 'Local Models', type: 'local', isEnabled: true, models: ['local-llama', 'local-mistral'] },
]

const MOCK_ANALYTICS: UsageAnalytics = {
    totalRequests: 156789,
    totalTokens: 456789012,
    totalCost: 1234.56,
    requestsByModel: {
        'gpt-4': 45678,
        'gpt-4-turbo': 56789,
        'gpt-3.5-turbo': 34567,
        'gemini-pro': 12345,
        'local-llama': 7410
    },
    tokensByModel: {
        'gpt-4': 123456789,
        'gpt-4-turbo': 98765432,
        'gpt-3.5-turbo': 76543210,
        'gemini-pro': 87654321,
        'local-llama': 90123460
    },
    costByModel: {
        'gpt-4': 567.89,
        'gpt-4-turbo': 345.67,
        'gpt-3.5-turbo': 123.45,
        'gemini-pro': 0,
        'local-llama': 0
    },
    dailyUsage: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 5000) + 1000,
        tokens: Math.floor(Math.random() * 15000000) + 5000000,
        cost: Math.floor(Math.random() * 50) + 10
    }))
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status badge variant
 */
function getStatusBadge(status: ModelStatus): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold' {
    const variants = {
        active: 'success',
        inactive: 'secondary',
        error: 'danger',
        maintenance: 'warning'
    }
    return variants[status] as 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold'
}

/**
 * Get status icon
 */
function getStatusIcon(status: ModelStatus) {
    switch (status) {
        case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'inactive': return <XCircle className="w-4 h-4 text-gray-400" />
        case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
        case 'maintenance': return <Settings className="w-4 h-4 text-yellow-500" />
    }
}

/**
 * Format currency
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount)
}

/**
 * Format number with K/M suffix
 */
function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AI Model Management Page
 */
export default function AIModelManagementPage() {
    // State
    const [models, setModels] = useState<AIModel[]>(INITIAL_MODELS)
    const [providers, setProviders] = useState<AIProviderConfig[]>(INITIAL_PROVIDERS)
    const [analytics] = useState<UsageAnalytics>(MOCK_ANALYTICS)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showConfigModal, setShowConfigModal] = useState(false)
    const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('models')

    /**
     * Toggle model enabled/disabled
     */
    const toggleModel = (modelId: string) => {
        setModels(prev => prev.map(m => 
            m.id === modelId ? { ...m, isEnabled: !m.isEnabled } : m
        ))
    }

    /**
     * Delete model
     */
    const deleteModel = (modelId: string) => {
        if (confirm('Are you sure you want to delete this model?')) {
            setModels(prev => prev.filter(m => m.id !== modelId))
        }
    }

    /**
     * Test model connection
     */
    const testModel = async (modelId: string) => {
        setIsLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setModels(prev => prev.map(m => 
            m.id === modelId ? { ...m, status: 'active' as ModelStatus } : m
        ))
        
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        AI Model Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Configure and monitor AI models, providers, and usage
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddModal(true)}
                    >
                        Add Model
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(analytics.totalRequests)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Brain className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Tokens</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(analytics.totalTokens)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Cost</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(analytics.totalCost)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Models</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {models.filter(m => m.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="models" onValueChange={setActiveTab}>
                <TabList>
                    <Tab value="models">Models</Tab>
                    <Tab value="providers">Providers</Tab>
                    <Tab value="analytics">Analytics</Tab>
                </TabList>

                <TabPanels>
                    {/* Models Tab */}
                    <TabPanel value="models">
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-gray-600">Model</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Provider</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Status</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Context</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Daily Usage</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Pricing</th>
                                            <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {models.map((model) => (
                                            <tr key={model.id} className={cn(!model.isEnabled && 'opacity-50')}>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{model.name}</p>
                                                        <p className="text-sm text-gray-500">{model.description}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="secondary">{model.provider}</Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(model.status)}
                                                        <Badge variant={getStatusBadge(model.status)}>
                                                            {model.status}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {formatNumber(model.contextLength)} tokens
                                                </td>
                                                <td className="p-4">
                                                    <div className="w-32">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">{model.dailyUsage || 0}</span>
                                                            <span className="text-gray-400">/ {model.dailyLimit || '∞'}</span>
                                                        </div>
                                                        {model.dailyLimit && (
                                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-indigo-500"
                                                                    style={{ width: `${((model.dailyUsage || 0) / model.dailyLimit) * 100}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {model.pricing.input === 0 && model.pricing.output === 0 ? (
                                                        <span className="text-green-600">Free</span>
                                                    ) : (
                                                        <span>${model.pricing.input}/M in</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => toggleModel(model.id)}
                                                            className="p-2 hover:bg-gray-100 rounded"
                                                            title={model.isEnabled ? 'Disable' : 'Enable'}
                                                        >
                                                            {model.isEnabled ? (
                                                                <EyeOff className="w-4 h-4 text-gray-500" />
                                                            ) : (
                                                                <Eye className="w-4 h-4 text-indigo-500" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => testModel(model.id)}
                                                            className="p-2 hover:bg-gray-100 rounded"
                                                            title="Test connection"
                                                            disabled={isLoading}
                                                        >
                                                            <RefreshCw className={cn('w-4 h-4 text-gray-500', isLoading && 'animate-spin')} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteModel(model.id)}
                                                            className="p-2 hover:bg-gray-100 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    {/* Providers Tab */}
                    <TabPanel value="providers">
                        <div className="grid grid-cols-2 gap-6">
                            {providers.map((provider) => (
                                <Card key={provider.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Cloud className="w-5 h-5" />
                                            {provider.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Status</span>
                                                <Badge variant={provider.isEnabled ? 'success' : 'secondary'}>
                                                    {provider.isEnabled ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Type</span>
                                                <span className="font-medium">{provider.type}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Models</span>
                                                <span className="font-medium">{provider.models.length}</span>
                                            </div>
                                            <div className="pt-4 border-t">
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    leftIcon={<Key className="w-4 h-4" />}
                                                    onClick={() => setShowConfigModal(true)}
                                                >
                                                    Configure API Key
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabPanel>

                    {/* Analytics Tab */}
                    <TabPanel value="analytics">
                        <div className="space-y-6">
                            {/* Usage by Model */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage by Model</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(analytics.requestsByModel).map(([modelId, requests]) => (
                                            <div key={modelId} className="flex items-center gap-4">
                                                <span className="w-32 font-medium">{modelId}</span>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-indigo-500"
                                                            style={{ width: `${(requests / analytics.totalRequests) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="w-20 text-right text-gray-600">
                                                    {formatNumber(requests)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Daily Usage Chart (simplified) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Daily Usage (Last 30 Days)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-48 flex items-end gap-1">
                                        {analytics.dailyUsage.slice(-14).map((day, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div 
                                                    className="w-full bg-indigo-500 rounded-t"
                                                    style={{ height: `${(day.requests / 5000) * 100}%` }}
                                                />
                                                <span className="text-xs text-gray-500">
                                                    {day.date.slice(5)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}