// Season Dynamic API - SunnyGPT Prime Edition
// Built by Shamiur Rashid Sunny (shamiur.com)
// Archive season to GitHub

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { archiveSeasonToGitHub } from '@/lib/memory-manager'

// Archive season to GitHub
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ seasonId: string }> }
) {
    try {
        const { seasonId } = await params

        if (!seasonId) {
            return NextResponse.json(
                { error: 'seasonId is required' },
                { status: 400 }
            )
        }

        // Get season
        const season = await prisma.season.findUnique({
            where: { id: seasonId }
        })

        if (!season) {
            return NextResponse.json(
                { error: 'Season not found' },
                { status: 404 }
            )
        }

        // Archive to GitHub
        const issueUrl = await archiveSeasonToGitHub(seasonId)

        if (issueUrl) {
            return NextResponse.json({
                success: true,
                archived: true,
                issueUrl
            })
        } else {
            return NextResponse.json({
                success: false,
                archived: false,
                error: 'Failed to archive to GitHub'
            }, { status: 500 })
        }
    } catch (error) {
        console.error('Failed to archive season:', error)
        return NextResponse.json(
            { error: 'Failed to archive season' },
            { status: 500 }
        )
    }
}

// Get single season
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ seasonId: string }> }
) {
    try {
        const { seasonId } = await params

        const season = await prisma.season.findUnique({
            where: { id: seasonId }
        })

        if (!season) {
            return NextResponse.json(
                { error: 'Season not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ season })
    } catch (error) {
        console.error('Failed to get season:', error)
        return NextResponse.json(
            { error: 'Failed to get season' },
            { status: 500 }
        )
    }
}