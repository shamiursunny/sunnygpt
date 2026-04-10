// Cron: Cleanup - Clear expired Neon memories
// SunnyGPT Prime Edition
// Runs daily to clear memories older than 7 days

import { NextResponse } from 'next/server'
import { clearExpiredMemories } from '@/lib/memory-manager'
import { clearOldLogs } from '@/lib/monitoring/logger'

// Run cleanup (also callable via GET for health checks)
export async function POST() {
    try {
        console.log('[Cron] Starting cleanup...')

        // Clear expired memories (Tier 1)
        const deletedMemories = await clearExpiredMemories()

        // Clear old logs (older than 30 days)
        const deletedLogs = await clearOldLogs(30)

        return NextResponse.json({
            success: true,
            message: 'Cleanup completed',
            deletedMemories,
            deletedLogs,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('[Cron] Cleanup failed:', error)
        return NextResponse.json(
            { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}

// Also allow GET for simple triggering
export async function GET() {
    return POST()
}