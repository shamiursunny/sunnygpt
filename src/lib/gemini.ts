import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({ model: "gemini-pro" });
export const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
