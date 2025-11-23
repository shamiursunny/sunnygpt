import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai, DEFAULT_MODEL } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
    try {
        const { chatId, message, fileUrl } = await req.json()

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        let currentChatId = chatId

        // Create new chat if chatId is not provided
        if (!currentChatId) {
            const newChat = await prisma.chat.create({
                data: {
                    title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                },
            })
            currentChatId = newChat.id
        }

        // Save user message
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'user',
                content: message,
                fileUrl: fileUrl || null,
            },
        })

        // Get chat history for context
        const messages = await prisma.message.findMany({
            where: { chatId: currentChatId },
            orderBy: { createdAt: 'asc' },
            take: 10, // Last 10 messages for context
        })

        // Build conversation history for OpenRouter (OpenAI format)
        const chatHistory = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
        }))

        // Generate response from OpenRouter
        const completion = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: chatHistory,
        })

        const aiMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        // Save AI response
        await prisma.message.create({
            data: {
                chatId: currentChatId,
                role: 'model',
                content: aiMessage,
            },
        })

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
