/**
 * SunnyGPT - Message Deletion API Route
 * 
 * Author: Shamiur Rashid Sunny
 * Website: https://shamiur.com
 * 
 * API endpoint for deleting individual messages from a chat conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/messages/[messageId]
 * Deletes a specific message from the database
 * 
 * @param req - Request object
 * @param params - Route parameters containing messageId
 * @returns Success response or error
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ messageId: string }> }
) {
    try {
        // Extract messageId from route parameters
        const { messageId } = await params

        // Validate messageId is provided
        if (!messageId) {
            return NextResponse.json(
                { error: 'Message ID is required' },
                { status: 400 }
            )
        }

        // Delete message from database
        await prisma.message.delete({
            where: { id: messageId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting message:', error)
        return NextResponse.json(
            { error: 'Failed to delete message' },
            { status: 500 }
        )
    }
}
