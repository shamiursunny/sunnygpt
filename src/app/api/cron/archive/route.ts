// Cron: Archive - Archive seasons to GitHub
// SunnyGPT Prime Edition
// Runs monthly to archive seasons to GitHub

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { archiveSeasonToGitHub } from '@/lib/memory-manager'

// Run monthly archive
export async function POST() {
    try {
        console.log('[Cron] Starting monthly archive...')

        // Get all active seasons older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        
        const seasonsToArchive = await prisma.season.findMany({
            where: {
                status: 'active',
                startedAt: { lt: thirtyDaysAgo }
            }
        })

        const results = []

        for (const season of seasonsToArchive) {
            console.log(`[Cron] Archiving season: ${season.title}`)
            
            const issueUrl = await archiveSeasonToGitHub(season.id)
            
            results.push({
                seasonId: season.id,
                title: season.title,
                archived: !!issueUrl,
                issueUrl
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Monthly archive completed',
            archivedSeasons: results.length,
            results,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('[Cron] Archive failed:', error)
        return NextResponse.json(
            { error: 'Archive failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}

// Also allow GET for manual triggering
export async function GET() {
    return POST()
}