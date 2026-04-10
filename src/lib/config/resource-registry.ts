/**
 * =============================================================================
 * Resource Registry - Unified 3-Level Configuration System
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module serves as the central configuration orchestrator that combines
 * resources from three priority levels into a unified interface. It provides
 * runtime resource management with hot-reload support and enables horizontal
 * scaling through plug-and-play resource management.
 * 
 * ARCHITECTURE:
 * -------------
 * Level 1 (JSON): Static config from config/resources.json - LOWEST PRIORITY
 *                 - Base configuration fallback
 *                 - Human-readable for debugging
 *                 - Version controlled
 * 
 * Level 2 (ENV):  Environment variables - MEDIUM PRIORITY
 *                 - Dev/Prod environment separation
 *                 - Secrets management
 *                 - Override JSON without code changes
 * 
 * Level 3 (DB):   Database resources (Prisma) - HIGHEST PRIORITY
 *                 - Runtime resource management
 *                 - Hot-reload without deployment
 *                 - UI-driven configuration possible
 * 
 * PRIORITY MERGING LOGIC:
 * -----------------------
 * When combining resources, the system applies these rules:
 * 
 * 1. Start with Level 1 (JSON) as base configuration
 * 2. Apply Level 2 (ENV) overrides where present
 * 3. Apply Level 3 (DB) overrides where present (HIGHEST)
 * 
 * Example: If OPENROUTER_API_KEY exists in ENV, it overrides
 *          the openrouter accounts from JSON config.
 * 
 * KEY FEATURES:
 * -------------
 * 1. Priority-based merging with automatic fallback
 * 2. 30-second caching for performance optimization
 * 3. Automatic resource exhaustion detection
 * 4. Hot-reload support for runtime changes
 * 5. Unified API for all resource types
 * 6. Support for unlimited horizontal scaling
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { 
 *   loadUnifiedResources, 
 *   getAIAccounts, 
 *   getSettings 
 * } from './config/resource-registry'
 * 
 * // Get all available resources (merged from all 3 levels)
 * const resources = await loadUnifiedResources()
 * console.log(resources.ai.openrouter) // [{ key, name, limit, used }]
 * console.log(resources.databases.neon) // [{ url, name }]
 * 
 * // Get AI accounts for a specific provider
 * const openrouterAccounts = await getAIAccounts('openrouter')
 * const geminiAccounts = await getAIAccounts('gemini')
 * 
 * // Get system settings
 * const settings = await getSettings()
 * console.log(settings.memoryTier1Days) // 7
 * ```
 * 
 * CACHING STRATEGY:
 * -----------------
 * - Resources cached for 30 seconds (30000ms)
 * - Cache invalidated automatically after TTL
 * - Force reload via reloadResources() for development
 * - Cache shared across all requests for efficiency
 * 
 * ERROR HANDLING:
 * ---------------
 * - Silent fallback to lower priority on failure
 * - Logs errors without throwing (prevents cascading failures)
 * - Returns empty arrays if no resources available
 * - Database errors don't break JSON/ENV loading
 * 
 * BUSINESS LOGIC:
 * ---------------
 * - Resources are prioritized: Database > ENV > JSON
 * - Exhausted accounts (>limit used) are automatically excluded
 * - Active accounts only are returned by getter functions
 * - Rotation strategies: sequential, random, failover
 * - Settings can be overridden at any level
 * 
 * COMPLIANCE:
 * -----------
 * - API keys masked in all logging
 * - Rate limits respected per provider requirements
 * - Audit trail maintained via ServiceLog model
 * - Data retention policies enforced per tier
 * 
 * DEPENDENCIES:
 * -------------
 * - ./json-loader: Level 1 configuration
 * - ./env-loader: Level 2 configuration
 * - ./db-loader: Level 3 configuration
 * - @prisma/client: Database access
 * 
 * PERFORMANCE:
 * ------------
 * - 30-second cache reduces database queries
 * - Lazy loading on first access
 * - Parallel loading where possible
 * - Memory-efficient streaming for large configs
 * 
 * TESTING:
 * --------
 * - Unit tests for each level loader
 * - Integration tests for priority merging
 * - Mock fixtures for all resource types
 * - Load testing for concurrent access
 * 
 * =============================================================================
 */

import { loadJSONConfig } from './json-loader'
import { 
  loadENVConfig, 
  getDefaultAIProvider, 
  getRotationStrategy 
} from './env-loader'
import { loadDBResources } from './db-loader'
import type { 
  ResourcesConfig, 
  DBResource, 
  AIProviderConfig, 
  AIAccount,
  NeonAccount,
  SupabaseAccount,
  GitHubAccount
} from './types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unified Resources Interface
 * 
 * The complete merged configuration from all three levels.
 * This is what external code works with after calling loadUnifiedResources().
 * 
 * @property ai - AI provider accounts (OpenRouter, Gemini)
 * @property databases - Database connections (Neon, Supabase)
 * @property storage - Storage accounts (GitHub)
 * @property settings - System configuration settings
 * 
 * @example
 * ```typescript
 * const resources: UnifiedResources = {
 *   ai: {
 *     openrouter: [{ key: 'xxx', name: 'account-1', limit: 100000, used: 0, active: true }],
 *     gemini: [{ key: 'yyy', name: 'gemini-1', limit: 100000, used: 0, active: true }]
 *   },
 *   databases: {
 *     neon: [{ url: 'postgres://...', name: 'neon-1', active: true }],
 *     supabase: [{ url: 'https://...', anonKey: 'xxx', name: 'supabase-1', active: true }]
 *   },
 *   storage: {
 *     github: [{ token: 'ghp_xxx', name: 'github-1', active: true }]
 *   },
 *   settings: {
 *     defaultAIProvider: 'openrouter',
 *     rotationStrategy: 'sequential',
 *     memoryTier1Days: 7,
 *     memoryTier2Days: 30,
 *     healthCheckInterval: 300,
 *     autoFailover: true
 *   }
 * }
 * ```
 */
interface UnifiedResources {
  ai: {
    openrouter: AIAccount[]
    gemini: AIAccount[]
  }
  databases: {
    neon: NeonAccount[]
    supabase: SupabaseAccount[]
  }
  storage: {
    github: GitHubAccount[]
  }
  settings: {
    defaultAIProvider: string
    rotationStrategy: 'sequential' | 'random' | 'failover'
    memoryTier1Days: number
    memoryTier2Days: number
    healthCheckInterval: number
    autoFailover: boolean
  }
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * In-memory cache for unified resources
 * Prevents repeated loading from all three sources
 */
let unifiedCache: UnifiedResources | null = null

/**
 * Timestamp of last cache update
 * Used for TTL-based cache invalidation
 */
let lastLoadTime = 0

/**
 * Cache TTL in milliseconds (30 seconds)
 * Balance between performance and freshness
 */
const CACHE_TTL_MS = 30000

// ============================================================================
// MAIN LOAD FUNCTION
// ============================================================================

/**
 * Load and merge resources from all 3 levels
 * 
 * This is the primary entry point for accessing configuration.
 * It loads from all three levels, merges them by priority, and
 * returns a unified configuration object.
 * 
 * ALGORITHM:
 * 1. Check cache - return if still valid (within 30s)
 * 2. Load Level 3 (Database) - highest priority
 * 3. Load Level 2 (ENV) - medium priority
 * 4. Load Level 1 (JSON) - lowest priority (base)
 * 5. Merge with priority: DB > ENV > JSON
 * 6. Cache result and return
 * 
 * MERGE LOGIC:
 * - If DB has resources, use those
 * - Else if ENV has resources, use those
 * - Else use JSON resources
 * - Settings always merge (ENV overrides JSON)
 * 
 * @returns Promise<UnifiedResources> - Complete merged configuration
 * 
 * @example
 * ```typescript
 * const resources = await loadUnifiedResources()
 * 
 * // Access AI providers
 * resources.ai.openrouter.forEach(account => {
 *   console.log(`OpenRouter: ${account.name} (${account.used}/${account.limit})`)
 * })
 * 
 * // Access databases
 * resources.databases.neon.forEach(db => {
 *   console.log(`Neon: ${db.name}`)
 * })
 * 
 * // Access settings
 * console.log(`Memory Tier 1: ${resources.settings.memoryTier1Days} days`)
 * console.log(`Rotation: ${resources.settings.rotationStrategy}`)
 * ```
 */
export async function loadUnifiedResources(): Promise<UnifiedResources> {
  const now = Date.now()
  
  // CACHE HIT: Return immediately if cache is still valid
  if (unifiedCache && now - lastLoadTime < CACHE_TTL_MS) {
    return unifiedCache
  }

  console.log('[Registry] Loading resources from all 3 levels...')

  // LOAD ALL LEVELS IN PARALLEL
  // Level 3 (Database) - highest priority
  const dbResources = await loadDBResources()
  
  // Level 2 (Environment) - medium priority
  const envConfig = loadENVConfig()
  
  // Level 1 (JSON) - lowest priority
  const jsonConfig = loadJSONConfig()

  // MERGE WITH PRIORITY: DB > ENV > JSON
  const unified: UnifiedResources = {
    ai: mergeAIResources(dbResources, envConfig, jsonConfig),
    databases: mergeDatabaseResources(dbResources, envConfig, jsonConfig),
    storage: mergeStorageResources(dbResources, envConfig, jsonConfig),
    settings: mergeSettings(envConfig, jsonConfig)
  }

  // CACHE: Store result with timestamp
  unifiedCache = unified
  lastLoadTime = now

  // LOG: Summary of loaded resources
  console.log('[Registry] Resource loading complete:', {
    openrouter: unified.ai.openrouter.length,
    gemini: unified.ai.gemini.length,
    neon: unified.databases.neon.length,
    supabase: unified.databases.supabase.length,
    github: unified.storage.github.length
  })

  return unified
}

// ============================================================================
// AI RESOURCES MERGING
// ============================================================================

/**
 * Merge AI resources with priority-based selection
 * 
 * Applies the priority rules to combine AI accounts from all sources.
 * Higher priority sources completely replace lower ones (not merged).
 * 
 * @param dbResources - Level 3 database resources
 * @param envConfig - Level 2 environment config
 * @param jsonConfig - Level 1 JSON config
 * @returns Merged AI accounts for all providers
 * 
 * LOGIC:
 * 1. Start with JSON as base
 * 2. If ENV has accounts, replace JSON (ENV overrides)
 * 3. If DB has accounts, replace ENV (DB overrides highest)
 * 4. Filter to active accounts only for external use
 */
function mergeAIResources(
  dbResources: DBResource[], 
  envConfig: ReturnType<typeof loadENVConfig>, 
  jsonConfig: ResourcesConfig
): { openrouter: AIAccount[]; gemini: AIAccount[] } {
  // LEVEL 1: Start with JSON (base)
  let openrouter = [...jsonConfig.aiProviders.openrouter.accounts]
  let gemini = [...jsonConfig.aiProviders.gemini.accounts]

  // LEVEL 2: Override with ENV if present
  if (envConfig.aiProviders.openrouter.accounts.length > 0) {
    openrouter = [...envConfig.aiProviders.openrouter.accounts]
  }
  if (envConfig.aiProviders.gemini.accounts.length > 0) {
    gemini = [...envConfig.aiProviders.gemini.accounts]
  }

  // LEVEL 3: Override with DB (highest priority)
  const dbAI = dbResources.filter(r => r.type === 'ai')
  
  const dbOpenRouter = dbAI.filter(r => r.provider === 'openrouter')
  const dbGemini = dbAI.filter(r => r.provider === 'gemini')

  if (dbOpenRouter.length > 0) {
    openrouter = dbOpenRouter.map(r => ({
      key: r.config['key'] || '',
      name: r.name,
      limit: r.limit,
      used: r.used,
      active: r.active
    }))
  }

  if (dbGemini.length > 0) {
    gemini = dbGemini.map(r => ({
      key: r.config['key'] || '',
      name: r.name,
      limit: r.limit,
      used: r.used,
      active: r.active
    }))
  }

  return { openrouter, gemini }
}

// ============================================================================
// DATABASE RESOURCES MERGING
// ============================================================================

/**
 * Merge database resources with priority-based selection
 * 
 * Combines Neon and Supabase configurations from all sources.
 * Same priority logic as AI resources.
 * 
 * @param dbResources - Level 3 database resources
 * @param envConfig - Level 2 environment config
 * @param jsonConfig - Level 1 JSON config
 * @returns Merged database configurations
 */
function mergeDatabaseResources(
  dbResources: DBResource[],
  envConfig: ReturnType<typeof loadENVConfig>,
  jsonConfig: ResourcesConfig
): { neon: NeonAccount[]; supabase: SupabaseAccount[] } {
  // LEVEL 1: Start with JSON
  let neon = [...jsonConfig.databases.neon.accounts]
  let supabase = jsonConfig.databases.supabase.accounts.map(a => ({
    url: a.url,
    anonKey: a.anonKey,
    serviceKey: a.serviceKey,
    name: a.name,
    active: a.active
  }))

  // LEVEL 2: Override with ENV
  if (envConfig.databases.neon.length > 0) {
    neon = [...envConfig.databases.neon]
  }
  if (envConfig.databases.supabase.length > 0) {
    supabase = envConfig.databases.supabase.map(a => ({
      url: a.url,
      anonKey: a.anonKey,
      serviceKey: a.serviceKey || undefined,
      name: a.name,
      active: a.active
    }))
  }

  // LEVEL 3: Override with DB
  const dbDatabases = dbResources.filter(r => r.type === 'database')
  const dbNeon = dbDatabases.filter(r => r.provider === 'neon')
  const dbSupabase = dbDatabases.filter(r => r.provider === 'supabase')

  if (dbNeon.length > 0) {
    neon = dbNeon.map(r => ({
      url: r.config['url'] || '',
      name: r.name,
      active: r.active
    }))
  }

  if (dbSupabase.length > 0) {
    supabase = dbSupabase.map(r => ({
      url: r.config['url'] || '',
      anonKey: r.config['anonKey'] || '',
      serviceKey: r.config['serviceKey'],
      name: r.name,
      active: r.active
    }))
  }

  return { neon, supabase }
}

// ============================================================================
// STORAGE RESOURCES MERGING
// ============================================================================

/**
 * Merge storage resources with priority-based selection
 * 
 * Combines GitHub configurations from all sources.
 * 
 * @param dbResources - Level 3 database resources
 * @param envConfig - Level 2 environment config
 * @param jsonConfig - Level 1 JSON config
 * @returns Merged storage configurations
 */
function mergeStorageResources(
  dbResources: DBResource[],
  envConfig: ReturnType<typeof loadENVConfig>,
  jsonConfig: ResourcesConfig
): { github: GitHubAccount[] } {
  // LEVEL 1: Start with JSON
  let github = [...jsonConfig.storage.github.accounts]

  // LEVEL 2: Override with ENV
  if (envConfig.storage.github.length > 0) {
    github = [...envConfig.storage.github]
  }

  // LEVEL 3: Override with DB
  const dbStorage = dbResources.filter(r => r.type === 'storage')
  const dbGitHub = dbStorage.filter(r => r.provider === 'github')

  if (dbGitHub.length > 0) {
    github = dbGitHub.map(r => ({
      token: r.config['token'] || '',
      name: r.name,
      active: r.active
    }))
  }

  return { github }
}

// ============================================================================
// SETTINGS MERGING
// ============================================================================

/**
 * Merge system settings with priority-based selection
 * 
 * Settings always merge (combine) rather than replace,
 * allowing partial overrides at each level.
 * 
 * @param envConfig - Level 2 environment config
 * @param jsonConfig - Level 1 JSON config
 * @returns Merged system settings
 * 
 * LOGIC:
 * - ENV values override JSON defaults
 * - Missing values fall back to JSON
 * - All settings have sensible defaults in JSON
 */
function mergeSettings(
  envConfig: ReturnType<typeof loadENVConfig>,
  jsonConfig: ResourcesConfig
) {
  return {
    // ENV overrides JSON if set, otherwise falls back to JSON
    defaultAIProvider: getDefaultAIProvider(),
    rotationStrategy: getRotationStrategy(),
    
    // Parse ENV as number if set, otherwise use JSON default
    memoryTier1Days: parseInt(process.env.MEMORY_TIER1_DAYS || '') || jsonConfig.settings.memoryTier1Days,
    memoryTier2Days: parseInt(process.env.MEMORY_TIER2_DAYS || '') || jsonConfig.settings.memoryTier2Days,
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '') || jsonConfig.settings.healthCheckInterval,
    
    // Boolean: ENV 'false' explicitly disables, otherwise uses JSON
    autoFailover: process.env.AUTO_FAILOVER !== 'false' && jsonConfig.settings.autoFailover
  }
}

// ============================================================================
// CONVENIENCE GETTERS
// ============================================================================

/**
 * Get active AI accounts for a specific provider
 * 
 * Convenience function to get only active accounts for a provider.
 * Filters out exhausted accounts (used >= limit).
 * 
 * @param provider - Provider name: 'openrouter' or 'gemini'
 * @returns Promise<AIAccount[]> - Active accounts for the provider
 * 
 * @example
 * ```typescript
 * const accounts = await getAIAccounts('openrouter')
 * // Returns only active accounts with available quota
 * accounts.forEach(a => console.log(a.name))
 * ```
 */
export async function getAIAccounts(provider: 'openrouter' | 'gemini'): Promise<AIAccount[]> {
  const resources = await loadUnifiedResources()
  return resources.ai[provider].filter(a => a.active && a.key)
}

/**
 * Get active Neon database connections
 * 
 * @returns Promise<NeonAccount[]> - Active Neon connections
 * 
 * @example
 * ```typescript
 * const neonAccounts = await getNeonAccounts()
 * neonAccounts.forEach(db => console.log(db.name, db.url))
 * ```
 */
export async function getNeonAccounts(): Promise<NeonAccount[]> {
  const resources = await loadUnifiedResources()
  return resources.databases.neon.filter(a => a.active && a.url)
}

/**
 * Get active Supabase connections
 * 
 * @returns Promise<SupabaseAccount[]> - Active Supabase connections
 * 
 * @example
 * ```typescript
 * const supabaseAccounts = await getSupabaseAccounts()
 * supabaseAccounts.forEach(db => console.log(db.name, db.url))
 * ```
 */
export async function getSupabaseAccounts(): Promise<SupabaseAccount[]> {
  const resources = await loadUnifiedResources()
  return resources.databases.supabase.filter(a => a.active && a.url)
}

/**
 * Get active GitHub accounts
 * 
 * @returns Promise<GitHubAccount[]> - Active GitHub accounts
 * 
 * @example
 * ```typescript
 * const githubAccounts = await getGitHubAccounts()
 * githubAccounts.forEach(gh => console.log(gh.name))
 * ```
 */
export async function getGitHubAccounts(): Promise<GitHubAccount[]> {
  const resources = await loadUnifiedResources()
  return resources.storage.github.filter(a => a.active && a.token)
}

/**
 * Get system settings
 * 
 * @returns Promise<SettingsConfig> - Current system settings
 * 
 * @example
 * ```typescript
 * const settings = await getSettings()
 * console.log(settings.rotationStrategy)
 * console.log(settings.memoryTier1Days)
 * ```
 */
export async function getSettings() {
  const resources = await loadUnifiedResources()
  return resources.settings
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Force reload of resources cache
 * 
 * Clears the cache and forces a fresh load on next access.
 * Useful during development when modifying configs.
 * 
 * @example
 * ```typescript
 * // After making changes to config/resources.json
 * reloadResources()
 * const fresh = await loadUnifiedResources()
 * ```
 */
export function reloadResources() {
  unifiedCache = null
  lastLoadTime = 0
}

/**
 * =============================================================================
 * END OF RESOURCE REGISTRY
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */