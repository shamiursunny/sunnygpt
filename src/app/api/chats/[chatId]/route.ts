// Get messages for a specific chat
// Built by Shamiur Rashid Sunny (shamiur.com)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params

        // Get all messages in chronological order (oldest first)
        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        )
    }
}
