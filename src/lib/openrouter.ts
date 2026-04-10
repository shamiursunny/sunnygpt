// OpenRouter API setup - gives us access to different AI models
// Built by Shamiur Rashid Sunny (shamiur.com)
// Using OpenRouter's Free Models Router for auto-detection of best free model
// This automatically selects from all available free models like a weather report!

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

// OpenRouter's Free Models Router - auto-detects and selects best available free model
// Automatically:
// - Scans all available free models in real-time
// - Selects the best model based on request needs
// - Switches automatically when rate limited (429)
// - Updates as new free models become available
// - No manual model updates needed!
export const DEFAULT_MODEL = 'openrouter/free'

export { openai }
