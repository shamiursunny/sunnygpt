// Google Gemini AI setup (alternative to OpenRouter)
// Built by Shamiur Rashid Sunny (shamiur.com)
// Supports both text and vision models with auto-fallback to working model

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

// Configure with v1 API (not v1beta) - required for new models
const genAI = new GoogleGenerativeAI(apiKey || "");

// Available free Gemini models - ordered by preference for v1 API
// Note: Using gemini-2.0-flash which is available on v1 API
const GEMINI_MODELS = [
    "gemini-2.0-flash",         // Latest stable - v1 API
    "gemini-1.5-flash",        // Stable
    "gemini-1.5-flash-8b"     // Lighter
];

// Track which model is currently working
let currentModelIndex = 0;
let currentModel = genAI.getGenerativeModel({ 
    model: GEMINI_MODELS[currentModelIndex],
    generationConfig: { maxOutputTokens: 2048 }
});

/**
 * Get the current working Gemini model
 * Automatically falls back to next model if current one fails
 */
export function getModel() {
    return currentModel;
}

/**
 * Switch to the next available Gemini model
 * Called automatically when current model fails
 */
export function switchToNextModel() {
    if (currentModelIndex < GEMINI_MODELS.length - 1) {
        currentModelIndex++;
        currentModel = genAI.getGenerativeModel({ 
            model: GEMINI_MODELS[currentModelIndex],
            generationConfig: { maxOutputTokens: 2048 }
        });
        console.log(`Switched to Gemini model: ${GEMINI_MODELS[currentModelIndex]}`);
    } else {
        console.warn("All Gemini models exhausted");
    }
}

/**
 * Get list of all available Gemini models
 */
export function getAvailableModels() {
    return GEMINI_MODELS;
}

// Text model for regular chat (using dynamic model with auto-fallback)
export const model = {
    startChat: (config?: any) => currentModel.startChat(config)
};

// Vision model for image understanding
export const visionModel = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { maxOutputTokens: 2048 }
});
