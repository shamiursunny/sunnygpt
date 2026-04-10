/**
 * =============================================================================
 * Environment Variable Loader - Level 2 Configuration System
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module provides Level 2 configuration loading from environment variables.
 * Environment variables provide runtime overrides for any configuration option
 * defined in the JSON file, enabling environment-specific customization without
 * code changes.
 * 
 * ARCHITECTURE POSITION:
 * ----------------------
 * This is the medium priority configuration source in our 3-tier system:
 * 
 * Priority Order (Lowest to Highest):
 * 1. JSON File (config/resources.json) - Static, build-time
 * 2. Environment Variables (this module) - Runtime overrides
 * 3. Database (Prisma) - Full runtime management
 * 
 * WHY ENV SECOND:
 * - Override JSON values without rebuilding
 * - Separate dev/staging/production configs
 * - Secrets management (API keys, tokens)
 * - 12-Factor App compliance
 * 
 * ENVIRONMENT VARIABLE NAMING:
 * ----------------------------
 * The system supports both single and multiple configurations:
 * 
 * Single (current setup):
 *   - GEMINI_API_KEY=xxx
 *   - OPENROUTER_API_KEY=xxx
 * 
 * Multiple (scaling):
 *   - OPENROUTER_KEY_1=xxx
 *   - OPENROUTER_KEY_2=xxx
 *   - GEMINI_KEY_1=xxx
 *   - GEMINI_KEY_2=xxx
 * 
 * KEY PATTERNS:
 * - AI Providers: {PROVIDER}_KEY_{N}, {PROVIDER}_LIMIT
 * - Databases: {DB}_URL_{N}, {DB}_ANON_KEY_{N}
 * - GitHub: GITHUB_TOKEN_{N}, GITHUB_REPO_{N}
 * - Settings: Various system settings
 * 
 * FUNCTIONALITY:
 * --------------
 * - Parse numbered environment variables (KEY_1, KEY_2, etc.)
 * - Support both single and multiple configurations
 * - Provide sensible defaults when vars not set
 * - Convert string values to appropriate types
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { loadENVConfig, getGitHubArchiveRepo, getVercelToken } from './env-loader'
 * 
 * // Load all environment-based resources
 * const envConfig = loadENVConfig()
 * console.log(envConfig.aiProviders.openrouter.accounts)
 * 
 * // Get specific values
 * const archiveRepo = getGitHubArchiveRepo()
 * const vercelToken = getVercelToken()
 * ```
 * 
 * DEPENDENCIES:
 * -------------
 * - process.env: Node.js environment access
 * - No external packages required
 * 
 * SECURITY:
 * ---------
 * - API keys and tokens read from environment (secure by default)
 * - Never logged or exposed in error messages
 * - Can use secrets management (Vercel, AWS SSM, etc.)
 * 
 * PERFORMANCE:
 * ------------
 * - No file I/O - direct environment access
 * - Parsing done once per request (lazy evaluation)
 * - Minimal overhead compared to other loaders
 * 
 * =============================================================================
 */

import type { 
  AIProviderConfig, 
  AIAccount, 
  NeonAccount, 
  SupabaseAccount, 
  GitHubAccount 
} from './types'

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Environment Resources Interface
 * 
 * Defines the structure of parsed environment configuration.
 * Mirrors the JSON config structure but with environment-specific fields.
 * 
 * @property aiProviders - AI provider configurations from env
 * @property databases - Database configurations from env
 * @property storage - Storage configurations from env
 * @property vercel - Vercel configuration from env
 * @property github - GitHub accounts from env (additional field)
 * 
 * @example
 * ```typescript
 * const envResources: ENVResources = {
 *   aiProviders: { openrouter: {...}, gemini: {...} },
 *   databases: { neon: [...], supabase: [...] },
 *   storage: { github: [...] },
 *   vercel: { token: 'xxx' },
 *   github: [...]
 * }
 * ```
 */
interface ENVResources {
  aiProviders: {
    openrouter: AIProviderConfig
    gemini: AIProviderConfig
  }
  databases: {
    neon: NeonAccount[]
    supabase: SupabaseAccount[]
  }
  storage: {
    github: GitHubAccount[]
  }
  vercel: { token: string }
  github: GitHubAccount[]
}

// ============================================================================
// MAIN LOAD FUNCTION
// ============================================================================

/**
 * Load all resources from environment variables
 * 
 * This is the primary entry point for Level 2 configuration.
 * It parses all relevant environment variables and returns them
 * in a structure compatible with other configuration loaders.
 * 
 * ALGORITHM:
 * 1. Call individual loaders for each category
 * 2. Combine results into unified structure
 * 3. Return complete environment configuration
 * 
 * @returns ENVResources - Complete environment-based configuration
 * 
 * @example
 * ```typescript
 * const envConfig = loadENVConfig()
 * 
 * // Access AI accounts
 * envConfig.aiProviders.openrouter.accounts.forEach(account => {
 *   console.log(account.name, account.key.substring(0, 5) + '...')
 * })
 * 
 * // Access databases
 * envConfig.databases.neon.forEach(neon => {
 *   console.log(neon.name, neon.url)
 * })
 * ```
 */
export function loadENVConfig(): ENVResources {
  return {
    aiProviders: loadAIFromENV(),
    databases: loadDatabasesFromENV(),
    storage: { github: loadStorageFromENV() },
    vercel: { token: process.env.VERCEL_TOKEN || '' },
    github: loadStorageFromENV()
  }
}

// ============================================================================
// AI PROVIDER PARSING
// ============================================================================

/**
 * Load AI providers from environment variables
 * 
 * Parses OpenRouter, Gemini, and other AI provider configurations
 * from environment variables. Supports both single (KEY) and
 * multiple (KEY_1, KEY_2, ...) configurations.
 * 
 * ALGORITHM:
 * 1. Loop from 1-10 looking for numbered keys
 * 2. Also check for single unnumbered keys
 * 3. Create account objects with default limits
 * 4. Return provider config with all found accounts
 * 
 * @returns AI provider configuration with accounts
 * 
 * @example
 * # Single key (current)
 * OPENROUTER_API_KEY=sk-or-v1-xxx
 * GEMINI_API_KEY=AIzaSyxxx
 * 
 * # Multiple keys (for scaling)
 * OPENROUTER_KEY_1=sk-or-v1-xxx1
 * OPENROUTER_KEY_2=sk-or-v1-xxx2
 * OPENROUTER_LIMIT=100000
 */
function loadAIFromENV(): { openrouter: AIProviderConfig; gemini: AIProviderConfig } {
  // INITIALIZE: Empty account arrays
  const openrouter: AIAccount[] = []
  const gemini: AIAccount[] = []

  // --------------------------------------------------------------------------
  // OpenRouter Parsing
  // --------------------------------------------------------------------------
  
  // LOOK FOR NUMBERED KEYS: OPENROUTER_KEY_1, OPENROUTER_KEY_2, etc.
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`OPENROUTER_KEY_${i}`]
    if (key) {
      openrouter.push({
        key,
        name: `openrouter-${i}`,
        limit: parseInt(process.env.OPENROUTER_LIMIT || '100000'),
        used: 0,
        active: true
      })
    }
  }

  // CHECK SINGLE KEY: OPENROUTER_API_KEY (backward compatibility)
  if (openrouter.length === 0 && process.env.OPENROUTER_API_KEY) {
    openrouter.push({
      key: process.env.OPENROUTER_API_KEY,
      name: 'openrouter-1',
      limit: parseInt(process.env.OPENROUTER_LIMIT || '100000'),
      used: 0,
      active: true
    })
  }

  // --------------------------------------------------------------------------
  // Gemini Parsing
  // --------------------------------------------------------------------------
  
  // LOOK FOR NUMBERED KEYS: GEMINI_KEY_1, GEMINI_KEY_2, etc.
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_KEY_${i}`]
    if (key) {
      gemini.push({
        key,
        name: `gemini-${i}`,
        limit: parseInt(process.env.GEMINI_LIMIT || '100000'),
        used: 0,
        active: true
      })
    }
  }

  // CHECK SINGLE KEY: GEMINI_API_KEY (backward compatibility)
  if (gemini.length === 0 && process.env.GEMINI_API_KEY) {
    gemini.push({
      key: process.env.GEMINI_API_KEY,
      name: 'gemini-1',
      limit: parseInt(process.env.GEMINI_LIMIT || '100000'),
      used: 0,
      active: true
    })
  }

  // --------------------------------------------------------------------------
  // Return parsed configurations
  // --------------------------------------------------------------------------
  
  return {
    openrouter: {
      enabled: openrouter.length > 0,
      rotation: (process.env.OPENROUTER_ROTATION as any) || 'sequential',
      autoRotate: process.env.OPENROUTER_AUTO_ROTATE !== 'false',
      accounts: openrouter
    },
    gemini: {
      enabled: gemini.length > 0,
      rotation: (process.env.GEMINI_ROTATION as any) || 'sequential',
      autoRotate: process.env.GEMINI_AUTO_ROTATE !== 'false',
      accounts: gemini
    }
  }
}

// ============================================================================
// DATABASE PARSING
// ============================================================================

/**
 * Load databases from environment variables
 * 
 * Parses Neon and Supabase database configurations from environment.
 * Supports numbered configurations for horizontal scaling.
 * 
 * @returns Database configuration with neon and supabase accounts
 * 
 * @example
 * # Single database (current)
 * DATABASE_URL=postgresql://...
 * NEXT_PUBLIC_SUPABASE_URL=https://...
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 * 
 * # Multiple databases (for scaling)
 * NEON_URL_1=postgresql://...1
 * NEON_URL_2=postgresql://...2
 * SUPABASE_URL_1=https://...1
 * SUPABASE_ANON_KEY_1=eyJ...
 */
function loadDatabasesFromENV(): { neon: NeonAccount[]; supabase: SupabaseAccount[] } {
  const neon: NeonAccount[] = []
  const supabase: SupabaseAccount[] = []

  // --------------------------------------------------------------------------
  // Neon Database Parsing
  // --------------------------------------------------------------------------
  
  // LOOK FOR NUMBERED URLs: NEON_URL_1, NEON_URL_2, etc.
  for (let i = 1; i <= 10; i++) {
    const url = process.env[`NEON_URL_${i}`]
    if (url) {
      neon.push({
        url,
        name: `neon-${i}`,
        active: true
      })
    }
  }

  // CHECK SINGLE URL: DATABASE_URL (backward compatibility)
  if (neon.length === 0 && process.env.DATABASE_URL) {
    neon.push({
      url: process.env.DATABASE_URL,
      name: 'neon-1',
      active: true
    })
  }

  // --------------------------------------------------------------------------
  // Supabase Parsing
  // --------------------------------------------------------------------------
  
  // LOOK FOR NUMBERED CONFIGS: SUPABASE_URL_{N}, SUPABASE_ANON_KEY_{N}
  for (let i = 1; i <= 10; i++) {
    const url = process.env[`SUPABASE_URL_${i}`]
    const anonKey = process.env[`SUPABASE_ANON_KEY_${i}`]
    const serviceKey = process.env[`SUPABASE_SERVICE_KEY_${i}`]

    if (url && anonKey) {
      supabase.push({
        url,
        anonKey,
        serviceKey,
        name: `supabase-${i}`,
        active: true
      })
    }
  }

  // CHECK SINGLE CONFIG: NEXT_PUBLIC_SUPABASE_URL (backward compatibility)
  if (supabase.length === 0 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabase.push({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      name: 'supabase-1',
      active: true
    })
  }

  return { neon, supabase }
}

// ============================================================================
// STORAGE PARSING
// ============================================================================

/**
 * Load storage (GitHub) from environment variables
 * 
 * Parses GitHub token and repository configuration from environment.
 * Multiple tokens support multiple repository access.
 * 
 * @returns Array of GitHub accounts
 * 
 * @example
 * # Single token (current)
 * GITHUB_TOKEN=ghp_xxx
 * GITHUB_ARCHIVE_REPO=sunnygpt-archives
 * 
 * # Multiple tokens (for scaling)
 * GITHUB_TOKEN_1=ghp_xxx1
 * GITHUB_TOKEN_2=ghp_xxx2
 * GITHUB_REPO_1=user/repo1
 * GITHUB_REPO_2=user/repo2
 */
function loadStorageFromENV(): GitHubAccount[] {
  const accounts: GitHubAccount[] = []

  // LOOK FOR NUMBERED TOKENS: GITHUB_TOKEN_1, GITHUB_TOKEN_2, etc.
  for (let i = 1; i <= 10; i++) {
    const token = process.env[`GITHUB_TOKEN_${i}`]
    if (token) {
      accounts.push({
        token,
        name: `github-${i}`,
        active: true
      })
    }
  }

  // CHECK SINGLE TOKEN: GITHUB_TOKEN (backward compatibility)
  if (accounts.length === 0 && process.env.GITHUB_TOKEN) {
    accounts.push({
      token: process.env.GITHUB_TOKEN,
      name: 'github-1',
      active: true
    })
  }

  return accounts
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get GitHub archive repository name from environment
 * 
 * Returns the repository name where seasons should be archived.
 * Falls back to 'sunnygpt-archives' if not set.
 * 
 * @returns string - Repository name (owner/repo format)
 * 
 * @example
 * GITHUB_ARCHIVE_REPO=shamiursunny/sunnygpt-archives
 * // Returns: "shamiursunny/sunnygpt-archives"
 */
export function getGitHubArchiveRepo(): string {
  return process.env.GITHUB_ARCHIVE_REPO || 'sunnygpt-archives'
}

/**
 * Get Vercel API token from environment
 * 
 * Returns the Vercel token for deployment management.
 * Empty string if not configured.
 * 
 * @returns string - Vercel API token
 * 
 * @example
 * VERCEL_TOKEN=vcp_xxx
 * // Returns: "vcp_xxx"
 */
export function getVercelToken(): string {
  return process.env.VERCEL_TOKEN || ''
}

/**
 * Get default AI provider from environment
 * 
 * Returns the preferred AI provider when multiple are available.
 * Falls back to 'openrouter' if not set.
 * 
 * @returns string - Provider name: 'openrouter' or 'gemini'
 * 
 * @example
 * DEFAULT_AI_PROVIDER=gemini
 * // Returns: "gemini"
 */
export function getDefaultAIProvider(): string {
  return process.env.DEFAULT_AI_PROVIDER || 'openrouter'
}

/**
 * Get rotation strategy from environment
 * 
 * Returns how to select between multiple accounts of the same provider.
 * Falls back to 'sequential' if not set.
 * 
 * @returns 'sequential' | 'random' | 'failover'
 * 
 * @example
 * ROTATION_STRATEGY=random
 * // Returns: "random"
 */
export function getRotationStrategy(): 'sequential' | 'random' | 'failover' {
  const strategy = process.env.ROTATION_STRATEGY
  if (strategy === 'random' || strategy === 'failover') {
    return strategy
  }
  return 'sequential'
}

/**
 * =============================================================================
 * END OF ENVIRONMENT VARIABLE LOADER
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */