/**
 * Chats API Route - Manages Chat Conversations
 * 
 * This API endpoint provides CRUD operations for chat conversations:
 * - GET: Retrieve all chats with their latest message
 * - DELETE: Delete a specific chat and all its messages (cascade)
 * - PATCH: Update a chat's title
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/chats
 * Retrieves all chat conversations ordered by creation date (newest first)
 * Includes the most recent message for each chat
 * 
 * @returns Array of chat objects with their latest message
 */
export async function GET() {
    try {
        // Fetch all chats from database
        const chats = await prisma.chat.findMany({
            orderBy: { createdAt: 'desc' },  // Newest chats first
            include: {
                messages: {
                    take: 1,                      // Only include the latest message
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        return NextResponse.json(chats)
    } catch (error) {
        console.error('Error fetching chats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chats' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/chats?chatId={id}
 * Deletes a specific chat and all associated messages
 * Uses cascade delete configured in Prisma schema
 * 
 * @param req - Request object containing chatId in query params
 * @returns Success response or error
 */
export async function DELETE(req: NextRequest) {
    try {
        // Extract chatId from query parameters
        const { searchParams } = new URL(req.url)
        const chatId = searchParams.get('chatId')

        // Validate chatId is provided
        if (!chatId) {
            return NextResponse.json(
                { error: 'Chat ID is required' },
                { status: 400 }
            )
        }

        // Delete chat from database
        // Note: All associated messages are automatically deleted due to cascade delete
        await prisma.chat.delete({
            where: { id: chatId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting chat:', error)
        return NextResponse.json(
            { error: 'Failed to delete chat' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/chats
 * Updates a chat's title
 * 
 * @param req - Request object containing chatId and new title in body
 * @returns Updated chat object or error
 */
export async function PATCH(req: NextRequest) {
    try {
        // Parse request body
        const { chatId, title } = await req.json()

        // Validate required fields
        if (!chatId || !title) {
            return NextResponse.json(
                { error: 'Chat ID and title are required' },
                { status: 400 }
            )
        }

        // Update chat title in database
        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: { title },
        })

        return NextResponse.json(updatedChat)
    } catch (error) {
        console.error('Error updating chat:', error)
        return NextResponse.json(
            { error: 'Failed to update chat' },
            { status: 500 }
        )
    }
}
