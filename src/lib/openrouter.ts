// OpenRouter API setup - gives us access to different AI models
// Built by Shamiur Rashid Sunny (shamiur.com)
// Using the free Llama model which works surprisingly well!

import OpenAI from 'openai'

// Configure OpenAI client to use OpenRouter instead
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SunnyGPT',
    },
})

// Using Meta's Llama 3.2 3B - it's free and pretty fast
export const DEFAULT_MODEL = 'meta-llama/llama-3.2-3b-instruct:free'

export { openai }
