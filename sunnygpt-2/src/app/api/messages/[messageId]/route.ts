// Delete individual messages
// Built by Shamiur Rashid Sunny (shamiur.com)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ messageId: string }> }
) {
    try {
        const { messageId } = await params

        if (!messageId) {
            return NextResponse.json(
                { error: 'Message ID is required' },
                { status: 400 }
            )
        }

        // Remove the message
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
