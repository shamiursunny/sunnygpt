// Google Gemini AI setup with automatic model discovery.
// Built by Shamiur Rashid Sunny (shamiur.com)

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables.')
}

const genAI = new GoogleGenerativeAI(apiKey || '')
const GEMINI_MODELS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

interface GeminiModelRecord {
    name?: string
    supportedGenerationMethods?: string[]
}

interface GeminiModelsResponse {
    models?: GeminiModelRecord[]
}

export const GEMINI_FALLBACK_MODELS: string[] = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
]

export function createGeminiModel(modelName: string) {
    return genAI.getGenerativeModel({ model: modelName })
}

function normalizeGeminiModelName(name: string): string {
    return name.replace(/^models\//, '')
}

function geminiScore(modelName: string): number {
    let score = 0

    // Prefer newer families.
    if (modelName.includes('2.5')) score += 500
    else if (modelName.includes('2.0')) score += 400
    else if (modelName.includes('1.5')) score += 300

    // Prefer free-tier friendly "flash" lines for sustained uptime/cost control.
    if (modelName.includes('flash-lite')) score += 50
    else if (modelName.includes('flash')) score += 40
    else if (modelName.includes('pro')) score -= 20

    // Avoid special-purpose models for generic chat.
    if (modelName.includes('vision') || modelName.includes('embedding')) score -= 200

    return score
}

export async function getAvailableGeminiModels(): Promise<string[]> {
    if (!apiKey) {
        return [...GEMINI_FALLBACK_MODELS]
    }

    try {
        const response = await fetch(`${GEMINI_MODELS_ENDPOINT}?key=${apiKey}`, {
            method: 'GET',
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Gemini model listing failed with ${response.status}`)
        }

        const data = await response.json() as GeminiModelsResponse
        const listedModels = (data.models || [])
            .filter((record) => (record.supportedGenerationMethods || []).includes('generateContent'))
            .map((record) => normalizeGeminiModelName(record.name || ''))
            .filter((name) => name.startsWith('gemini-') && !name.includes('embedding'))
            .sort((a, b) => geminiScore(b) - geminiScore(a))

        const deduped = Array.from(new Set([...listedModels, ...GEMINI_FALLBACK_MODELS]))
        return deduped
    } catch (error) {
        console.warn('Gemini model auto-discovery failed, using fallback models:', error)
        return [...GEMINI_FALLBACK_MODELS]
    }
}
