// AI Client - The brain of the operation
// Built by Shamiur Rashid Sunny (shamiur.com)
// This handles the smart logic: try Gemini first, if it trips, catch it with OpenRouter.
// Now with health checks to automatically route to the active API!

import { model } from './gemini'
import { openai, DEFAULT_MODEL } from './openrouter'

export interface ChatMessage {
    role: 'user' | 'assistant' | 'model'
    content: string
}

// Health status tracking
interface APIHealth {
    healthy: boolean
    lastChecked: number
    lastError?: string
}

interface APIHealthStatus {
    gemini: APIHealth
    openrouter: APIHealth
}

// Cache health status for 30 seconds
const HEALTH_CHECK_CACHE_MS = 30000
let healthStatus: APIHealthStatus = {
    gemini: { healthy: true, lastChecked: 0 },
    openrouter: { healthy: true, lastChecked: 0 }
}

/**
 * Checks if Gemini API is healthy with a lightweight test
 */
async function checkGeminiHealth(): Promise<boolean> {
    try {
        const testChat = model.startChat({
            generationConfig: { maxOutputTokens: 10 }
        })
        await testChat.sendMessage('Hi')
        return true
    } catch (error) {
        console.warn('Gemini health check failed:', error)
        return false
    }
}

/**
 * Checks if OpenRouter API is healthy with a lightweight test
 */
async function checkOpenRouterHealth(): Promise<boolean> {
    try {
        await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 10
        })
        return true
    } catch (error) {
        console.warn('OpenRouter health check failed:', error)
        return false
    }
}

/**
 * Gets cached health status or performs new check if cache expired
 */
async function getAPIHealth(api: 'gemini' | 'openrouter'): Promise<boolean> {
    const now = Date.now()
    const status = healthStatus[api]

    // Return cached status if still fresh
    if (now - status.lastChecked < HEALTH_CHECK_CACHE_MS) {
        return status.healthy
    }

    // Perform new health check
    const isHealthy = api === 'gemini'
        ? await checkGeminiHealth()
        : await checkOpenRouterHealth()

    // Update cache
    healthStatus[api] = {
        healthy: isHealthy,
        lastChecked: now,
        lastError: isHealthy ? undefined : 'Health check failed'
    }

    console.log(`${api} API health: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`)
    return isHealthy
}

/**
 * Gets a response from the AI, intelligently routing to healthy APIs
 * @param messages The chat history including the current message
 * @returns The AI's response text
 */
export async function getAIResponse(messages: ChatMessage[]): Promise<string> {
    // Check health of both APIs
    const geminiHealthy = await getAPIHealth('gemini')
    const openRouterHealthy = await getAPIHealth('openrouter')

    // If both are healthy, prefer Gemini (default)
    if (geminiHealthy) {
        try {
            console.log('Using Gemini API (healthy)')
            return await getGeminiResponse(messages)
        } catch (error) {
            console.warn('Gemini failed despite health check, trying OpenRouter...', error)
            // Mark as unhealthy for next time
            healthStatus.gemini.healthy = false
            healthStatus.gemini.lastChecked = Date.now()

            if (openRouterHealthy) {
                return await getOpenRouterResponse(messages)
            }
            throw error
        }
    }

    // If Gemini unhealthy but OpenRouter healthy, use OpenRouter
    if (openRouterHealthy) {
        try {
            console.log('Using OpenRouter API (Gemini unhealthy)')
            return await getOpenRouterResponse(messages)
        } catch (error) {
            console.error('OpenRouter failed:', error)
            // Mark as unhealthy
            healthStatus.openrouter.healthy = false
            healthStatus.openrouter.lastChecked = Date.now()
            throw error
        }
    }

    // Both unhealthy - try anyway with original fallback logic
    console.warn('Both APIs marked unhealthy, attempting anyway...')
    try {
        return await getGeminiResponse(messages)
    } catch (geminiError) {
        console.warn('Gemini failed, trying OpenRouter as last resort...', geminiError)
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
