/**
 * =============================================================================
 * AI Client - Updated for SunnyGPT Prime Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module provides the main AI client interface that combines
 * the AI pool with the 3-tier memory system. It handles memory context
 * injection, automatic memory extraction, and provides both simple
 * and memory-enhanced AI response capabilities.
 * 
 * ARCHITECTURE:
 * -------------
 * The AI client sits at the top of the AI layer:
 * 
 * +------------------+     +------------------+     +------------------+
 * |  API Route       | --> |  AI Client       | --> |  AIPool          |
 * |  (/api/chat)     |     |  (this module)   |     | (multi-account)  |
 * +------------------+     +------------------+     +------------------+
 *                                  |
 *                                  v
 *                          +------------------+     +------------------+
 *                          |  Memory          | --> |  Tier 1 (Neon)  |
 *                          |  Manager          |     |  Tier 2 (Supa)   |
 *                          +------------------+     |  Tier 3 (GitHub) |
 * 
 * KEY FUNCTIONS:
 * ---------------
 * 1. getAIResponseWithMemory: Full context with memory prepending
 * 2. getAIResponse: Simple request (backward compatible)
 * 3. checkAIHealth: Verify AI services are available
 * 
 * MEMORY INTEGRATION:
 * -------------------
 * When getAIResponseWithMemory is called:
 * 
 * 1. RETRIEVE: Fetch session memories from Neon (Tier 1)
 * 2. PREPEND: Add memory summary to prompt as system context
 * 3. PROCESS: Send enhanced prompt to AI
 * 4. EXTRACT: Analyze conversation for key information
 * 5. STORE: Save extracted facts to memory (for next turn)
 * 
 * This creates a continuous context that prevents the AI from
 * "forgetting" important details from earlier in the conversation.
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { getAIResponse, getAIResponseWithMemory, checkAIHealth } from './ai-client'
 * 
 * // Simple AI response (no memory)
 * const response = await getAIResponse([
 *   { role: 'user', content: 'Hello!' }
 * ])
 * 
 * // With memory context (full features)
 * const memoryResponse = await getAIResponseWithMemory(
 *   messages,
 *   'chat-session-123'
 * )
 * 
 * // Check availability
 * const health = await checkAIHealth()
 * console.log(`OpenRouter: ${health.openrouter}, Gemini: ${health.gemini}`)
 * ```
 * 
 * BACKWARD COMPATIBILITY:
 * ----------------------
 * The simple getAIResponse function maintains the same signature
 * as the original implementation, ensuring existing API routes
 * work without modification.
 * 
 * ERROR HANDLING:
 * --------------
 * - Falls back gracefully if memory retrieval fails
 * - Logs memory extraction errors without blocking response
 * - Provider failures propagate to caller
 * 
 * PERFORMANCE:
 * ------------
 * - Memory retrieval is fast (cached in Neon)
 * - Memory prepending adds minimal token overhead
 * - Async memory extraction doesn't block response
 * 
 * =============================================================================
 */

import { getAIResponse as poolGetAIResponse } from './ai-pool'
import { getSessionMemories, getMemorySummary, extractAndStoreMemories } from './memory-manager'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Chat message type
 * 
 * Standard message format for AI interactions.
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'model'
  content: string
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get AI response with memory context
 * 
 * Provides full-featured AI response with automatic memory
 * integration. This is the recommended function for production use.
 * 
 * @param messages - Chat message history
 * @param sessionId - Session identifier for memory context
 * @returns Promise<{ message, provider, account }> - Response with metadata
 * 
 * @example
 * ```typescript
 * const response = await getAIResponseWithMemory(
 *   [
 *     { role: 'user', content: 'I love machine learning!' },
 *     { role: 'model', content: 'Great! What aspects interest you most?' }
 *   ],
 *   'chat-123'
 * )
 * 
 * console.log(response.message)
 * console.log(`Used ${response.provider} via ${response.account}`)
 * ```
 * 
 * PROCESS FLOW:
 * 1. Fetch memories for session from Tier 1 (Neon)
 * 2. Create summary of past context
 * 3. Prepend to user messages as system prompt
 * 4. Call AI pool with enhanced context
 * 5. Extract new memories from conversation
 * 6. Store for future turns
 * 7. Return response with provider info
 */
export async function getAIResponseWithMemory(
  messages: ChatMessage[],
  sessionId: string
): Promise<{ message: string; provider: string; account: string }> {
  // STEP 1: Get memory context for this session
  const memorySummary = await getMemorySummary(sessionId)
  
  let enhancedMessages = [...messages]
  
  // STEP 2: Prepend memory context if available
  if (memorySummary) {
    // Note: Using 'user' role as fallback since 'system' may not be supported
    // In production, ensure your AI provider accepts 'system' role
    const memoryMessage: ChatMessage = {
      role: 'user',
      content: `Previous conversation context:\n${memorySummary}\n\nUse this context to maintain continuity.`
    }
    enhancedMessages = [memoryMessage, ...messages]
  }
  
  // STEP 3: Get AI response using pool
  const response = await poolGetAIResponse(enhancedMessages)
  
  // STEP 4: Extract and store memories (async, doesn't block response)
  // Using fire-and-forget pattern - don't await
  extractAndStoreMemories(sessionId, messages).catch(err => {
    console.error('[AIClient] Memory extraction failed:', err)
  })
  
  // STEP 5: Return response with metadata
  return {
    message: response.message,
    provider: response.provider,
    account: response.account
  }
}

/**
 * Simple AI response (backward compatible)
 * 
 * Provides basic AI response without memory integration.
 * Maintains the same interface as the original implementation.
 * 
 * @param messages - Chat message history
 * @returns Promise<string> - AI response text
 * 
 * @example
 * ```typescript
 * const reply = await getAIResponse([
 *   { role: 'user', content: 'What is Python?' }
 * ])
 * console.log(reply) // "Python is a high-level programming language..."
 * ```
 */
export async function getAIResponse(messages: ChatMessage[]): Promise<string> {
  const response = await poolGetAIResponse(messages)
  return response.message
}

/**
 * Health check for AI services
 * 
 * Verifies that at least one AI provider is available.
 * Useful for monitoring and early warning systems.
 * 
 * @returns Promise<{ openrouter: boolean; gemini: boolean }> - Provider availability
 * 
 * @example
 * ```typescript
 * const health = await checkAIHealth()
 * if (!health.openrouter && !health.gemini) {
 *   console.error('No AI services available!')
 * }
 * ```
 */
export async function checkAIHealth(): Promise<{ openrouter: boolean; gemini: boolean }> {
  try {
    // TRY: Make a minimal request to verify connectivity
    await poolGetAIResponse([{ role: 'user', content: 'hi' }])
    return { openrouter: true, gemini: true }
  } catch {
    // NOTE: More granular health check would go here
    // For now, any error means both potentially unavailable
    return { openrouter: false, gemini: false }
  }
}

/**
 * =============================================================================
 * END OF AI CLIENT
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */