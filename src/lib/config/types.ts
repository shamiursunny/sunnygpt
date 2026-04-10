/**
 * =============================================================================
 * Configuration Types - SunnyGPT Prime Edition
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
 * configuration system. It serves as the single source of truth for all
 * data structures related to resource management, monitoring, and service
 * health tracking.
 * 
 * ARCHITECTURE OVERVIEW:
 * ----------------------
 * The configuration system uses a 3-tier priority model:
 * 
 * Tier 1 (JSON):   config/resources.json - Static configuration
 * Tier 2 (ENV):    Environment variables - Process-level config  
 * Tier 3 (DB):     Database (Prisma) - Runtime config management
 * 
 * USAGE:
 * -------
 * These types are imported throughout the configuration system to ensure
 * type safety and consistency across all loaders and registries.
 * 
 * ```typescript
 * import type { AIProviderConfig, AIAccount, ResourcesConfig } from './config/types'
 * ```
 * 
 * =============================================================================
 */

import type { AIAccount as AIAccountType } from './types'

// ============================================================================
// AI PROVIDER CONFIGURATION
// ============================================================================

/**
 * AI Provider Configuration
 * 
 * Defines the structure for AI service providers (OpenRouter, Gemini, etc.)
 * Each provider can have multiple accounts for horizontal scaling.
 * 
 * @property enabled - Whether this provider is active
 * @property rotation - Strategy for selecting next account: 'sequential' | 'random' | 'failover'
 * @property autoRotate - Automatically switch accounts on rate limit
 * @property accounts - Array of AI account configurations
 * 
 * EXAMPLE:
 * ```typescript
 * const config: AIProviderConfig = {
 *   enabled: true,
 *   rotation: 'sequential',
 *   autoRotate: true,
 *   accounts: [
 *     { key: 'sk-or-v1-xxx', name: 'account-1', limit: 100000, used: 50000, active: true }
 *   ]
 * }
 * ```
 */
export interface AIProviderConfig {
  enabled: boolean
  rotation: 'sequential' | 'random' | 'failover'
  autoRotate: boolean
  accounts: AIAccount[]
}

/**
 * Individual AI Account
 * 
 * Represents a single AI API key/credential with usage tracking.
 * Used for multi-account pooling and automatic failover.
 * 
 * @property key - The API key for authentication
 * @property name - Unique identifier for this account
 * @property limit - Maximum tokens/requests allowed per period
 * @property used - Current usage counter
 * @property active - Whether this account is available for requests
 * 
 * BUSINESS LOGIC:
 * - When 'used' reaches 'limit', account is marked inactive automatically
 * - Active accounts are used for requests; inactive are skipped
 * - Multiple accounts enable horizontal scaling without upgrades
 * 
 * COMPLIANCE:
 * - Keys are masked in logs for security
 * - Usage is tracked per-account for audit trails
 * - Rate limits are respected per provider requirements
 */
export interface AIAccount {
  key: string
  name: string
  limit: number
  used: number
  active: boolean
}

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

/**
 * Neon Database Configuration
 * 
 * Configuration for Neon PostgreSQL database instances.
 * Neon provides serverless PostgreSQL with auto-scaling.
 * 
 * @property url - Full PostgreSQL connection string
 * @property name - Unique identifier for this database instance
 * @property active - Whether this database is currently connectable
 * 
 * USAGE:
 * Multiple Neon instances can be configured for:
 * - Different environments (dev/staging/prod)
 * - Geographic distribution
 * - Load balancing across regions
 * 
 * SECURITY:
 * - Connection strings should never be committed to version control
 * - Use environment variables or secrets management
 */
export interface NeonConfig {
  enabled: boolean
  accounts: NeonAccount[]
}

/**
 * Individual Neon Database Account
 */
export interface NeonAccount {
  url: string
  name: string
  active: boolean
}

/**
 * Supabase Configuration
 * 
 * Configuration for Supabase projects (PostgreSQL + Auth + Storage).
 * Supabase provides a complete backend-as-a-service solution.
 * 
 * @property url - Supabase project URL
 * @property anonKey - Public anonymous access key (client-side)
 * @property serviceKey - Private service role key (server-side, optional)
 * @property name - Unique identifier for this project
 * @property active - Whether this project is available
 * 
 * FEATURES:
 * - PostgreSQL database with real-time subscriptions
 * - Built-in authentication (email, OAuth, magic links)
 * - Object storage for files
 * - Edge functions for serverless compute
 */
export interface SupabaseConfig {
  enabled: boolean
  accounts: SupabaseAccount[]
}

/**
 * Individual Supabase Account
 */
export interface SupabaseAccount {
  url: string
  anonKey: string
  serviceKey?: string
  name: string
  active: boolean
}

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

/**
 * GitHub Configuration
 * 
 * Configuration for GitHub API access and archive repository.
 * GitHub serves as Tier 3 permanent storage for chat history.
 * 
 * @property enabled - Whether GitHub integration is active
 * @property archiveRepo - Repository name for season archives
 * @property accounts - Array of GitHub tokens/accounts
 * 
 * ARCHITECTURE:
 * - Seasons are archived as GitHub Issues
 * - JSON payload contains full conversation history
 * - Labels: sunnygpt-archive, chat-history, season
 * 
 * SECURITY:
 * - Tokens require 'repo' scope for issue creation
 * - Store in environment variables, never commit
 * - Rotate tokens periodically
 */
export interface GitHubConfig {
  enabled: boolean
  archiveRepo: string
  accounts: GitHubAccount[]
}

/**
 * Individual GitHub Account
 */
export interface GitHubAccount {
  token: string
  name: string
  active: boolean
}

/**
 * Vercel Configuration
 * 
 * Configuration for Vercel deployment and cron jobs.
 * Vercel handles hosting, serverless functions, and scheduled tasks.
 * 
 * @property enabled - Whether Vercel integration is active
 * @property token - Vercel API token for deployment management
 */
export interface VercelConfig {
  enabled: boolean
  token: string
}

// ============================================================================
// SETTINGS CONFIGURATION
// ============================================================================

/**
 * System Settings Configuration
 * 
 * Global settings that control system behavior across all components.
 * These can be overridden at any configuration level.
 * 
 * @property defaultAIProvider - Primary AI provider when multiple available
 * @property rotationStrategy - How to select from multiple accounts
 * @property memoryTier1Days - How long Neon memories last (7 days)
 * @property memoryTier2Days - How long Supabase seasons last (30 days)
 * @property healthCheckInterval - Milliseconds between health checks (300s)
 * @property autoFailover - Automatically switch providers on failure
 * 
 * BUSINESS LOGIC:
 * - Memory tiers implement data lifecycle:
 *   Tier 1 (Neon): Active conversations, 7-day TTL, auto-cleanup
 *   Tier 2 (Supabase): Seasonal backup, 30-day retention
 *   Tier 3 (GitHub): Permanent archive, unlimited retention
 * 
 * COMPLIANCE:
 * - Data retention policies configurable per tier
 * - Automatic cleanup ensures GDPR compliance
 * - Audit trail maintained in ServiceLog
 */
export interface SettingsConfig {
  defaultAIProvider: string
  rotationStrategy: 'sequential' | 'random' | 'failover'
  memoryTier1Days: number
  memoryTier2Days: number
  healthCheckInterval: number
  autoFailover: boolean
}

// ============================================================================
// MASTER CONFIGURATION
// ============================================================================

/**
 * Resources Configuration
 * 
 * The complete configuration object that combines all providers,
 * databases, storage, and settings into a single structure.
 * This is the main configuration loaded from JSON files.
 * 
 * @property version - Configuration version for migration tracking
 * @property updatedAt - Last modification timestamp
 * @property description - Human-readable config description
 * @property note - Additional notes for operators
 * @property aiProviders - All AI provider configurations
 * @property databases - All database configurations
 * @property storage - All storage configurations
 * @property vercel - Vercel configuration
 * @property settings - Global system settings
 * 
 * EXAMPLE:
 * ```json
 * {
 *   "version": "1.0",
 *   "aiProviders": {
 *     "openrouter": { "enabled": true, "accounts": [...] },
 *     "gemini": { "enabled": true, "accounts": [...] }
 *   }
 * }
 * ```
 */
export interface ResourcesConfig {
  version: string
  updatedAt: string
  description: string
  note: string
  aiProviders: {
    openrouter: AIProviderConfig
    gemini: AIProviderConfig
  }
  databases: {
    neon: NeonConfig
    supabase: SupabaseConfig
  }
  storage: {
    github: GitHubConfig
  }
  vercel: VercelConfig
  settings: SettingsConfig
}

// ============================================================================
// DATABASE RESOURCE MODELS (LEVEL 3)
// ============================================================================

/**
 * Database Resource (Runtime-managed)
 * 
 * Represents a resource stored in the database (Prisma) for runtime
 * management. This enables adding/removing resources without deployment.
 * 
 * @property id - Unique identifier (CUID)
 * @property type - Resource category: 'ai' | 'database' | 'storage'
 * @property provider - Specific provider: 'openrouter', 'neon', 'supabase', 'github'
 * @property name - Human-readable name for display
 * @property config - Provider-specific configuration (JSON)
 * @property used - Usage counter (tokens, queries, etc.)
 * @property limit - Maximum allowed usage before auto-disable
 * @property level - Configuration level (1=json, 2=env, 3=db)
 * @property active - Whether resource is currently available
 * @property priority - Selection priority (higher = preferred)
 * @property createdAt - Resource creation timestamp
 * 
 * USAGE:
 * - Level 3 resources override Level 1 and Level 2
 * - Can be added/updated via API at runtime
 * - Automatically disabled when usage exceeds limit
 * 
 * EXAMPLE:
 * ```typescript
 * const resource = await prisma.resource.create({
 *   data: {
 *     type: 'ai',
 *     provider: 'openrouter',
 *     name: 'account-2',
 *     config: { key: 'sk-or-v1-xxx' },
 *     used: 0,
 *     limit: 100000,
 *     level: 3,
 *     active: true,
 *     priority: 1
 *   }
 * })
 * ```
 */
export interface DBResource {
  id: string
  type: 'ai' | 'database' | 'storage'
  provider: string // 'openrouter' | 'gemini' | 'neon' | 'supabase' | 'github'
  name: string
  config: Record<string, any>
  used: number
  limit: number
  level: number // 1=json, 2=env, 3=db
  active: boolean
  createdAt: Date
}

// ============================================================================
// SERVICE LOGGING TYPES
// ============================================================================

/**
 * Service Log Entry
 * 
 * Represents a single service activity for monitoring and audit.
 * All API calls, database queries, and external requests are logged.
 * 
 * @property id - Unique log entry identifier
 * @property timestamp - When the activity occurred
 * @property service - Service identifier (e.g., 'openrouter-1', 'neon-1')
 * @property provider - Provider category
 * @property action - Type of action performed
 * @property inputSize - Request size in bytes (optional)
 * @property outputSize - Response size in bytes (optional)
 * @property latencyMs - Total request latency in milliseconds
 * @property status - Outcome: 'success' | 'error' | 'rate_limit' | 'timeout'
 * @property errorMessage - Error details if failed (optional)
 * @property metadata - Additional context (JSON, optional)
 * 
 * MONITORING:
 * - Logs are used for real-time health monitoring
 * - Aggregated for uptime calculations
 * - Archived after 30 days for compliance
 * 
 * RETENTION:
 * - Active logs kept in database for 30 days
 * - Older logs automatically cleaned up by cron
 * - Can be exported to external logging for long-term storage
 */
export interface ServiceLogEntry {
  id: string
  timestamp: Date
  service: string
  provider: string
  action: string
  inputSize?: number
  outputSize?: number
  latencyMs: number
  status: 'success' | 'error' | 'rate_limit' | 'timeout'
  errorMessage?: string
  metadata?: Record<string, any>
}

// ============================================================================
// SERVICE HEALTH TYPES
// ============================================================================

/**
 * Service Health Status
 * 
 * Represents the current health state of a service/provider.
 * Calculated from recent log entries and real-time checks.
 * 
 * @property service - Service identifier
 * @property provider - Provider category
 * @property status - Current state: 'active' | 'exhausted' | 'down' | 'rate_limited'
 * @property lastChecked - Timestamp of last health evaluation
 * @property latencyMs - Average latency (optional)
 * @property uptime - Percentage uptime (0-100)
 * @property errorCount - Number of errors in evaluation period
 * @property successCount - Number of successful requests
 * @property totalRequests - Total requests in period
 * @property avgLatencyMs - Average response time
 * @property tokensUsed - Tokens consumed (AI providers)
 * @property tokensLimit - Token limit (AI providers)
 * 
 * STATUS DEFINITIONS:
 * - active: Fully operational, handling requests
 * - exhausted: Usage limit reached, needs rotation
 * - down: Connection failures, needs investigation
 * - rate_limited: Temporarily blocked by provider
 * 
 * CALCULATION:
 * Health is calculated from logs within the last hour:
 * - uptime = (success / total) * 100
 * - avgLatency = sum(latency) / count
 * - status derived from error rate and response codes
 */
export interface ServiceHealth {
  service: string
  provider: string
  status: 'active' | 'exhausted' | 'down' | 'rate_limited' | 'degraded'
  lastChecked: Date
  latencyMs?: number
  uptime: number // Percentage
  errorCount: number
  successCount: number
  totalRequests: number
  avgLatencyMs: number
  tokensUsed?: number
  tokensLimit?: number
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { AIAccountType }

/**
 * =============================================================================
 * END OF CONFIGURATION TYPES
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */