// Season API - SunnyGPT Prime Edition
// Built by Shamiur Rashid Sunny (shamiur.com)
// Tier 2 seasonal storage operations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { archiveSeasonToGitHub, getActiveSeasons, getMemoryStats } from '@/lib/memory-manager'

// Create new season
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { title, description, owner } = body

        if (!title) {
            return NextResponse.json(
                { error: 'title is required' },
                { status: 400 }
            )
        }

        const season = await prisma.season.create({
            data: {
                title,
                description,
                owner,
                status: 'active'
            }
        })

        return NextResponse.json({
            success: true,
            season
        })
    } catch (error) {
        console.error('Failed to create season:', error)
        return NextResponse.json(
            { error: 'Failed to create season' },
            { status: 500 }
        )
    }
}

// Get seasons
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') // 'active' | 'archived' | 'archived_to_github'
        const active = searchParams.get('active') === 'true'

        if (active) {
            const seasons = await getActiveSeasons()
            return NextResponse.json({ seasons })
        }

        const where: any = {}
        if (status) {
            where.status = status
        }

        const seasons = await prisma.season.findMany({
            where,
            orderBy: { startedAt: 'desc' },
            take: 50
        })

        return NextResponse.json({ seasons })
    } catch (error) {
        console.error('Failed to get seasons:', error)
        return NextResponse.json(
            { error: 'Failed to get seasons' },
            { status: 500 }
        )
    }
}