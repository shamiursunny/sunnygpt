/**
 * =============================================================================
 * Chats API - handles all the chat management stuff
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition - SaaS Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * GET to list chats, POST to create, DELETE to remove, PATCH to update
 * Updated with user authentication and multi-tenant isolation
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserContext, buildOwnershipFilter } from '@/lib/auth-helpers'

// Create new chat
export async function POST(req: NextRequest) {
    try {
        // AUTH CHECK
        const userContext = await getUserContext()
        if (!userContext) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { title } = await req.json()
        const { userId, organizationId } = userContext

        const chat = await prisma.chat.create({
            data: {
                title: title || 'New Chat',
                userId: userId,
                organizationId: organizationId || null,
            },
        })

        return NextResponse.json(chat)
    } catch (error) {
        console.error('Error creating chat:', error)
        return NextResponse.json(
            { error: 'Failed to create chat' },
            { status: 500 }
        )
    }
}

// Get all chats - shows them newest first (filtered by user/org)
export async function GET() {
    try {
        // AUTH CHECK
        const userContext = await getUserContext()
        if (!userContext) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const ownershipFilter = buildOwnershipFilter(userContext)

        const chats = await prisma.chat.findMany({
            where: ownershipFilter,
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
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

// Delete a chat - with ownership check
export async function DELETE(req: NextRequest) {
    try {
        // AUTH CHECK
        const userContext = await getUserContext()
        if (!userContext) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const chatId = searchParams.get('chatId')

        if (!chatId) {
            return NextResponse.json(
                { error: 'Chat ID is required' },
                { status: 400 }
            )
        }

        // Verify ownership before delete
        const ownershipFilter = buildOwnershipFilter(userContext)
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                ...ownershipFilter
            }
        })

        if (!chat) {
            return NextResponse.json(
                { error: 'Chat not found or access denied' },
                { status: 403 }
            )
        }

        // Delete (Prisma cascade handles messages)
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

// Update chat title - with ownership check
export async function PATCH(req: NextRequest) {
    try {
        // AUTH CHECK
        const userContext = await getUserContext()
        if (!userContext) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { chatId, title } = await req.json()

        if (!chatId || !title) {
            return NextResponse.json(
                { error: 'Chat ID and title are required' },
                { status: 400 }
            )
        }

        // Verify ownership before update
        const ownershipFilter = buildOwnershipFilter(userContext)
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                ...ownershipFilter
            }
        })

        if (!chat) {
            return NextResponse.json(
                { error: 'Chat not found or access denied' },
                { status: 403 }
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