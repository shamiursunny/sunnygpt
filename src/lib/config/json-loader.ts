/**
 * =============================================================================
 * JSON Configuration Loader - Level 1 Configuration System
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module provides Level 1 configuration loading from JSON files.
 * It reads the static configuration template (config/resources.json) that
 * defines all available resources at build/deployment time.
 * 
 * ARCHITECTURE POSITION:
 * ----------------------
 * This is the lowest priority configuration source in our 3-tier system:
 * 
 * Priority Order (Lowest to Highest):
 * 1. JSON File (this module) - Static, build-time configuration
 * 2. Environment Variables - Runtime, process-level overrides
 * 3. Database (Prisma) - Full runtime management
 * 
 * WHY JSON FIRST:
 * - Provides baseline configuration for fresh deployments
 * - Human-readable for debugging and manual editing
 * - Version controllable alongside code
 * - Fast loading without database queries
 * 
 * FUNCTIONALITY:
 * --------------
 * - Load and parse config/resources.json
 * - Cache configuration to avoid repeated file I/O
 * - Provide typed access to all configuration sections
 * - Support runtime config updates without file changes
 * - Return sensible defaults if config file missing
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { loadJSONConfig, getJSONAIProvider, getJSONSettings } from './json-loader'
 * 
 * // Load full configuration
 * const config = loadJSONConfig()
 * console.log(config.aiProviders.openrouter.accounts)
 * 
 * // Get specific provider
 * const openrouter = getJSONAIProvider('openrouter')
 * 
 * // Get settings
 * const settings = getJSONSettings()
 * ```
 * 
 * CONFIG FILE STRUCTURE:
 * ----------------------
 * config/resources.json should contain:
 * {
 *   "version": "1.0",
 *   "aiProviders": { ... },
 *   "databases": { ... },
 *   "storage": { ... },
 *   "settings": { ... }
 * }
 * 
 * DEPENDENCIES:
 * -------------
 * - fs: For file system access (Node.js only)
 * - path: For path resolution
 * - ./types: Type definitions for configuration structures
 * 
 * ERROR HANDLING:
 * ---------------
 * - Silently returns default config if file not found
 * - Logs errors to console for debugging
 * - Never throws - always returns valid configuration
 * 
 * PERFORMANCE:
 * ------------
 * - Caches parsed config in memory after first load
 * - Subsequent calls return cached version instantly
 * - Use reloadJSONConfig() to force refresh during development
 * 
 * =============================================================================
 */

import fs from 'fs'
import path from 'path'
import type { ResourcesConfig } from './types'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Path to the JSON configuration file
 * Resolved relative to current working directory
 */
const CONFIG_PATH = path.join(process.cwd(), 'config', 'resources.json')

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * In-memory cache for parsed configuration
 * Prevents repeated file I/O on every access
 * 
 * CACHE STRATEGY:
 * - Initialized as null
 * - Populated on first loadJSONConfig() call
 * - Persists for application lifetime
 * - Force refresh via reloadJSONConfig()
 */
let cachedConfig: ResourcesConfig | null = null

// ============================================================================
// MAIN LOAD FUNCTION
// ============================================================================

/**
 * Load resources from JSON config file (Level 1 Configuration)
 * 
 * This is the primary function for accessing JSON-based configuration.
 * It handles caching, error recovery, and default fallback.
 * 
 * ALGORITHM:
 * 1. Check cache - return immediately if populated
 * 2. Attempt to read config/resources.json
 * 3. Parse JSON content
 * 4. Cache and return parsed config
 * 5. On error, return default configuration
 * 
 * @returns ResourcesConfig - Complete configuration object
 * 
 * @example
 * ```typescript
 * const config = loadJSONConfig()
 * // Access AI providers
 * config.aiProviders.openrouter.accounts.forEach(account => {
 *   console.log(`Account: ${account.name}, Key: ${account.key.substring(0, 10)}...`)
 * })
 * ```
 */
export function loadJSONConfig(): ResourcesConfig {
  // RETURN CACHED: If already loaded, return immediately without file I/O
  if (cachedConfig) {
    return cachedConfig
  }

  // LOAD FILE: Attempt to read and parse the configuration file
  try {
    const fileContent = fs.readFileSync(CONFIG_PATH, 'utf-8')
    cachedConfig = JSON.parse(fileContent) as ResourcesConfig
    
    console.log('[Config] Level 1 (JSON) loaded successfully')
    return cachedConfig
    
  } catch (error) {
    // ERROR RECOVERY: Log error but don't throw - use defaults
    console.error('[Config] Failed to load JSON config:', error)
    return getDefaultConfig()
  }
}

// ============================================================================
// PROVIDER-SPECIFIC GETTERS
// ============================================================================

/**
 * Get AI provider configuration from JSON
 * 
 * Provides typed access to specific AI providers without loading
 * the entire configuration object.
 * 
 * @param provider - Provider name: 'openrouter' or 'gemini'
 * @returns AIProviderConfig or undefined if not found
 * 
 * @example
 * ```typescript
 * const openrouter = getJSONAIProvider('openrouter')
 * if (openrouter?.enabled) {
 *   console.log(`OpenRouter enabled with ${openrouter.accounts.length} accounts`)
 * }
 * ```
 */
export function getJSONAIProvider(provider: 'openrouter' | 'gemini') {
  const config = loadJSONConfig()
  return config.aiProviders[provider]
}

/**
 * Get all database configurations from JSON
 * 
 * Returns both Neon and Supabase database configurations.
 * 
 * @returns Database configuration object containing neon and supabase accounts
 * 
 * @example
 * ```typescript
 * const databases = getJSONDatabases()
 * databases.neon.accounts.forEach(db => console.log(db.name))
 * databases.supabase.accounts.forEach(db => console.log(db.url))
 * ```
 */
export function getJSONDatabases() {
  const config = loadJSONConfig()
  return config.databases
}

/**
 * Get GitHub configuration from JSON
 * 
 * Returns GitHub-specific settings including archive repository
 * and available accounts/tokens.
 * 
 * @returns GitHub configuration object
 * 
 * @example
 * ```typescript
 * const github = getJSONGitHub()
 * console.log(`Archive repo: ${github.archiveRepo}`)
 * console.log(`Accounts: ${github.accounts.length}`)
 * ```
 */
export function getJSONGitHub() {
  const config = loadJSONConfig()
  return config.storage.github
}

/**
 * Get system settings from JSON
 * 
 * Returns global system settings including memory tier durations,
 * rotation strategies, and health check intervals.
 * 
 * @returns SettingsConfig object
 * 
 * @example
 * ```typescript
 * const settings = getJSONSettings()
 * console.log(`Memory Tier 1: ${settings.memoryTier1Days} days`)
 * console.log(`Rotation: ${settings.rotationStrategy}`)
 * ```
 */
export function getJSONSettings() {
  const config = loadJSONConfig()
  return config.settings
}

// ============================================================================
// RUNTIME UPDATES
// ============================================================================

/**
 * Update JSON configuration at runtime
 * 
 * Allows runtime modification of configuration without
 * changing the underlying JSON file. Changes only affect
 * the in-memory cache.
 * 
 * @param updates - Partial configuration object with changes
 * @returns Updated ResourcesConfig
 * 
 * @example
 * ```typescript
 * // Enable a previously disabled provider
 * updateJSONConfig({
 *   aiProviders: {
 *     openrouter: { enabled: true, ... }
 *   }
 * })
 * ```
 * 
 * WARNING:
 * This does NOT persist to the JSON file. Use for temporary
 * runtime adjustments only.
 */
export function updateJSONConfig(updates: Partial<ResourcesConfig>): ResourcesConfig {
  // INITIALIZE: Ensure cache exists before updating
  if (!cachedConfig) {
    cachedConfig = loadJSONConfig()
  }
  
  // MERGE: Spread current config with updates
  cachedConfig = { ...cachedConfig, ...updates }
  return cachedConfig
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Get default configuration
 * 
 * Returns a minimal valid configuration when the JSON file
 * cannot be loaded. Used as fallback for error recovery.
 * 
 * DEFAULT VALUES:
 * - All providers disabled
 * - No accounts configured
 * - Default memory durations (7 days tier1, 30 days tier2)
 * - Sequential rotation strategy
 * - Health check every 5 minutes
 * 
 * @returns ResourcesConfig with safe default values
 * 
 * @example
 * ```typescript
 * const defaults = getDefaultConfig()
 * // All disabled, but valid structure
 * console.log(defaults.settings.memoryTier1Days) // 7
 * ```
 */
function getDefaultConfig(): ResourcesConfig {
  return {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    description: 'Default config',
    note: 'No JSON config found',
    
    // AI Providers - all disabled
    aiProviders: {
      openrouter: { 
        enabled: false, 
        rotation: 'sequential', 
        autoRotate: true, 
        accounts: [] 
      },
      gemini: { 
        enabled: false, 
        rotation: 'sequential', 
        autoRotate: true, 
        accounts: [] 
      }
    },
    
    // Databases - all disabled
    databases: {
      neon: { enabled: false, accounts: [] },
      supabase: { enabled: false, accounts: [] }
    },
    
    // Storage - GitHub disabled
    storage: {
      github: { enabled: false, archiveRepo: 'sunnygpt-archives', accounts: [] }
    },
    
    // Vercel - disabled
    vercel: { enabled: false, token: '' },
    
    // Default Settings
    settings: {
      defaultAIProvider: 'openrouter',
      rotationStrategy: 'sequential',
      memoryTier1Days: 7,
      memoryTier2Days: 30,
      healthCheckInterval: 300,
      autoFailover: true
    }
  }
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Reload JSON configuration
 * 
 * Clears the cache and reloads from file. Useful during
 * development when editing config/resources.json frequently.
 * 
 * @returns Freshly loaded ResourcesConfig
 * 
 * @example
 * ```typescript
 * // After editing config/resources.json
 * const freshConfig = reloadJSONConfig()
 * console.log('Config reloaded at', freshConfig.updatedAt)
 * ```
 */
export function reloadJSONConfig() {
  // CLEAR: Reset cache to force reload
  cachedConfig = null
  return loadJSONConfig()
}

/**
 * =============================================================================
 * END OF JSON CONFIGURATION LOADER
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */