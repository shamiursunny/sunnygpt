/**
 * =============================================================================
 * Central Monitoring Logger - SunnyGPT Prime Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module provides the central logging system for all service activities.
 * It records every API call, database query, and external request to enable
 * monitoring, debugging, and compliance auditing.
 * 
 * ARCHITECTURE:
 * -------------
 * The logging system operates at three levels:
 * 
 * 1. IN-MEMORY CACHE:
 *    - Recent logs kept in memory for fast access
 *    - Maximum 1000 entries cached
 *    - First-in,-first-out eviction
 * 
 * 2. DATABASE STORAGE:
 *    - All logs persisted to ServiceLog table
 *    - 30-day retention (configurable)
 *    - Async writes (non-blocking)
 * 
 * 3. CONSOLE OUTPUT:
 *    - Development mode logging
 *    - Emoji indicators for quick scanning
 *    - Formatted for human readability
 * 
 * LOG ENTRY LIFECYCLE:
 * 1. Log created with all metadata
 * 2. Added to in-memory cache immediately
 * 3. Async write to database (fire-and-forget)
 * 4. Console output in development
 * 5. Aggregated for health calculation
 * 
 * FEATURES:
 * ---------
 * - Structured logging with typed entries
 * - Per-provider logging (AI, Database, Storage)
 * - Automatic latency tracking
 * - Error message capture
 * - Metadata support for context
 * - Log retrieval with filters
 * - System health calculation
 * - Automatic log cleanup (cron)
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { logServiceActivity, logAIRequest, logDatabaseQuery, getSystemHealth } from './logger'
 * 
 * // Log generic activity
 * await logServiceActivity({
 *   service: 'openrouter-1',
 *   provider: 'openrouter',
 *   action: 'request',
 *   latencyMs: 1500,
 *   status: 'success'
 * })
 * 
 * // Specialized logging for AI
 * await logAIRequest('openrouter', 'account-1', 500, 1500, 'success')
 * 
 * // Get system health
 * const health = await getSystemHealth()
 * console.log(health.overallStatus)
 * ```
 * 
 * PERFORMANCE:
 * ------------
 * - Async database writes (non-blocking)
 * - In-memory cache for recent logs
 * - Batch processing for health calculations
 * - Cleanup runs on schedule, not every request
 * 
 * COMPLIANCE:
 * -----------
 * - GDPR: Personal data in logs minimized
 * - Retention: Automatic 30-day cleanup
 * - Audit: Full request/response tracking
 * - Masking: API keys never logged
 * 
 * DEPENDENCIES:
 * -------------
 * - @prisma/client: Database access
 * - ./types: ServiceLog type definitions
 * 
 * =============================================================================
 */

import { prisma } from '@/lib/prisma'
import type { ServiceLog, ServiceHealth, SystemHealth, Alert, ResourceMetrics } from './types'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum logs to keep in memory cache
 * Balance between memory usage and recent log access
 */
const MAX_CACHED_LOGS = 1000

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

/**
 * In-memory cache for recent log entries
 * Provides O(1) access to most recent logs
 * 
 * CACHE STRATEGY:
 * - New logs added to front (unshift)
 * - Excess logs removed from back (slice)
 * - No expiration (always freshest)
 */
let recentLogs: ServiceLog[] = []

// ============================================================================
// CORE LOGGING FUNCTIONS
// ============================================================================

/**
 * Log a service activity
 * 
 * Primary function for recording any service activity.
 * All specialized logging functions eventually call this.
 * 
 * @param params - Log parameters
 * @returns Promise<void> - Resolves when log cached (async DB write continues)
 * 
 * @example
 * ```typescript
 * await logServiceActivity({
 *   service: 'openrouter-1',
 *   provider: 'openrouter',
 *   action: 'ai_request',
 *   inputSize: 500,
 *   tokensUsed: 350,
 *   latencyMs: 1500,
 *   status: 'success',
 *   metadata: { model: 'openrouter/free' }
 * })
 * ```
 * 
 * INTERNAL FLOW:
 * 1. Create log entry with timestamp and ID
 * 2. Add to in-memory cache
 * 3. Async write to database (non-blocking)
 * 4. Console output for development
 */
export async function logServiceActivity(params: {
  service: string
  provider: string
  action: string
  inputSize?: number
  outputSize?: number
  tokensUsed?: number
  latencyMs: number
  status: 'success' | 'error' | 'rate_limit' | 'timeout'
  errorMessage?: string
  metadata?: Record<string, any>
}): Promise<void> {
  try {
    // CREATE: Build log entry with metadata
    const logEntry: ServiceLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...params
    }

    // CACHE: Add to in-memory cache (FIFO eviction)
    recentLogs.unshift(logEntry)
    if (recentLogs.length > MAX_CACHED_LOGS) {
      recentLogs = recentLogs.slice(0, MAX_CACHED_LOGS)
    }

    // PERSIST: Async write to database (fire-and-forget)
    prisma.serviceLog.create({
      data: {
        id: logEntry.id,
        timestamp: logEntry.timestamp,
        service: logEntry.service,
        provider: logEntry.provider,
        action: logEntry.action,
        inputSize: logEntry.inputSize,
        outputSize: logEntry.outputSize,
        latencyMs: logEntry.latencyMs,
        status: logEntry.status,
        errorMessage: logEntry.errorMessage,
        metadata: logEntry.metadata as any
      }
    }).catch(err => console.error('[Monitoring] Failed to store log:', err))

    // CONSOLE: Development-friendly output
    const statusEmoji = params.status === 'success' ? '✅' : 
                       params.status === 'error' ? '❌' : 
                       params.status === 'rate_limit' ? '⏳' : '⏰'
    console.log(`[Monitor] ${statusEmoji} ${params.provider}/${params.service}: ${params.action} (${params.latencyMs}ms)`)
    
  } catch (error) {
    // FAILURE: Log to console but don't throw
    console.error('[Monitoring] Failed to log activity:', error)
  }
}

// ============================================================================
// SPECIALIZED LOGGING FUNCTIONS
// ============================================================================

/**
 * Log AI API request
 * 
 * Specialized logging for AI provider requests.
 * Captures token usage and latency specifically.
 * 
 * @param provider - AI provider: 'openrouter' or 'gemini'
 * @param serviceName - Account/service identifier
 * @param tokensUsed - Number of tokens consumed
 * @param latencyMs - Request latency in milliseconds
 * @param status - Request outcome
 * @param errorMessage - Error details if failed (optional)
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await openai.chat.completions.create({...})
 *   await logAIRequest('openrouter', 'account-1', response.usage.total_tokens, 1500, 'success')
 * } catch (error) {
 *   await logAIRequest('openrouter', 'account-1', 0, 1500, 'error', error.message)
 * }
 * ```
 */
export async function logAIRequest(
  provider: 'openrouter' | 'gemini',
  serviceName: string,
  tokensUsed: number,
  latencyMs: number,
  status: 'success' | 'error' | 'rate_limit' | 'timeout',
  errorMessage?: string
): Promise<void> {
  await logServiceActivity({
    service: serviceName,
    provider,
    action: 'ai_request',
    tokensUsed,
    latencyMs,
    status,
    errorMessage
  })
}

/**
 * Log database query
 * 
 * Specialized logging for database operations.
 * Tracks query performance and errors.
 * 
 * @param provider - Database type: 'neon' or 'supabase'
 * @param serviceName - Database identifier
 * @param latencyMs - Query latency in milliseconds
 * @param status - Query outcome
 * @param errorMessage - Error details if failed (optional)
 * 
 * @example
 * ```typescript
 * const start = Date.now()
 * try {
 *   const result = await prisma.message.findMany({...})
 *   await logDatabaseQuery('neon', 'neon-1', Date.now() - start, 'success')
 * } catch (error) {
 *   await logDatabaseQuery('neon', 'neon-1', Date.now() - start, 'error', error.message)
 * }
 * ```
 */
export async function logDatabaseQuery(
  provider: 'neon' | 'supabase',
  serviceName: string,
  latencyMs: number,
  status: 'success' | 'error' | 'rate_limit' | 'timeout',
  errorMessage?: string
): Promise<void> {
  await logServiceActivity({
    service: serviceName,
    provider,
    action: 'query',
    latencyMs,
    status,
    errorMessage
  })
}

/**
 * Log GitHub API call
 * 
 * Specialized logging for GitHub operations.
 * Tracks issue creation, repository access, etc.
 * 
 * @param serviceName - GitHub account identifier
 * @param action - GitHub action type
 * @param latencyMs - API call latency
 * @param status - Call outcome
 * @param errorMessage - Error details if failed (optional)
 */
export async function logGitHubCall(
  serviceName: string,
  action: string,
  latencyMs: number,
  status: 'success' | 'error' | 'rate_limit' | 'timeout',
  errorMessage?: string
): Promise<void> {
  await logServiceActivity({
    service: serviceName,
    provider: 'github',
    action,
    latencyMs,
    status,
    errorMessage
  })
}

/**
 * Log Vercel action
 * 
 * Specialized logging for Vercel operations.
 * Tracks deployments, cron executions, etc.
 * 
 * @param action - Vercel action type
 * @param latencyMs - Action latency
 * @param status - Action outcome
 * @param errorMessage - Error details if failed (optional)
 */
export async function logVercelAction(
  action: string,
  latencyMs: number,
  status: 'success' | 'error' | 'rate_limit' | 'timeout',
  errorMessage?: string
): Promise<void> {
  await logServiceActivity({
    service: 'vercel',
    provider: 'vercel',
    action,
    latencyMs,
    status,
    errorMessage
  })
}

// ============================================================================
// LOG RETRIEVAL
// ============================================================================

/**
 * Get recent logs from cache
 * 
 * Returns most recent logs from in-memory cache.
 * Fast but limited to last 1000 entries.
 * 
 * @param count - Number of logs to return (default 100)
 * @returns ServiceLog[] - Recent log entries
 * 
 * @example
 * ```typescript
 * const recent = getRecentLogs(50)
 * recent.forEach(log => console.log(log.timestamp, log.service, log.status))
 * ```
 */
export function getRecentLogs(count: number = 100): ServiceLog[] {
  return recentLogs.slice(0, count)
}

/**
 * Get logs from database with filters
 * 
 * Query historical logs from database with filtering.
 * Supports filtering by provider, service, status, and date range.
 * 
 * @param filter - Filter parameters
 * @returns Promise<ServiceLog[]> - Matching log entries
 * 
 * @example
 * ```typescript
 * // Get all errors from today
 * const errors = await getLogsFromDB({
 *   status: 'error',
 *   startDate: new Date(new Date().setHours(0,0,0,0)),
 *   limit: 100
 * })
 * 
 * // Get specific provider logs
 * const openrouter = await getLogsFromDB({
 *   provider: 'openrouter',
 *   limit: 50
 * })
 * ```
 */
export async function getLogsFromDB(filter: {
  provider?: string
  service?: string
  status?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<ServiceLog[]> {
  try {
    // BUILD: Construct where clause
    const where: any = {}
    
    if (filter.provider) where.provider = filter.provider
    if (filter.service) where.service = filter.service
    if (filter.status) where.status = filter.status
    if (filter.startDate || filter.endDate) {
      where.timestamp = {}
      if (filter.startDate) where.timestamp.gte = filter.startDate
      if (filter.endDate) where.timestamp.lte = filter.endDate
    }

    // QUERY: Fetch from database
    const logs = await prisma.serviceLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filter.limit || 100
    })

    return logs as unknown as ServiceLog[]
    
  } catch (error) {
    console.error('[Monitoring] Failed to get logs from DB:', error)
    return []
  }
}

// ============================================================================
// HEALTH CALCULATION
// ============================================================================

/**
 * Get service health metrics
 * 
 * Calculate health for a specific service from recent logs.
 * Uses logs from the last hour for metrics.
 * 
 * @param service - Service identifier
 * @param provider - Provider name
 * @returns Promise<ServiceHealth | null> - Calculated health or null on error
 * 
 * @example
 * ```typescript
 * const health = await getServiceHealth('openrouter-1', 'openrouter')
 * if (health) {
 *   console.log(`Status: ${health.status}`)
 *   console.log(`Uptime: ${health.uptime}%`)
 *   console.log(`Avg Latency: ${health.avgLatencyMs}ms`)
 * }
 * ```
 */
export async function getServiceHealth(service: string, provider: string): Promise<ServiceHealth | null> {
  try {
    // WINDOW: Last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    // FETCH: Get recent logs for service
    const logs = await prisma.serviceLog.findMany({
      where: {
        service,
        provider,
        timestamp: { gte: oneHourAgo }
      }
    })

    // CALCULATE: Aggregate metrics
    const successCount = logs.filter(l => l.status === 'success').length
    const errorCount = logs.filter(l => l.status === 'error').length
    const totalCount = logs.length
    const avgLatency = totalCount > 0 
      ? logs.reduce((sum, l) => sum + l.latencyMs, 0) / totalCount 
      : 0

    // TOKENS: Sum AI token usage
    const tokensUsed = logs.reduce((sum, l) => sum + (l.metadata as any)?.tokensUsed || 0, 0)

    // STATUS: Determine health status
    const status = errorCount > totalCount * 0.5 ? 'down' : 
                  errorCount > totalCount * 0.2 ? 'degraded' : 'active'

    return {
      service,
      provider,
      status,
      lastChecked: new Date(),
      latencyMs: avgLatency,
      uptime: totalCount > 0 ? (successCount / totalCount) * 100 : 100,
      errorCount,
      successCount,
      totalRequests: totalCount,
      avgLatencyMs: avgLatency,
      tokensUsed,
      tokensLimit: 100000 // Default
    }
    
  } catch (error) {
    console.error('[Monitoring] Failed to get service health:', error)
    return null
  }
}

/**
 * Get overall system health
 * 
 * Calculate health across all services and providers.
 * Provides complete system status overview.
 * 
 * @returns Promise<SystemHealth> - Complete system health snapshot
 * 
 * @example
 * ```typescript
 * const health = await getSystemHealth()
 * console.log(`Overall Status: ${health.overallStatus}`)
 * console.log(`Active AI: ${health.resources.ai.active}`)
 * console.log(`Active DB: ${health.resources.database.active}`)
 * health.services.forEach(s => {
 *   console.log(`${s.service}: ${s.status}`)
 * })
 * ```
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    // WINDOW: Last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    // FETCH: Recent logs for all services
    const recentLogs = await prisma.serviceLog.findMany({
      where: { timestamp: { gte: oneHourAgo } }
    })

    // GROUP: Aggregate by provider
    const providerStats: Record<string, { success: number; error: number; total: number }> = {}
    
    for (const log of recentLogs) {
      if (!providerStats[log.provider]) {
        providerStats[log.provider] = { success: 0, error: 0, total: 0 }
      }
      providerStats[log.provider].total++
      if (log.status === 'success') {
        providerStats[log.provider].success++
      } else if (log.status === 'error') {
        providerStats[log.provider].error++
      }
    }

    // SERVICES: Build service health array
    const services: ServiceHealth[] = Object.entries(providerStats).map(([provider, stats]) => ({
      service: provider,
      provider,
      status: stats.error > stats.total * 0.5 ? 'down' : 
              stats.error > stats.total * 0.2 ? 'degraded' : 'active',
      lastChecked: new Date(),
      uptime: stats.total > 0 ? (stats.success / stats.total) * 100 : 100,
      errorCount: stats.error,
      successCount: stats.success,
      totalRequests: stats.total,
      avgLatencyMs: 0 // Would need per-service calculation
    }))

    // COUNTS: Resource availability
    const activeAI = services.filter(s => s.status === 'active' && 
      ['openrouter', 'gemini'].includes(s.provider)).length
    const exhaustedAI = services.filter(s => s.status === 'exhausted' && 
      ['openrouter', 'gemini'].includes(s.provider)).length

    const activeDB = services.filter(s => s.status === 'active' && 
      ['neon', 'supabase'].includes(s.provider)).length
    const downDB = services.filter(s => s.status === 'down' && 
      ['neon', 'supabase'].includes(s.provider)).length

    const activeStorage = services.filter(s => s.status === 'active' && 
      s.provider === 'github').length

    // OVERALL: Determine system-wide status
    const overallStatus = services.some(s => s.status === 'down') ? 'degraded' : 
                         services.some(s => s.status === 'degraded') ? 'degraded' : 'healthy'

    return {
      timestamp: new Date(),
      overallStatus,
      services,
      resources: {
        ai: { active: activeAI, exhausted: exhaustedAI, total: activeAI + exhaustedAI },
        database: { active: activeDB, down: downDB, total: activeDB + downDB },
        storage: { active: activeStorage, down: 0, total: activeStorage }
      },
      alerts: [] // Would be populated by fault detector
    }
    
  } catch (error) {
    console.error('[Monitoring] Failed to get system health:', error)
    // RETURN: Minimal healthy response on error
    return {
      timestamp: new Date(),
      overallStatus: 'down',
      services: [],
      resources: { ai: { active: 0, exhausted: 0, total: 0 }, database: { active: 0, down: 0, total: 0 }, storage: { active: 0, down: 0, total: 0 } },
      alerts: []
    }
  }
}

// ============================================================================
// MAINTENANCE
// ============================================================================

/**
 * Clear old logs (for cron job)
 * 
 * Removes logs older than specified days.
 * Called by cleanup cron job for data retention compliance.
 * 
 * @param daysOld - Delete logs older than this many days (default 30)
 * @returns Promise<number> - Number of logs deleted
 * 
 * @example
 * ```typescript
 * // Clear logs older than 30 days
 * const deleted = await clearOldLogs(30)
 * console.log(`Deleted ${deleted} old logs`)
 * ```
 */
export async function clearOldLogs(daysOld: number = 30): Promise<number> {
  try {
    // CALCULATE: Cutoff timestamp
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    
    // DELETE: Remove old entries
    const result = await prisma.serviceLog.deleteMany({
      where: { timestamp: { lt: cutoffDate } }
    })

    console.log(`[Monitoring] Cleared ${result.count} logs older than ${daysOld} days`)
    return result.count
    
  } catch (error) {
    console.error('[Monitoring] Failed to clear old logs:', error)
    return 0
  }
}

/**
 * =============================================================================
 * END OF CENTRAL MONITORING LOGGER
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */