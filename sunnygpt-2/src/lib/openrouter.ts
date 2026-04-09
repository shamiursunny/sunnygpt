// OpenRouter API setup with free-model auto discovery.
// Built by Shamiur Rashid Sunny (shamiur.com)

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SunnyGPT',
    },
})

interface OpenRouterModelPricing {
    prompt?: string
    completion?: string
    request?: string
    image?: string
}

interface OpenRouterModelRecord {
    id?: string
    created?: number
    pricing?: OpenRouterModelPricing
}

interface OpenRouterModelsResponse {
    data?: OpenRouterModelRecord[]
}

export const OPENROUTER_FALLBACK_FREE_MODELS: string[] = [
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-32b:free',
    'deepseek/deepseek-r1:free',
    'mistralai/mistral-small-3.1-24b-instruct:free'
]

function toNumber(value?: string): number {
    if (!value) return Number.POSITIVE_INFINITY
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
}

function isFreeModel(record: OpenRouterModelRecord): boolean {
    const modelId = record.id || ''
    if (modelId.endsWith(':free')) {
        return true
    }

    const pricing = record.pricing || {}
    return toNumber(pricing.prompt) === 0 &&
        toNumber(pricing.completion) === 0 &&
        (pricing.request === undefined || toNumber(pricing.request) === 0) &&
        (pricing.image === undefined || toNumber(pricing.image) === 0)
}

function openRouterScore(record: OpenRouterModelRecord): number {
    const modelId = record.id || ''
    let score = 0

    // Prefer explicit free-tagged routes.
    if (modelId.endsWith(':free')) score += 500

    // Prefer newer routes where OpenRouter exposes created timestamps.
    if (record.created) score += Math.floor(record.created / 100000)

    // Prefer larger, more capable common chat families for quality.
    if (modelId.includes('llama-3.3') || modelId.includes('gemma-3') || modelId.includes('qwen3')) score += 100
    if (modelId.includes('r1')) score += 50

    return score
}

export async function getAvailableOpenRouterFreeModels(): Promise<string[]> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`OpenRouter model listing failed with ${response.status}`)
        }

        const data = await response.json() as OpenRouterModelsResponse
        const listedModels = (data.data || [])
            .filter((record) => Boolean(record.id))
            .filter((record) => isFreeModel(record))
            .sort((a, b) => openRouterScore(b) - openRouterScore(a))
            .map((record) => record.id as string)

        const deduped = Array.from(new Set([...listedModels, ...OPENROUTER_FALLBACK_FREE_MODELS]))
        return deduped
    } catch (error) {
        console.warn('OpenRouter free-model auto-discovery failed, using fallback models:', error)
        return [...OPENROUTER_FALLBACK_FREE_MODELS]
    }
}

export { openai }
