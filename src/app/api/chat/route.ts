// Chat API - handles messages and gets AI responses
// Built by Shamiur Rashid Sunny (shamiur.com)
// This endpoint manages the whole conversation flow with the AI

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAIResponse } from '@/lib/ai-client'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

// Rate limit: 20 requests per minute per IP
const RATE_LIMIT_CONFIG = {
    maxRequests: 20,
    windowMs: 60 * 1000 // 1 minute
}

function sanitizeInput(input: string): string {
    // Remove any potentially harmful characters
    return input.trim().substring(0, 10000) // Max 10k characters
}

function getClientIP(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        'unknown'
}

export async function POST(req: NextRequest) {
    const startTime = Date.now()
    const clientIP = getClientIP(req)

    try {
        // Rate limiting
        const rateLimitResult = rateLimit(clientIP, RATE_LIMIT_CONFIG)

        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded', { ip: clientIP })
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: getRateLimitHeaders(rateLimitResult)
                }
            )
        }

        const body = await req.json()
        const { chatId, message, fileUrl } = body

        // Input validation
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required and must be a string' }, { status: 400 })
        }

        if (message.length > 10000) {
            return NextResponse.json({ error: 'Message too long (max 10,000 characters)' }, { status: 400 })
        }

        if (chatId && typeof chatId !== 'string') {
            return NextResponse.json({ error: 'Invalid chatId format' }, { status: 400 })
        }

        if (fileUrl && typeof fileUrl !== 'string') {
            return NextResponse.json({ error: 'Invalid fileUrl format' }, { status: 400 })
        }

        // Sanitize input
        const sanitizedMessage = sanitizeInput(message)

        let currentChatId = chatId

        // If this is a new conversation, create a chat for it
        if (!currentChatId) {
            const newChat = await prisma.chat.create({
                data: {
                    title: sanitizedMessage.substring(0, 50) + (sanitizedMessage.length > 50 ? '...' : ''),
                },
            })
            currentChatId = newChat.id
            logger.info('New chat created', { chatId: currentChatId })
        }

        // Store the user's message in the database
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'user',
                content: sanitizedMessage,
                fileUrl: fileUrl || null,
            },
        })

        // Grab the last 10 messages to give the AI some context
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

        // Get the AI response
        logger.debug('Requesting AI response', { chatId: currentChatId, messageCount: chatHistory.length })
        const aiMessage = await getAIResponse(chatHistory)

        // Save the AI's response
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'model',
                content: aiMessage,
            },
        })

        const duration = Date.now() - startTime
        logger.info('Chat request completed', { chatId: currentChatId, duration })

        // Send everything back to the client
        return NextResponse.json(
            {
                chatId: currentChatId,
                message: aiMessage,
            },
            {
                headers: getRateLimitHeaders(rateLimitResult)
            }
        )
    } catch (error) {
        const duration = Date.now() - startTime
        logger.error('Chat API error', error as Error, { ip: clientIP, duration })

        // Provide detailed error message
        const errorMessage = error instanceof Error
            ? error.message
            : 'An unexpected error occurred while processing your message'

        return NextResponse.json(
            {
                error: errorMessage,
                details: 'Please try again. If the problem persists, check your API configuration.'
            },
            { status: 500 }
        )
    }
}
