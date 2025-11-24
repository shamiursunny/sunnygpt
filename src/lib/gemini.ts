/**
 * Google Gemini AI Integration
 * 
 * This module initializes the Google Gemini AI client for generating AI responses.
 * It supports both text (gemini-pro) and vision (gemini-pro-vision) models.
 * 
 * SECURITY: API key is loaded from environment variables only - never hardcoded.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Load API key from environment variables (never hardcode sensitive keys)
const apiKey = process.env.GEMINI_API_KEY;

// Warn if API key is missing (helps with debugging configuration issues)
if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

// Initialize the Gemini AI client with the API key
const genAI = new GoogleGenerativeAI(apiKey || "");

// Export the text generation model (gemini-pro)
export const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Export the vision model for image understanding (gemini-pro-vision)
export const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
