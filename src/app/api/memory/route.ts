// Memory API - SunnyGPT Prime Edition
// Built by Shamiur Rashid Sunny (shamiur.com)
// Tier 1 memory operations

import { NextRequest, NextResponse } from 'next/server'
import { storeMemory, getSessionMemories, getMemorySummary, getMemoryStats } from '@/lib/memory-manager'
import { getSettings } from '@/lib/config/resource-registry'

// Store memory
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { sessionId, content, memoryType, priority, metadata } = body

        if (!sessionId || !content || !memoryType) {
            return NextResponse.json(
                { error: 'sessionId, content, and memoryType are required' },
                { status: 400 }
            )
        }

        const memoryId = await storeMemory({
            sessionId,
            content,
            memoryType,
            priority,
            metadata
        })

        return NextResponse.json({
            success: true,
            memoryId
        })
    } catch (error) {
        console.error('Failed to store memory:', error)
        return NextResponse.json(
            { error: 'Failed to store memory' },
            { status: 500 }
        )
    }
}

// Get memories for session
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get('sessionId')
        const summary = searchParams.get('summary') === 'true'
        const stats = searchParams.get('stats') === 'true'

        // Return stats without requiring sessionId
        if (stats) {
            const memoryStats = await getMemoryStats()
            return NextResponse.json(memoryStats)
        }

        // For session-specific requests, sessionId is required
        if (!sessionId) {
            return NextResponse.json(
                { error: 'sessionId is required for memory retrieval', hint: 'Use ?stats=true to get overall memory statistics' },
                { status: 400 }
            )
        }

        if (summary) {
            const summaryText = await getMemorySummary(sessionId)
            return NextResponse.json({ summary: summaryText })
        }

        const memories = await getSessionMemories(sessionId)
        return NextResponse.json({ memories })
    } catch (error) {
        console.error('Failed to get memories:', error)
        return NextResponse.json(
            { error: 'Failed to get memories' },
            { status: 500 }
        )
    }
}