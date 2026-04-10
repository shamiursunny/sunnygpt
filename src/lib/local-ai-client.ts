// Client-side Local AI - runs only in browser, not on server
// This file is only for client-side components

export interface LocalAIConfig {
    modelName?: string
}

// Only load in browser, not during SSR
let qaPipeline: any = null
let isLoading = false
let loadError: string | null = null

// Check if we're in browser
const isBrowser = typeof window !== 'undefined'

/**
 * Lazy load the Transformers.js pipeline - only runs in browser
 */
async function getPipeline() {
    if (!isBrowser) {
        throw new Error('Local AI only works in browser')
    }
    
    if (qaPipeline) return qaPipeline
    if (isLoading) {
        // Wait for existing load
        await new Promise(resolve => setTimeout(resolve, 500))
        return qaPipeline
    }
    
    isLoading = true
    loadError = null
    
    try {
        // Dynamic import - only loads in browser
        const { pipeline } = await import('@xenova/transformers')
        
        // Use small QA model
        qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad')
        
        isLoading = false
        console.log('Local AI loaded!')
        return qaPipeline
    } catch (error) {
        loadError = error instanceof Error ? error.message : 'Failed to load'
        isLoading = false
        console.error('Local AI load failed:', error)
        throw error
    }
}

/**
 * Generate response using local AI in browser
 */
export async function generateLocalResponse(question: string, context: string): Promise<string> {
    if (!isBrowser) {
        throw new Error('Local AI only works in browser')
    }
    
    const pipeline = await getPipeline()
    
    // Limit context length
    const truncatedContext = context.slice(-1500)
    
    try {
        const result = await pipeline(question, truncatedContext)
        return result?.answer || 'I found relevant information but could not generate a clear answer.'
    } catch (error) {
        console.error('Local AI generation error:', error)
        throw error
    }
}

/**
 * Simple fallback responses for offline mode
 */
export function generateSimpleResponse(prompt: string): string {
    const lower = prompt.toLowerCase()
    
    const responses: Record<string, string> = {
        'hello': 'Hello! How can I help you?',
        'hi': 'Hi there!',
        'help': 'I\'m here to help. Ask me anything!',
        'who are you': 'I\'m SunnyGPT, your AI assistant.',
    }
    
    for (const [key, value] of Object.entries(responses)) {
        if (lower.includes(key)) return value
    }
    
    return 'I need more context to help. Please include relevant information in your message.'
}

/**
 * Check if local AI is available
 */
export function isLocalAILoaded(): boolean {
    return !!qaPipeline
}

/**
 * Get loading error if any
 */
export function getLocalAIError(): string | null {
    return loadError
}

/**
 * Preload local AI (call from client component)
 */
export function preloadLocalAI(): void {
    if (!isBrowser || qaPipeline || isLoading) return
    
    // Non-blocking preload
    getPipeline().catch(console.error)
}