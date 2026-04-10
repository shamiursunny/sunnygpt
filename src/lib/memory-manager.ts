/**
 * =============================================================================
 * 3-Tier Memory Manager - SunnyGPT Prime Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module orchestrates the complete 3-tier memory system that provides
 * unlimited conversation context for the AI while implementing data lifecycle
 * management with automatic cleanup and archival.
 * 
 * ARCHITECTURE:
 * -------------
 * The memory system implements a tiered data lifecycle:
 * 
 * TIER 1: WORKING MEMORY (Neon - 7 days)
 * ----------------------------------------
 * - Purpose: Active conversation context for AI
 * - Storage: Prisma AIMemory model (Neon PostgreSQL)
 * - TTL: 7 days from creation
 * - Auto-cleanup: Expired memories deleted daily via cron
 * - Use: Prepended to AI prompts for continuity
 * 
 * DATA STRUCTURE:
 * - sessionId: Links memory to chat session
 * - content: Extracted facts, summaries, entities
 * - memoryType: 'summary' | 'entity' | 'fact' | 'preference'
 * - priority: Higher = more important (used first)
 * - expiresAt: TTL timestamp for auto-deletion
 * 
 * TIER 2: SEASONAL MEMORY (Supabase - 30 days)
 * -----------------------------------------------
 * - Purpose: Recent chat history backup
 * - Storage: Prisma Season model
 * - TTL: 30 days before GitHub archive
 * - Auto-archive: Monthly cron to GitHub
 * - Use: Restore context after Tier 1 expires
 * 
 * DATA STRUCTURE:
 * - seasonId: Unique season identifier
 * - title: Season/chat title
 * - startedAt: Season start timestamp
 * - endedAt: Season end timestamp
 * - status: 'active' | 'archived' | 'archived_to_github'
 * - messageCount: Total messages in season
 * - githubIssueId: Link to GitHub archive
 * 
 * TIER 3: PERMANENT ARCHIVE (GitHub - Forever)
 * ---------------------------------------------
 * - Purpose: Long-term chat history storage
 * - Storage: GitHub Issues (JSON body)
 * - TTL: Never (permanent)
 * - Access: Via GitHub API for restoration
 * - Use: Full history lookup, legal compliance
 * 
 * DATA FORMAT (GitHub Issue Body):
 * - Markdown formatting for readability
 * - JSON block for machine parsing
 * - Labels: sunnygpt-archive, chat-history, season
 * 
 * WORKFLOW:
 * ----------
 * 1. USER MESSAGE → AI generates response
 * 2. EXTRACT → Key facts/summaries stored in Neon (Tier 1)
 * 3. AI CONTEXT → Neon memories prepended to next prompt
 * 4. 7 DAYS → Expired Neon memories cleaned up (cron)
 * 5. 30 DAYS → Season archived to GitHub (cron)
 * 6. FOREVER → Season available in GitHub Issues
 * 
 * KEY FUNCTIONS:
 * -------------
 * - storeMemory: Save extracted facts to Tier 1
 * - getSessionMemories: Retrieve active memories for AI context
 * - getMemorySummary: Condensed context for prompts
 * - clearExpiredMemories: Cron job for Tier 1 cleanup
 * - archiveSeasonToGitHub: Manual/auto archive to Tier 3
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { storeMemory, getMemorySummary, archiveSeasonToGitHub } from './memory-manager'
 * 
 * // Store AI-generated memory
 * await storeMemory({
 *   sessionId: 'chat-123',
 *   content: 'User prefers Python for data analysis',
 *   memoryType: 'preference'
 * })
 * 
 * // Get context for AI prompt
 * const context = await getMemorySummary('chat-123')
 * // Returns: "User preferences: ..."
 * ```
 * 
 * CRON JOBS:
 * ----------
 * 1. /api/cron/cleanup - Daily at midnight
 *    - Clears AIMemory records where expiresAt < now
 *    - Also clears ServiceLog records older than 30 days
 * 
 * 2. /api/cron/archive - Monthly on 1st
 *    - Finds Season records older than 30 days
 *    - Archives each to GitHub Issue
 *    - Updates status to 'archived_to_github'
 * 
 * COMPLIANCE:
 * -----------
 * - GDPR: User can request data deletion (removes from all tiers)
 * - Data Retention: Automatic policies enforce retention limits
 * - Audit Trail: All operations logged to ServiceLog
 * 
 * ERROR HANDLING:
 * ---------------
 * - Graceful degradation if one tier unavailable
 * - Memory retrieval failures don't block AI responses
 * - Archive failures logged and retried
 * 
 * =============================================================================
 */

import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/config/resource-registry'
import { logServiceActivity } from '@/lib/monitoring/logger'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Memory Entry Interface
 * 
 * Defines the structure for memory storage operations.
 * 
 * @property id - Unique memory identifier (generated)
 * @property sessionId - Links memory to conversation
 * @property content - The actual memory content
 * @property memoryType - Category of memory
 * @property priority - Importance level (1-10)
 * @property createdAt - When memory was created
 * @property metadata - Additional context
 */
interface MemoryEntry {
  id?: string
  sessionId: string
  content: string
  memoryType: 'summary' | 'entity' | 'fact' | 'preference'
  priority?: number
  createdAt?: Date
  metadata?: Record<string, any>
}

// ============================================================================
// TIER 1: WORKING MEMORY OPERATIONS
// ============================================================================

/**
 * Store memory in Tier 1 (Neon)
 * 
 * Saves an extracted memory to the working memory store.
 * Automatically sets expiration based on configured TTL.
 * 
 * @param entry - Memory to store
 * @returns Promise<string> - ID of created memory
 * 
 * @example
 * ```typescript
 * const memoryId = await storeMemory({
 *   sessionId: 'chat-123',
 *   content: 'User interested in machine learning',
 *   memoryType: 'fact',
 *   priority: 2
 * })
 * ```
 */
export async function storeMemory(entry: MemoryEntry): Promise<string> {
  // GET TTL: From settings (default 7 days)
  const settings = await getSettings()
  const expiresAt = new Date(Date.now() + settings.memoryTier1Days * 24 * 60 * 60 * 1000)

  // CREATE: Store in database
  const memory = await prisma.aIMemory.create({
    data: {
      sessionId: entry.sessionId,
      content: entry.content,
      memoryType: entry.memoryType,
      priority: entry.priority || 1,
      expiresAt,
      metadata: entry.metadata as any
    }
  })

  // LOG: Record operation
  await logServiceActivity({
    service: 'memory',
    provider: 'neon',
    action: 'store_memory',
    latencyMs: 0,
    status: 'success',
    metadata: { memoryType: entry.memoryType, sessionId: entry.sessionId }
  })

  return memory.id
}

/**
 * Get all active memories for a session
 * 
 * Retrieves all non-expired memories for a given session,
 * ordered by priority (highest first) then by creation date.
 * 
 * @param sessionId - Session/chat identifier
 * @returns Promise<MemoryEntry[]> - Array of active memories
 * 
 * @example
 * ```typescript
 * const memories = await getSessionMemories('chat-123')
 * memories.forEach(m => console.log(`[${m.memoryType}] ${m.content}`))
 * ```
 */
export async function getSessionMemories(sessionId: string): Promise<MemoryEntry[]> {
  const now = new Date()

  // QUERY: Get non-expired memories
  const memories = await prisma.aIMemory.findMany({
    where: {
      sessionId,
      expiresAt: { gt: now }  // Only non-expired
    },
    orderBy: [
      { priority: 'desc' },  // Highest priority first
      { createdAt: 'desc' }  // Newest first
    ]
  })

  // MAP: Convert to interface format
  return memories.map(m => ({
    id: m.id,
    sessionId: m.sessionId,
    content: m.content,
    memoryType: m.memoryType as any,
    priority: m.priority,
    createdAt: m.createdAt,
    metadata: m.metadata as Record<string, any> ?? undefined
  }))
}

/**
 * Get memory summary for AI context
 * 
 * Creates a condensed string representation of all session
 * memories, formatted for inclusion in AI prompts.
 * 
 * @param sessionId - Session to summarize
 * @returns Promise<string> - Formatted summary or empty string
 * 
 * @example
 * ```typescript
 * const summary = await getMemorySummary('chat-123')
 * // Returns:
 * // "Conversation summaries:
 * //  - User prefers Python
 * // Key facts:
 * //  - Working on ML project
 * // User preferences:
 * //  - Prefers detailed explanations"
 * ```
 */
export async function getMemorySummary(sessionId: string): Promise<string> {
  const memories = await getSessionMemories(sessionId)

  if (memories.length === 0) {
    return ''
  }

  // GROUP: By memory type
  const summaries = memories.filter(m => m.memoryType === 'summary')
  const facts = memories.filter(m => m.memoryType === 'fact')
  const entities = memories.filter(m => m.memoryType === 'entity')
  const preferences = memories.filter(m => m.memoryType === 'preference')

  // BUILD: Summary string
  let summary = ''

  if (summaries.length > 0) {
    summary += 'Conversation summaries:\n'
    summary += summaries.map(s => `- ${s.content}`).join('\n') + '\n'
  }

  if (facts.length > 0) {
    summary += 'Key facts:\n'
    summary += facts.map(f => `- ${f.content}`).join('\n') + '\n'
  }

  if (entities.length > 0) {
    summary += 'Entities mentioned:\n'
    summary += entities.map(e => `- ${e.content}`).join('\n') + '\n'
  }

  if (preferences.length > 0) {
    summary += 'User preferences:\n'
    summary += preferences.map(p => `- ${p.content}`).join('\n') + '\n'
  }

  return summary
}

/**
 * Extract and store memories from messages
 * 
 * Analyzes recent messages and stores key information
 * as memories for future context continuity.
 * 
 * @param sessionId - Session to process
 * @param messages - Recent messages
 * 
 * @example
 * ```typescript
 * await extractAndStoreMemories('chat-123', [
 *   { role: 'user', content: 'I love machine learning!' },
 *   { role: 'model', content: 'Great! What kind of ML projects...?' }
 * ])
 * ```
 */
export async function extractAndStoreMemories(
  sessionId: string,
  messages: { role: string; content: string }[]
): Promise<void> {
  // GET: Last 5 messages for context
  const recentMessages = messages.slice(-5)

  for (const msg of recentMessages) {
    // STORE: User message context (truncated)
    if (msg.role === 'user' && msg.content.length > 50) {
      await storeMemory({
        sessionId,
        content: msg.content.substring(0, 200),
        memoryType: 'summary',
        priority: 1,
        metadata: { type: 'user_message', timestamp: new Date() }
      })
    }
  }
}

/**
 * Clear expired memories (Tier 1 cleanup)
 * 
 * Called by cron job to remove memories past their TTL.
 * Implements the 7-day auto-cleanup requirement.
 * 
 * @returns Promise<number> - Number of memories deleted
 * 
 * @example
 * ```typescript
 * const deleted = await clearExpiredMemories()
 * console.log(`Cleared ${deleted} expired memories`)
 * ```
 */
export async function clearExpiredMemories(): Promise<number> {
  const now = new Date()

  // DELETE: Where expiration has passed
  const result = await prisma.aIMemory.deleteMany({
    where: {
      expiresAt: { lt: now }
    }
  })

  // LOG: Record cleanup operation
  await logServiceActivity({
    service: 'memory',
    provider: 'neon',
    action: 'clear_expired',
    latencyMs: 0,
    status: 'success',
    metadata: { deletedCount: result.count }
  })

  console.log(`[Memory] Cleared ${result.count} expired memories`)
  return result.count
}

// ============================================================================
// TIER 2: SEASONAL MEMORY OPERATIONS
// ============================================================================

/**
 * Archive session to Season (Tier 2)
 * 
 * Creates a new season record linking to existing chat.
 * Used when user wants to "close" a conversation topic.
 * 
 * @param sessionId - Chat/season to archive
 * @param title - Season title
 * @param description - Optional description
 * @returns Promise<string> - ID of created season
 * 
 * @example
 * ```typescript
 * const seasonId = await archiveToSeason(
 *   'chat-123',
 *   'Machine Learning Discussion',
 *   'Conversations about ML projects and Python'
 * )
 * ```
 */
export async function archiveToSeason(
  sessionId: string,
  title: string,
  description?: string
): Promise<string> {
  // COUNT: Number of messages in chat
  const messages = await prisma.message.findMany({
    where: { chat: { id: sessionId } }
  })

  // CREATE: Season record
  const season = await prisma.season.create({
    data: {
      title,
      description,
      messageCount: messages.length,
      status: 'active'
    }
  })

  // LINK: Connect chat to season
  await prisma.chat.update({
    where: { id: sessionId },
    data: { seasonId: season.id }
  })

  // LOG: Record operation
  await logServiceActivity({
    service: 'season',
    provider: 'supabase',
    action: 'create_season',
    latencyMs: 0,
    status: 'success',
    metadata: { seasonId: season.id, messageCount: messages.length }
  })

  return season.id
}

/**
 * Get active seasons
 * 
 * Returns all seasons that haven't been archived to GitHub.
 * 
 * @returns Promise<Season[]> - Array of active seasons
 * 
 * @example
 * ```typescript
 * const seasons = await getActiveSeasons()
 * seasons.forEach(s => console.log(`${s.title}: ${s.messageCount} messages`))
 * ```
 */
export async function getActiveSeasons(): Promise<any[]> {
  const seasons = await prisma.season.findMany({
    where: { status: 'active' },
    orderBy: { startedAt: 'desc' }
  })

  return seasons
}

// ============================================================================
// TIER 3: PERMANENT ARCHIVE OPERATIONS
// ============================================================================

/**
 * Archive season to GitHub (Tier 3)
 * 
 * Exports a complete season to GitHub as a permanent archive.
 * Creates a GitHub Issue with full conversation history.
 * 
 * @param seasonId - Season to archive
 * @returns Promise<string | null> - GitHub Issue URL or null on failure
 * 
 * @example
 * ```typescript
 * const issueUrl = await archiveSeasonToGitHub('season-123')
 * if (issueUrl) {
 *   console.log(`Archived to: ${issueUrl}`)
 * }
 * ```
 */
export async function archiveSeasonToGitHub(seasonId: string): Promise<string | null> {
  try {
    // IMPORT: GitHub archive module
    const { GitHubArchive } = await import('./github-archive')
    const archive = new GitHubArchive()
    
    // GET: Season details
    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    })
    
    // GET: All chats in this season
    const chats = await prisma.chat.findMany({
      where: { seasonId },
      include: { messages: true }
    })
    
    if (!season) {
      throw new Error('Season not found')
    }

    // FLATTEN: All messages from all chats
    const allMessages = chats.flatMap(chat => 
      chat.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.toISOString()
      }))
    )

    // CREATE: GitHub Issue
    const issueUrl = await archive.createSeasonIssue({
      seasonId: season.id,
      title: season.title,
      description: season.description || '',
      startedAt: season.startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      messageCount: season.messageCount,
      messages: allMessages
    })

    // UPDATE: Mark as archived
    await prisma.season.update({
      where: { id: seasonId },
      data: { 
        status: 'archived_to_github',
        endedAt: new Date(),
        githubIssueId: issueUrl
      }
    })

    // LOG: Record operation
    await logServiceActivity({
      service: 'archive',
      provider: 'github',
      action: 'archive_season',
      latencyMs: 0,
      status: 'success',
      metadata: { seasonId, issueUrl }
    })

    return issueUrl
    
  } catch (error: any) {
    // LOG: Record failure
    await logServiceActivity({
      service: 'archive',
      provider: 'github',
      action: 'archive_season',
      latencyMs: 0,
      status: 'error',
      errorMessage: error.message
    })

    return null
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get memory system statistics
 * 
 * Returns counts of resources in each tier.
 * Useful for monitoring and dashboards.
 * 
 * @returns Promise<MemoryStats> - Tier counts
 * 
 * @example
 * ```typescript
 * const stats = await getMemoryStats()
 * console.log(`Active memories: ${stats.tier1Active}`)
 * console.log(`Active seasons: ${stats.tier2Active}`)
 * console.log(`Archived: ${stats.tier3Archived}`)
 * ```
 */
export async function getMemoryStats(): Promise<{
  tier1Active: number
  tier1Expired: number
  tier2Active: number
  tier3Archived: number
}> {
  const now = new Date()

  // COUNT: Each tier
  const [tier1Active, tier1Expired, tier2Active, tier3Archived] = await Promise.all([
    prisma.aIMemory.count({ where: { expiresAt: { gt: now } } }),
    prisma.aIMemory.count({ where: { expiresAt: { lte: now } } }),
    prisma.season.count({ where: { status: 'active' } }),
    prisma.season.count({ where: { status: 'archived_to_github' } })
  ])

  return { tier1Active, tier1Expired, tier2Active, tier3Archived }
}

/**
 * =============================================================================
 * END OF 3-TIER MEMORY MANAGER
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */