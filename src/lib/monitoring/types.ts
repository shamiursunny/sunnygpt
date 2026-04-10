/**
 * =============================================================================
 * Monitoring Types - SunnyGPT Prime Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This file defines all TypeScript type definitions used across the
 * monitoring system. It provides type safety and documentation for
 * service logging, health checking, and system status tracking.
 * 
 * ARCHITECTURE:
 * -------------
 * The monitoring system has three main components:
 * 
 * 1. SERVICE LOGGING:
 *    - Records every service activity (requests, queries, etc.)
 *    - Provides audit trail for compliance
 *    - Enables performance analysis
 * 
 * 2. HEALTH CHECKING:
 *    - Periodic checks of all service providers
 *    - Calculates uptime and latency metrics
 *    - Detects failures and rate limiting
 * 
 * 3. SYSTEM STATUS:
 *    - Aggregates health across all services
 *    - Provides overview for dashboards
 *    - Enables alerting on issues
 * 
 * USAGE:
 * -------
 * These types are imported throughout the monitoring system:
 * 
 * ```typescript
 * import type { ServiceLog, ServiceHealth, SystemHealth, Alert } from './monitoring/types'
 * 
 * // Create a log entry
 * const log: ServiceLog = {
 *   id: 'log_123',
 *   timestamp: new Date(),
 *   service: 'openrouter-1',
 *   provider: 'openrouter',
 *   action: 'request',
 *   latencyMs: 1500,
 *   status: 'success'
 * }
 * ```
 * 
 * =============================================================================
 */

// ============================================================================
// SERVICE LOGGING TYPES
// ============================================================================

/**
 * Service Log Entry
 * 
 * Represents a single service activity for monitoring and audit.
 * Every API call, database query, and external request creates a log entry.
 * 
 * @property id - Unique log entry identifier (auto-generated)
 * @property timestamp - When the activity occurred (ISO 8601)
 * @property service - Service identifier (e.g., 'openrouter-1', 'neon-1')
 * @property provider - Provider category for grouping
 * @property action - Type of action performed
 * @property inputSize - Request size in bytes (optional, for API calls)
 * @property outputSize - Response size in bytes (optional, for API calls)
 * @property latencyMs - Total request latency in milliseconds
 * @property status - Outcome of the activity
 * @property errorMessage - Error details if failed (optional)
 * @property metadata - Additional context JSON (optional)
 * 
 * @example
 * ```typescript
 * const log: ServiceLog = {
 *   id: 'log_1700000000000_abc123',
 *   timestamp: new Date('2024-01-01T12:00:00Z'),
 *   service: 'openrouter-1',
 *   provider: 'openrouter',
 *   action: 'ai_request',
 *   inputSize: 500,
 *   outputSize: 2000,
 *   latencyMs: 1500,
 *   status: 'success',
 *   metadata: { tokensUsed: 350, model: 'openrouter/free' }
 * }
 * ```
 * 
 * SERVICE IDENTIFIERS:
 * - openrouter-1, openrouter-2, ... (AI provider accounts)
 * - gemini-1, gemini-2, ... (AI provider accounts)
 * - neon-1, neon-2, ... (Database connections)
 * - supabase-1, supabase-2, ... (Database connections)
 * - github-1, github-2, ... (Storage accounts)
 * - vercel (Vercel integration)
 * - memory (Memory system)
 * - health-check (Health check service)
 * 
 * ACTION TYPES:
 * - ai_request: AI API call
 * - query: Database query
 * - upload: File upload
 * - download: File download
 * - api_call: External API call
 * - deploy: Vercel deployment
 * - health_check: Service health verification
 * - store_memory: Memory storage operation
 * - clear_expired: Cleanup operation
 * - archive_season: Archive to GitHub
 * 
 * STATUS VALUES:
 * - success: Request completed successfully
 * - error: Request failed with error
 * - rate_limit: Provider rate limit hit
 * - timeout: Request timed out
 */
export interface ServiceLog {
  id: string
  timestamp: Date
  service: string      // 'openrouter', 'neon-1', 'supabase-1', 'github-1', 'vercel'
  provider: string     // 'openrouter' | 'gemini' | 'neon' | 'supabase' | 'github' | 'vercel'
  action: string       // 'request' | 'query' | 'upload' | 'api_call' | 'deploy'
  inputSize?: number   // Request size in bytes
  outputSize?: number  // Response size in bytes
  tokensUsed?: number  // AI tokens consumed
  latencyMs: number    // Total latency
  status: 'success' | 'error' | 'rate_limit' | 'timeout'
  errorMessage?: string
  metadata?: Record<string, any>
}

// ============================================================================
// HEALTH CHECKING TYPES
// ============================================================================

/**
 * Service Health Status
 * 
 * Represents the current health state of a service/provider.
 * Calculated from recent log entries and real-time checks.
 * 
 * @property service - Service identifier (e.g., 'openrouter-1')
 * @property provider - Provider category (e.g., 'openrouter')
 * @property status - Current state indicator
 * @property lastChecked - Timestamp of last health evaluation
 * @property latencyMs - Average latency (optional)
 * @property uptime - Percentage uptime (0-100)
 * @property errorCount - Number of errors in evaluation period
 * @property successCount - Number of successful requests
 * @property totalRequests - Total requests in evaluation period
 * @property avgLatencyMs - Average response time in milliseconds
 * @property tokensUsed - Tokens consumed (AI providers, optional)
 * @property tokensLimit - Token limit (AI providers, optional)
 * 
 * @example
 * ```typescript
 * const health: ServiceHealth = {
 *   service: 'openrouter-1',
 *   provider: 'openrouter',
 *   status: 'active',
 *   lastChecked: new Date('2024-01-01T12:00:00Z'),
 *   latencyMs: 1500,
 *   uptime: 98.5,
 *   errorCount: 3,
 *   successCount: 197,
 *   totalRequests: 200,
 *   avgLatencyMs: 1450,
 *   tokensUsed: 45000,
 *   tokensLimit: 100000
 * }
 * ```
 * 
 * STATUS DEFINITIONS:
 * -------------------
 * - active: Fully operational, handling requests normally
 * - exhausted: Usage limit reached, needs account rotation
 * - down: Connection failures, immediate attention needed
 * - rate_limited: Temporarily blocked by provider rate limit
 * - degraded: Performance degraded, error rate > 20%
 * 
 * CALCULATION METHOD:
 * -------------------
 * Health is calculated from logs within the last hour:
 * - uptime = (successCount / totalRequests) * 100
 * - avgLatency = sum(latencyMs) / totalRequests
 * - status derived from error rate and response codes
 * - If errorCount > 50% of totalRequests → status = 'down'
 * - If errorCount > 20% of totalRequests → status = 'degraded'
 */
export interface ServiceHealth {
  service: string
  provider: string
  status: 'active' | 'exhausted' | 'down' | 'rate_limited' | 'degraded'
  lastChecked: Date
  latencyMs?: number
  uptime: number       // Percentage
  errorCount: number
  successCount: number
  totalRequests: number
  avgLatencyMs: number
  tokensUsed?: number
  tokensLimit?: number
}

// ============================================================================
// SYSTEM STATUS TYPES
// ============================================================================

/**
 * Resource Metrics
 * 
 * Aggregated metrics for a specific resource.
 * Used for dashboards and reporting.
 * 
 * @property provider - Provider name
 * @property service - Service identifier
 * @property requestsTotal - Total requests made
 * @property requestsSuccess - Successful requests
 * @property requestsError - Failed requests
 * @property tokensUsed - Total tokens consumed
 * @property tokensLimit - Token limit
 * @property avgLatencyMs - Average latency
 * @property p95LatencyMs - 95th percentile latency
 * @property lastRequestAt - Last request timestamp
 * @property uptime - Uptime percentage
 */
export interface ResourceMetrics {
  provider: string
  service: string
  requestsTotal: number
  requestsSuccess: number
  requestsError: number
  tokensUsed: number
  tokensLimit: number
  avgLatencyMs: number
  p95LatencyMs: number
  lastRequestAt: Date
  uptime: number
}

/**
 * System Health Overview
 * 
 * Complete health status of the entire system.
 * Aggregates all services and provides overall status.
 * 
 * @property timestamp - When this snapshot was taken
 * @property overallStatus - Overall system status
 * @property services - Individual service health
 * @property resources - Resource counts by type
 * @property alerts - Active alerts requiring attention
 * 
 * @example
 * ```typescript
 * const systemHealth: SystemHealth = {
 *   timestamp: new Date(),
 *   overallStatus: 'healthy',
 *   services: [/* service health array *\/],
 *   resources: {
 *     ai: { active: 2, exhausted: 0, total: 2 },
 *     database: { active: 2, down: 0, total: 2 },
 *     storage: { active: 1, down: 0, total: 1 }
 *   },
 *   alerts: []
 * }
 * ```
 */
export interface SystemHealth {
  timestamp: Date
  overallStatus: 'healthy' | 'degraded' | 'down'
  services: ServiceHealth[]
  resources: {
    ai: { active: number; exhausted: number; total: number }
    database: { active: number; down: number; total: number }
    storage: { active: number; down: number; total: number }
  }
  alerts: Alert[]
}

// ============================================================================
// ALERTING TYPES
// ============================================================================

/**
 * Alert
 * 
 * Represents an active alert requiring attention.
 * Generated by fault detection and health checking.
 * 
 * @property id - Unique alert identifier
 * @property severity - Alert severity level
 * @property service - Affected service identifier
 * @property message - Human-readable alert message
 * @property timestamp - When alert was created
 * @property resolved - Whether alert has been resolved
 * 
 * @example
 * ```typescript
 * const alert: Alert = {
 *   id: 'alert_1700000000000_1',
 *   severity: 'warning',
 *   service: 'openrouter-1',
 *   message: 'Error rate exceeded 20% threshold',
 *   timestamp: new Date(),
 *   resolved: false
 * }
 * ```
 * 
 * SEVERITY LEVELS:
 * - info: Informational, no immediate action needed
 * - warning: Warning condition, monitor closely
 * - error: Error condition, requires attention
 * - critical: Critical condition, immediate action required
 */
export interface Alert {
  id: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  service: string
  message: string
  timestamp: Date
  resolved: boolean
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Monitoring Dashboard Data
 * 
 * Pre-aggregated data for dashboard display.
 * Includes metrics, charts, and alerts.
 * 
 * @property period - Time period for this data
 * @property metrics - Summary metrics
 * @property serviceMetrics - Per-service health
 * @property alerts - Active alerts
 * @property topServices - Most active services
 * @property latencyChart - Latency over time
 * 
 * PERIOD VALUES:
 * - hour: Last hour
 * - day: Last 24 hours
 * - week: Last 7 days
 * - month: Last 30 days
 */
export interface DashboardData {
  period: 'hour' | 'day' | 'week' | 'month'
  metrics: {
    totalRequests: number
    totalTokens: number
    avgLatency: number
    errorRate: number
    uptime: number
  }
  serviceMetrics: ServiceHealth[]
  alerts: Alert[]
  topServices: { service: string; requests: number }[]
  latencyChart: { time: string; latency: number }[]
}

/**
 * Log Filter Options
 * 
 * Parameters for filtering service logs.
 * 
 * @property provider - Filter by provider
 * @property service - Filter by service
 * @property status - Filter by status
 * @property startDate - Filter start date
 * @property endDate - Filter end date
 * @property limit - Maximum results to return
 */
export interface LogFilter {
  provider?: string
  service?: string
  status?: 'success' | 'error' | 'rate_limit' | 'timeout'
  startDate?: Date
  endDate?: Date
  limit?: number
}

/**
 * =============================================================================
 * END OF MONITORING TYPES
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */