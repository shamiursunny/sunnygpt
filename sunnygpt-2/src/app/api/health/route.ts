// Health check endpoint
// Built by Shamiur Rashid Sunny (shamiur.com)

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAIProviderStatus } from '@/lib/ai-client'

export async function GET() {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`
        const aiProviders = await getAIProviderStatus()

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'up',
                api: 'up',
                gemini: aiProviders.gemini.healthy ? 'up' : 'degraded',
                openrouter: aiProviders.openrouter.healthy ? 'up' : 'degraded'
            },
            aiProviders
        })
    } catch (error) {
        console.error('Health check failed:', error)
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'down',
                api: 'up'
            }
        }, { status: 503 })
    }
}
