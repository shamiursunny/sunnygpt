// Chat API - handles messages and gets AI responses
// Built by Shamiur Rashid Sunny (shamiur.com)
// This endpoint manages the whole conversation flow with the AI

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAIResponse } from '@/lib/ai-client'

export async function POST(req: NextRequest) {
    try {
        const { chatId, message, fileUrl } = await req.json()

        // Make sure we actually got a message
        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        let currentChatId = chatId

        // If this is a new conversation, create a chat for it
        // I'm using the first part of the message as the title
        if (!currentChatId) {
            const newChat = await prisma.chat.create({
                data: {
                    title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                },
            })
            currentChatId = newChat.id
        }

        // Store the user's message in the database
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'user',
                content: message,
                fileUrl: fileUrl || null,
            },
        })

        // Grab the last 10 messages to give the AI some context
        // Keeping it at 10 to avoid token limits
        const messages = await prisma.message.findMany({
            where: { chatId: currentChatId },
            orderBy: { createdAt: 'asc' },
            take: 10,
        })

        // Format the messages for the AI client
        const chatHistory = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role as 'user' | 'assistant' | 'model',
            content: msg.content,
        }))

        // Get the AI response using our robust client
        // This will automatically try Gemini first, then fallback to OpenRouter if needed
        const aiMessage = await getAIResponse(chatHistory)

        // Save the AI's response
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'model',
                content: aiMessage,
            },
        })

        // Send everything back to the client
        return NextResponse.json({
            chatId: currentChatId,
            message: aiMessage,
        })
    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
