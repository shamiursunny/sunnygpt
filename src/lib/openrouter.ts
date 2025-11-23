import OpenAI from 'openai'

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', // Optional: for rankings
        'X-Title': 'SunnyGPT', // Optional: shows in rankings
    },
})

// Free model - using Meta Llama 3.2 3B (fast and completely free)
export const DEFAULT_MODEL = 'meta-llama/llama-3.2-3b-instruct:free'

export { openai }
