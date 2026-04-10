// Messages API - Get messages for a chat
// Built by Shamiur Rashid Sunny (shamiur.com)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get messages for a chat
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const chatId = searchParams.get('chatId')

        if (!chatId) {
            return NextResponse.json(
                { error: 'chatId is required' },
                { status: 400 }
            )
        }

        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            take: 100
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