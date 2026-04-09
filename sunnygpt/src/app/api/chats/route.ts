// Chats API - handles all the chat management stuff
// Built by Shamiur Rashid Sunny (shamiur.com)
// GET to list chats, DELETE to remove them, PATCH to update titles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all chats - shows them newest first
export async function GET() {
    try {
        const chats = await prisma.chat.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                messages: {
                    take: 1,  // Just grab the latest message for preview
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

// Delete a chat - this also deletes all messages thanks to cascade delete in Prisma
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const chatId = searchParams.get('chatId')

        if (!chatId) {
            return NextResponse.json(
                { error: 'Chat ID is required' },
                { status: 400 }
            )
        }

        // Prisma handles deleting all the messages automatically
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

// Update chat title - for when users want to rename their conversations
export async function PATCH(req: NextRequest) {
    try {
        const { chatId, title } = await req.json()

        if (!chatId || !title) {
            return NextResponse.json(
                { error: 'Chat ID and title are required' },
                { status: 400 }
            )
        }

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
