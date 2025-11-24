/**
 * OpenRouter API Integration
 * 
 * This module configures the OpenAI client to work with OpenRouter, which provides
 * access to various AI models including free options. Currently using Meta Llama 3.2 3B
 * which is completely free and provides fast responses.
 * 
 * SECURITY: API key is loaded from environment variables only - never hardcoded.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import OpenAI from 'openai'

// Initialize OpenAI client with OpenRouter configuration
// OpenRouter acts as a proxy to multiple AI model providers
const openai = new OpenAI({
    // SECURITY: API key from environment variables only
    apiKey: process.env.OPENROUTER_API_KEY || '',
    // OpenRouter's API endpoint
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        // Optional: helps with OpenRouter rankings and analytics
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SunnyGPT',
    },
})

// Using Meta Llama 3.2 3B Instruct - a fast and completely free model
// This model provides good quality responses without any API costs
export const DEFAULT_MODEL = 'meta-llama/llama-3.2-3b-instruct:free'

export { openai }
