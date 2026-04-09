// AI Client - adaptive provider and model routing with self-healing scans.
// Built by Shamiur Rashid Sunny (shamiur.com)

import { createGeminiModel, getAvailableGeminiModels } from './gemini'
import { getAvailableOpenRouterFreeModels, openai } from './openrouter'

export interface ChatMessage {
    role: 'user' | 'assistant' | 'model'
    content: string
}

interface APIHealth {
    healthy: boolean
    lastChecked: number
    lastError?: string
    activeModel?: string
}

interface APIHealthStatus {
    gemini: APIHealth
    openrouter: APIHealth
}

interface ModelListCache {
    models: string[]
    fetchedAt: number
}

const HEALTH_CHECK_CACHE_MS = 30_000
const MODEL_LIST_CACHE_MS = 10 * 60_000
const MODEL_FAILURE_COOLDOWN_MS = 5 * 60_000

let healthStatus: APIHealthStatus = {
    gemini: { healthy: true, lastChecked: 0 },
    openrouter: { healthy: true, lastChecked: 0 }
}

let geminiModelListCache: ModelListCache = { models: [], fetchedAt: 0 }
let openRouterModelListCache: ModelListCache = { models: [], fetchedAt: 0 }

const modelPenaltyUntil = {
    gemini: new Map<string, number>(),
    openrouter: new Map<string, number>()
}

function isModelPenalized(provider: 'gemini' | 'openrouter', modelName: string): boolean {
    const penaltyUntil = modelPenaltyUntil[provider].get(modelName) || 0
    return penaltyUntil > Date.now()
}

function markModelUnhealthy(provider: 'gemini' | 'openrouter', modelName: string, error?: unknown): void {
    modelPenaltyUntil[provider].set(modelName, Date.now() + MODEL_FAILURE_COOLDOWN_MS)
    healthStatus[provider].healthy = false
    healthStatus[provider].lastChecked = Date.now()
    healthStatus[provider].lastError = error instanceof Error ? error.message : 'Unknown model failure'
    if (healthStatus[provider].activeModel === modelName) {
        healthStatus[provider].activeModel = undefined
    }
}

function getCachedModelList(cache: ModelListCache): string[] | null {
    if (Date.now() - cache.fetchedAt < MODEL_LIST_CACHE_MS && cache.models.length > 0) {
        return cache.models
    }
    return null
}

function prioritizeHealthyModels(provider: 'gemini' | 'openrouter', models: string[]): string[] {
    const deduped = Array.from(new Set(models))
    const healthyFirst = deduped.filter((modelName) => !isModelPenalized(provider, modelName))
    const penalized = deduped.filter((modelName) => isModelPenalized(provider, modelName))
    return [...healthyFirst, ...penalized]
}

async function getGeminiModelCandidates(forceRefresh = false): Promise<string[]> {
    if (!forceRefresh) {
        const cached = getCachedModelList(geminiModelListCache)
        if (cached) return prioritizeHealthyModels('gemini', cached)
    }

    const models = await getAvailableGeminiModels()
    geminiModelListCache = {
        models,
        fetchedAt: Date.now()
    }
    return prioritizeHealthyModels('gemini', models)
}

async function getOpenRouterModelCandidates(forceRefresh = false): Promise<string[]> {
    if (!forceRefresh) {
        const cached = getCachedModelList(openRouterModelListCache)
        if (cached) return prioritizeHealthyModels('openrouter', cached)
    }

    const models = await getAvailableOpenRouterFreeModels()
    openRouterModelListCache = {
        models,
        fetchedAt: Date.now()
    }
    return prioritizeHealthyModels('openrouter', models)
}

async function probeGeminiModel(modelName: string): Promise<boolean> {
    try {
        const model = createGeminiModel(modelName)
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 8 }
        })
        return Boolean(result.response.text())
    } catch (error) {
        console.warn(`Gemini model probe failed (${modelName}):`, error)
        markModelUnhealthy('gemini', modelName, error)
        return false
    }
}

async function probeOpenRouterModel(modelName: string): Promise<boolean> {
    try {
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 8
        })
        return Boolean(completion.choices[0]?.message?.content)
    } catch (error) {
        console.warn(`OpenRouter model probe failed (${modelName}):`, error)
        markModelUnhealthy('openrouter', modelName, error)
        return false
    }
}

async function selectHealthyGeminiModel(forceRefresh = false): Promise<string> {
    const candidates = await getGeminiModelCandidates(forceRefresh)

    for (const modelName of candidates) {
        if (await probeGeminiModel(modelName)) {
            healthStatus.gemini = {
                healthy: true,
                lastChecked: Date.now(),
                activeModel: modelName
            }
            return modelName
        }
    }

    if (!forceRefresh) {
        return selectHealthyGeminiModel(true)
    }

    healthStatus.gemini = {
        healthy: false,
        lastChecked: Date.now(),
        lastError: 'No healthy Gemini model found'
    }
    throw new Error('No healthy Gemini model found')
}

async function selectHealthyOpenRouterModel(forceRefresh = false): Promise<string> {
    const candidates = await getOpenRouterModelCandidates(forceRefresh)

    for (const modelName of candidates) {
        if (await probeOpenRouterModel(modelName)) {
            healthStatus.openrouter = {
                healthy: true,
                lastChecked: Date.now(),
                activeModel: modelName
            }
            return modelName
        }
    }

    if (!forceRefresh) {
        return selectHealthyOpenRouterModel(true)
    }

    healthStatus.openrouter = {
        healthy: false,
        lastChecked: Date.now(),
        lastError: 'No healthy OpenRouter free model found'
    }
    throw new Error('No healthy OpenRouter free model found')
}

async function checkGeminiHealth(): Promise<boolean> {
    try {
        await selectHealthyGeminiModel()
        return true
    } catch {
        return false
    }
}

async function checkOpenRouterHealth(): Promise<boolean> {
    try {
        await selectHealthyOpenRouterModel()
        return true
    } catch {
        return false
    }
}

async function getAPIHealth(api: 'gemini' | 'openrouter'): Promise<boolean> {
    const now = Date.now()
    const status = healthStatus[api]

    if (now - status.lastChecked < HEALTH_CHECK_CACHE_MS) {
        return status.healthy
    }

    const isHealthy = api === 'gemini'
        ? await checkGeminiHealth()
        : await checkOpenRouterHealth()

    if (!isHealthy && !healthStatus[api].lastError) {
        healthStatus[api].lastError = 'Health check failed'
    }

    return isHealthy
}

export async function getAIProviderStatus(): Promise<{
    gemini: APIHealth
    openrouter: APIHealth
}> {
    await Promise.all([
        getAPIHealth('gemini'),
        getAPIHealth('openrouter')
    ])

    return {
        gemini: { ...healthStatus.gemini },
        openrouter: { ...healthStatus.openrouter }
    }
}

export async function getAIResponse(messages: ChatMessage[]): Promise<string> {
    const geminiHealthy = await getAPIHealth('gemini')
    const openRouterHealthy = await getAPIHealth('openrouter')

    if (geminiHealthy) {
        try {
            const modelName = healthStatus.gemini.activeModel || await selectHealthyGeminiModel()
            console.log(`Using Gemini API model: ${modelName}`)
            return await getGeminiResponse(messages, modelName)
        } catch (error) {
            const activeModel = healthStatus.gemini.activeModel
            if (activeModel) {
                markModelUnhealthy('gemini', activeModel, error)
            }
            if (openRouterHealthy) {
                const fallbackModel = healthStatus.openrouter.activeModel || await selectHealthyOpenRouterModel()
                return await getOpenRouterResponse(messages, fallbackModel)
            }
            throw error
        }
    }

    if (openRouterHealthy) {
        try {
            const modelName = healthStatus.openrouter.activeModel || await selectHealthyOpenRouterModel()
            console.log(`Using OpenRouter API model: ${modelName}`)
            return await getOpenRouterResponse(messages, modelName)
        } catch (error) {
            const activeModel = healthStatus.openrouter.activeModel
            if (activeModel) {
                markModelUnhealthy('openrouter', activeModel, error)
            }
            throw error
        }
    }

    try {
        const modelName = await selectHealthyGeminiModel(true)
        return await getGeminiResponse(messages, modelName)
    } catch (geminiError) {
        console.warn('Gemini recovery failed, trying OpenRouter as final fallback...', geminiError)
        const modelName = await selectHealthyOpenRouterModel(true)
        return await getOpenRouterResponse(messages, modelName)
    }
}

async function getGeminiResponse(messages: ChatMessage[], modelName: string): Promise<string> {
    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }))

    const lastMessage = messages[messages.length - 1]
    const model = createGeminiModel(modelName)
    const chat = model.startChat({
        history,
        generationConfig: {
            maxOutputTokens: 2048
        }
    })

    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    return response.text()
}

async function getOpenRouterResponse(messages: ChatMessage[], modelName: string): Promise<string> {
    const formattedMessages = messages.map((msg) => ({
        role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant' | 'system',
        content: msg.content
    }))

    const completion = await openai.chat.completions.create({
        model: modelName,
        messages: formattedMessages
    })

    return completion.choices[0]?.message?.content || ''
}
