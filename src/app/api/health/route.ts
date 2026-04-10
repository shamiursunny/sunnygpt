// Health check endpoint - SunnyGPT Prime Edition
// Built by Shamiur Rashid Sunny (shamiur.com)
// Checks all services: AI, Database, GitHub, Memory

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAIAccounts, getNeonAccounts, getGitHubAccounts } from '@/lib/config/resource-registry'
import { getSystemHealth } from '@/lib/monitoring/logger'
import { getMemoryStats } from '@/lib/memory-manager'

export async function GET() {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`

        // Get resource counts
        const [openrouterAccounts, geminiAccounts, neonAccounts, githubAccounts, systemHealth, memoryStats] = await Promise.all([
            getAIAccounts('openrouter'),
            getAIAccounts('gemini'),
            getNeonAccounts(),
            getGitHubAccounts(),
            getSystemHealth(),
            getMemoryStats()
        ])

        const resources = {
            ai: {
                openrouter: openrouterAccounts.length,
                gemini: geminiAccounts.length
            },
            database: {
                neon: neonAccounts.length
            },
            storage: {
                github: githubAccounts.length
            }
        }

        return NextResponse.json({
            status: systemHealth.overallStatus || 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'up',
                api: 'up'
            },
            resources,
            memory: memoryStats,
            health: systemHealth
        })
    } catch (error) {
        console.error('Health check failed:', error)
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'down',
                api: 'up'
            },
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 503 })
    }
}
