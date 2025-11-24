// Google Gemini AI setup (alternative to OpenRouter)
// Built by Shamiur Rashid Sunny (shamiur.com)
// Supports both text and vision models

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Text model for regular chat
export const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Vision model for image understanding
export const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
