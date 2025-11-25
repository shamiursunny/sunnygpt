// AI Client - The brain of the operation
// Built by Shamiur Rashid Sunny (shamiur.com)
// This handles the smart logic: try Gemini first, if it trips, catch it with OpenRouter.

import { model } from './gemini'
import { openai, DEFAULT_MODEL } from './openrouter'

export interface ChatMessage {
    role: 'user' | 'assistant' | 'model'
    content: string
}

/**
 * Gets a response from the AI, trying Gemini first and falling back to OpenRouter.
 * @param messages The chat history including the current message
 * @returns The AI's response text
 */
export async function getAIResponse(messages: ChatMessage[]): Promise<string> {
    try {
        console.log('Attempting to generate response with Gemini...')
        return await getGeminiResponse(messages)
    } catch (geminiError) {
        console.warn('Gemini API failed, switching to OpenRouter fallback...', geminiError)
        try {
            return await getOpenRouterResponse(messages)
        } catch (openRouterError) {
            console.error('All AI providers failed:', openRouterError)
            throw new Error('Failed to generate response from any AI provider')
        }
    }
}

async function getGeminiResponse(messages: ChatMessage[]): Promise<string> {
    // Separate history from the latest message
    const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }))

    const lastMessage = messages[messages.length - 1]

    // Start chat with history
    const chat = model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 2048,
        },
    })

    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    return response.text()
}

async function getOpenRouterResponse(messages: ChatMessage[]): Promise<string> {
    // Format messages for OpenAI/OpenRouter
    const formattedMessages = messages.map(msg => ({
        role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant' | 'system',
        content: msg.content
    }))

    const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: formattedMessages,
    })

    return completion.choices[0]?.message?.content || ''
}
