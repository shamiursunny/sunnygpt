/**
 * Chat API Route - Handles AI chat interactions
 * 
 * This API endpoint processes user messages, manages chat sessions, and generates
 * AI responses using the OpenRouter API (Meta Llama model). It maintains conversation
 * history in the database and supports file attachments.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai, DEFAULT_MODEL } from '@/lib/openrouter'

/**
 * POST /api/chat
 * 
 * Processes a chat message and returns an AI-generated response.
 * Creates a new chat session if chatId is not provided.
 * 
 * @param req - Request body containing: { chatId?, message, fileUrl? }
 * @returns JSON response with chatId and AI message
 */
export async function POST(req: NextRequest) {
    try {
        // Parse the incoming request body
        const { chatId, message, fileUrl } = await req.json()

        // Validate that a message was provided
        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        let currentChatId = chatId

        // Create a new chat session if chatId is not provided
        // The chat title is derived from the first 50 characters of the message
        if (!currentChatId) {
            const newChat = await prisma.chat.create({
                data: {
                    title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                },
            })
            currentChatId = newChat.id
        }

        // Save the user's message to the database
        // Include file URL if a file was uploaded with the message
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'user',
                content: message,
                fileUrl: fileUrl || null,
            },
        })

        // Retrieve the last 10 messages from this chat for context
        // This provides conversation history to the AI model
        const messages = await prisma.message.findMany({
            where: { chatId: currentChatId },
            orderBy: { createdAt: 'asc' },
            take: 10, // Last 10 messages for context
        })

        // Convert database messages to OpenAI-compatible format
        // Map 'user' and 'model' roles to 'user' and 'assistant'
        const chatHistory = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content,
        }))

        // Generate AI response using OpenRouter API (Meta Llama 3.2 3B model)
        // This is a free model that provides fast responses
        const completion = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: chatHistory,
        })

        // Extract the AI's response from the completion
        const aiMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        // Save the AI's response to the database
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'model',
                content: aiMessage,
            },
        })

        // Return the chat ID and AI message to the client
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
