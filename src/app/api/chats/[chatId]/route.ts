/**
 * Chat Messages API Route
 * 
 * This API endpoint retrieves all messages for a specific chat conversation.
 * Messages are returned in chronological order (oldest first).
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/chats/[chatId]
 * 
 * Retrieves all messages for a specific chat in chronological order.
 * 
 * @param req - Request object
 * @param params - Route parameters containing chatId
 * @returns JSON array of message objects
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        // Extract chatId from route parameters
        const { chatId } = await params

        // Fetch all messages for this chat, ordered chronologically
        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' }, // Oldest messages first
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
