/**
 * =============================================================================
 * AI Persona Creator - SunnyGPT Enterprise
 * =============================================================================
 * Create and manage custom AI personas with unique behaviors and characteristics
 * 
 * FEATURES:
 * - Persona creation wizard
 * - Behavior customization
 * - Response style settings
 * - Knowledge base configuration
 * - Preview and test
 * 
 * =============================================================================
 */

'use client'

import { useState } from 'react'
import { 
    Bot, 
    Sparkles, 
    MessageSquare, 
    Brain, 
    Settings, 
    Eye, 
    Save, 
    Copy, 
    Trash2,
    Play,
    Pause,
    Wand2,
    Palette,
    BookOpen,
    Zap,
    Heart,
    Target,
    Lightbulb
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type PersonaTone = 'professional' | 'friendly' | 'casual' | 'formal' | 'humorous' | 'empathetic'

export type PersonaComplexity = 'simple' | 'balanced' | 'detailed'

export interface PersonaBehavior {
    responseLength: 'short' | 'medium' | 'long'
    useEmoji: boolean
    useFormatting: boolean
    askClarifyingQuestions: boolean
    admitUncertainty: boolean
    showReasoning: boolean
}

export interface PersonaKnowledge {
    includeGeneral: boolean
    includeTechnical: boolean
    includeCreative: boolean
    customInstructions: string
}

export interface AIPersona {
    id: string
    name: string
    description: string
    avatar?: string
    tone: PersonaTone
    complexity: PersonaComplexity
    behavior: PersonaBehavior
    knowledge: PersonaKnowledge
    systemPrompt: string
    examplePhrases: string[]
    isDefault: boolean
    createdAt: Date
    usageCount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DEFAULT_PERSONAS: AIPersona[] = [
    {
        id: 'default',
        name: 'Sunny Assistant',
        description: 'Your helpful AI assistant',
        avatar: undefined,
        tone: 'friendly',
        complexity: 'balanced',
        behavior: {
            responseLength: 'medium',
            useEmoji: true,
            useFormatting: true,
            askClarifyingQuestions: true,
            admitUncertainty: true,
            showReasoning: false
        },
        knowledge: {
            includeGeneral: true,
            includeTechnical: true,
            includeCreative: true,
            customInstructions: ''
        },
        systemPrompt: 'You are a helpful, friendly AI assistant.',
        examplePhrases: ['How can I help you?', 'Let me explain...', 'Great question!'],
        isDefault: true,
        createdAt: new Date(),
        usageCount: 1234
    },
    {
        id: 'developer',
        name: 'Code Expert',
        description: 'Specialized in programming and technical help',
        avatar: undefined,
        tone: 'professional',
        complexity: 'detailed',
        behavior: {
            responseLength: 'long',
            useEmoji: false,
            useFormatting: true,
            askClarifyingQuestions: true,
            admitUncertainty: false,
            showReasoning: true
        },
        knowledge: {
            includeGeneral: false,
            includeTechnical: true,
            includeCreative: false,
            customInstructions: 'Focus on code quality, best practices, and efficiency.'
        },
        systemPrompt: 'You are an expert programmer with deep knowledge of multiple languages and frameworks.',
        examplePhrases: ['Here\'s a solution...', 'Consider this approach...', 'The best practice is...'],
        isDefault: false,
        createdAt: new Date('2024-02-01'),
        usageCount: 567
    },
    {
        id: 'creative',
        name: 'Creative Writer',
        description: 'Helps with creative writing and brainstorming',
        avatar: undefined,
        tone: 'humorous',
        complexity: 'balanced',
        behavior: {
            responseLength: 'medium',
            useEmoji: true,
            useFormatting: true,
            askClarifyingQuestions: false,
            admitUncertainty: true,
            showReasoning: false
        },
        knowledge: {
            includeGeneral: true,
            includeTechnical: false,
            includeCreative: true,
            customInstructions: 'Focus on creativity, storytelling, and engaging content.'
        },
        systemPrompt: 'You are a creative writer who loves to help with stories, poems, and imaginative content.',
        examplePhrases: ['What a great idea!', 'Let\'s make this even better...', 'I have some creative ideas...'],
        isDefault: false,
        createdAt: new Date('2024-03-15'),
        usageCount: 234
    }
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function AIPersonaCreatorPage() {
    const [personas] = useState<AIPersona[]>(DEFAULT_PERSONAS)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showPreviewModal, setShowPreviewModal] = useState(false)
    const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null)
    const [previewMessage, setPreviewMessage] = useState('')

    /**
     * Get tone badge variant
     */
    function getToneBadge(tone: PersonaTone): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold' {
        const variants: Record<PersonaTone, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold'> = {
            professional: 'primary',
            friendly: 'success',
            casual: 'warning',
            formal: 'secondary',
            humorous: 'warning',
            empathetic: 'danger'
        }
        return variants[tone]
    }

    /**
     * Get tone icon
     */
    function getToneIcon(tone: PersonaTone) {
        switch (tone) {
            case 'professional': return <Target className="w-4 h-4" />
            case 'friendly': return <Heart className="w-4 h-4" />
            case 'casual': return <Zap className="w-4 h-4" />
            case 'formal': return <Settings className="w-4 h-4" />
            case 'humorous': return <Sparkles className="w-4 h-4" />
            case 'empathetic': return <Heart className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bot className="w-8 h-8 text-indigo-600" />
                        AI Persona Creator
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Create custom AI personas with unique behaviors and characteristics
                    </p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Wand2 className="w-4 h-4" />}
                    onClick={() => setShowCreateModal(true)}
                >
                    Create Persona
                </Button>
            </div>

            {/* Quick Start Templates */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Start Templates</h2>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { name: 'Customer Support', icon: '🎧', description: 'Help desk assistant' },
                        { name: 'Code Mentor', icon: '💻', description: 'Programming teacher' },
                        { name: 'Creative Writer', icon: '✍️', description: 'Content creator' },
                        { name: 'Business Analyst', icon: '📊', description: 'Data expert' },
                    ].map((template) => (
                        <button
                            key={template.name}
                            onClick={() => setShowCreateModal(true)}
                            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all text-left"
                        >
                            <span className="text-2xl mb-2 block">{template.icon}</span>
                            <p className="font-medium text-gray-900">{template.name}</p>
                            <p className="text-sm text-gray-500">{template.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* My Personas */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">My Personas</h2>
                <div className="grid grid-cols-3 gap-6">
                    {personas.map((persona) => (
                        <Card 
                            key={persona.id} 
                            className={cn(persona.isDefault && 'border-indigo-500 border-2')}
                        >
                            <CardContent className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <Bot className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                                            <p className="text-sm text-gray-500">{persona.description}</p>
                                        </div>
                                    </div>
                                    {persona.isDefault && (
                                        <Badge variant="success">Default</Badge>
                                    )}
                                </div>

                                {/* Tone & Complexity */}
                                <div className="flex gap-2 mb-4">
                                    <Badge variant={getToneBadge(persona.tone)}>
                                        {getToneIcon(persona.tone)}
                                        <span className="ml-1 capitalize">{persona.tone}</span>
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                        {persona.complexity}
                                    </Badge>
                                </div>

                                {/* Behavior Summary */}
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Response: {persona.behavior.responseLength}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {persona.behavior.useEmoji ? <Sparkles className="w-4 h-4 text-green-500" /> : <Sparkles className="w-4 h-4 text-gray-300" />}
                                        <span>Emoji: {persona.behavior.useEmoji ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {persona.behavior.showReasoning ? <Brain className="w-4 h-4 text-blue-500" /> : <Brain className="w-4 h-4 text-gray-300" />}
                                        <span>Show reasoning: {persona.behavior.showReasoning ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Used {persona.usageCount} times
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<Eye className="w-4 h-4" />}
                                            onClick={() => {
                                                setSelectedPersona(persona)
                                                setShowPreviewModal(true)
                                            }}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<Settings className="w-4 h-4" />}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Create New Card */}
                    <Card className="border-dashed border-2 border-gray-300 hover:border-indigo-500 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px]" onClick={() => setShowCreateModal(true)}>
                        <Bot className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-600 font-medium">Create New Persona</p>
                        <p className="text-sm text-gray-400">Design your own AI character</p>
                    </Card>
                </div>
            </div>

            {/* Features Section */}
            <div className="mt-12 grid grid-cols-4 gap-6">
                {[
                    { icon: Palette, title: 'Custom Tone', description: 'Set the personality and communication style' },
                    { icon: Brain, title: 'Behavior Control', description: 'Configure response patterns and reasoning' },
                    { icon: BookOpen, title: 'Knowledge Base', description: 'Define what the AI knows and can use' },
                    { icon: Lightbulb, title: 'Test & Refine', description: 'Preview and adjust before using' },
                ].map((feature, i) => (
                    <div key={i} className="text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <feature.icon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}