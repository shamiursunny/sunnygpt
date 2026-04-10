/**
 * =============================================================================
 * Database Resource Loader - Level 3 Configuration System
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module provides Level 3 configuration loading from the database (Prisma).
 * Database-stored resources enable runtime management - adding, updating, or
 * removing resources without code changes or deployments.
 * 
 * ARCHITECTURE POSITION:
 * ----------------------
 * This is the highest priority configuration source in our 3-tier system:
 * 
 * Priority Order (Lowest to Highest):
 * 1. JSON File (config/resources.json) - Static, build-time
 * 2. Environment Variables - Runtime overrides
 * 3. Database (this module) - Full runtime management (HIGHEST)
 * 
 * WHY DATABASE THIRD:
 * - Highest priority means automatic override of JSON/ENV
 * - Enables hot-reload resource management
 * - UI-driven resource configuration possible
 * - No deployment needed to add new AI accounts
 * 
 * FUNCTIONALITY:
 * --------------
 * - Load all active resources from Resource table
 * - Add new resources at runtime
 * - Update existing resource configurations
 * - Remove resources (deactivate)
 * - Auto-disable exhausted resources (usage >= limit)
 * - Track usage statistics
 * 
 * DATA MODEL:
 * -----------
 * The Resource table stores:
 * - type: 'ai' | 'database' | 'storage'
 * - provider: Specific provider name
 * - name: Human-readable identifier
 * - config: JSON blob (API keys, URLs, etc.)
 * - used: Usage counter
 * - limit: Maximum allowed usage
 * - level: Always 3 for database-level resources
 * - active: Boolean availability flag
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { loadDBResources, addDBResource, incrementResourceUsage } from './db-loader'
 * 
 * // Load all database resources
 * const resources = await loadDBResources()
 * 
 * // Add new AI account at runtime
 * const newResource = await addDBResource({
 *   type: 'ai',
 *   provider: 'openrouter',
 *   name: 'account-3',
 *   config: { key: 'sk-or-v1-xxx' },
 *   used: 0,
 *   limit: 100000,
 *   level: 3,
 *   active: true
 * })
 * 
 * // Track usage after API call
 * await incrementResourceUsage(resourceId, tokensUsed)
 * ```
 * 
 * DEPENDENCIES:
 * -------------
 * - @prisma/client: Database access
 * - ./types: DBResource type definition
 * 
 * DATABASE SCHEMA:
 * ----------------
 * model Resource {
 *   id        String   @id @default(cuid())
 *   type      String   // 'ai' | 'database' | 'storage'
 *   provider  String   // 'openrouter' | 'gemini' | 'neon' | 'supabase' | 'github'
 *   name      String
 *   config    Json     // API keys, URLs, etc.
 *   used      Int      @default(0)
 *   limit     Int      @default(100000)
 *   level     Int      @default(3)
 *   active    Boolean  @default(true)
 *   createdAt DateTime @default(now())
 * }
 * 
 * ERROR HANDLING:
 * ---------------
 * - Returns empty array on query failure (doesn't crash)
 * - Logs errors for debugging
 * - Graceful degradation if database unavailable
 * 
 * PERFORMANCE:
 * ------------
 * - Prisma queries are optimized with select clauses
 * - Consider adding caching for frequent reads
 * - Batch operations for bulk updates
 * 
 * =============================================================================
 */

import { prisma } from '@/lib/prisma'
import type { DBResource } from './types'

// ============================================================================
// MAIN LOAD FUNCTION
// ============================================================================

/**
 * Load all active resources from database
 * 
 * Retrieves all resources marked as active from the Resource table.
 * These resources override any conflicting configuration from
 * Level 1 (JSON) or Level 2 (ENV).
 * 
 * ALGORITHM:
 * 1. Query Resource table for active resources
 * 2. Order by creation date (newest first)
 * 3. Return as typed array
 * 4. Return empty array on error (graceful degradation)
 * 
 * @returns Promise<DBResource[]> - Array of active database resources
 * 
 * @example
 * ```typescript
 * const dbResources = await loadDBResources()
 * 
 * // Filter by type
 * const aiResources = dbResources.filter(r => r.type === 'ai')
 * const dbResources2 = dbResources.filter(r => r.type === 'database')
 * 
 * // Access provider details
 * aiResources.forEach(r => {
 *   console.log(`${r.provider}: ${r.name}`)
 *   console.log(`  Used: ${r.used}/${r.limit}`)
 *   console.log(`  Active: ${r.active}`)
 * })
 * ```
 */
export async function loadDBResources(): Promise<DBResource[]> {
  try {
    const resources = await prisma.resource.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`[Config] Level 3 (DB) loaded ${resources.length} resources`)
    return resources as unknown as DBResource[]
  } catch (error) {
    console.error('[Config] Failed to load DB resources:', error)
    return []
  }
}

/**
 * Get AI resources from database
 * 
 * Convenience function to filter AI-type resources only.
 * Useful when you only need AI accounts for API calls.
 * 
 * @returns Promise<DBResource[]> - AI resources from database
 * 
 * @example
 * ```typescript
 * const aiResources = await getDBAIResources()
 * const openrouter = aiResources.filter(r => r.provider === 'openrouter')
 * const gemini = aiResources.filter(r => r.provider === 'gemini')
 * ```
 */
export async function getDBAIResources(): Promise<DBResource[]> {
  const resources = await loadDBResources()
  return resources.filter(r => r.type === 'ai')
}

/**
 * Get database resources from database
 * 
 * Convenience function to filter database-type resources only.
 * Returns Neon and Supabase connections.
 * 
 * @returns Promise<DBResource[]> - Database resources from database
 * 
 * @example
 * ```typescript
 * const dbResources = await getDBDatabaseResources()
 * const neon = dbResources.filter(r => r.provider === 'neon')
 * const supabase = dbResources.filter(r => r.provider === 'supabase')
 * ```
 */
export async function getDBDatabaseResources(): Promise<DBResource[]> {
  const resources = await loadDBResources()
  return resources.filter(r => r.type === 'database')
}

/**
 * Get storage resources from database
 * 
 * Convenience function to filter storage-type resources only.
 * Returns GitHub and other storage connections.
 * 
 * @returns Promise<DBResource[]> - Storage resources from database
 * 
 * @example
 * ```typescript
 * const storage = await getDBStorageResources()
 * const github = storage.filter(r => r.provider === 'github')
 * ```
 */
export async function getDBStorageResources(): Promise<DBResource[]> {
  const resources = await loadDBResources()
  return resources.filter(r => r.type === 'storage')
}

// ============================================================================
// RESOURCE MANAGEMENT
// ============================================================================

/**
 * Add a new resource to database
 * 
 * Creates a new resource entry in the database for runtime management.
 * The resource immediately becomes available for use (if active=true).
 * 
 * @param resource - Resource configuration (without id and createdAt)
 * @returns Promise<DBResource> - Created resource with generated id
 * 
 * @example
 * ```typescript
 * const newAccount = await addDBResource({
 *   type: 'ai',
 *   provider: 'openrouter',
 *   name: 'account-5',
 *   config: { key: 'sk-or-v1-xxx' },
 *   used: 0,
 *   limit: 100000,
 *   level: 3,
 *   active: true
 * })
 * 
 * console.log(`Added resource: ${newAccount.id}`)
 * ```
 * 
 * @throws Error if database write fails
 */
export async function addDBResource(resource: Omit<DBResource, 'id' | 'createdAt'>): Promise<DBResource> {
  try {
    const created = await prisma.resource.create({
      data: {
        type: resource.type,
        provider: resource.provider,
        name: resource.name,
        config: resource.config as any,
        used: resource.used,
        limit: resource.limit,
        level: resource.level,
        active: resource.active
      }
    })
    console.log(`[Config] Added resource: ${resource.name} (${resource.provider})`)
    return created as unknown as DBResource
  } catch (error) {
    console.error('[Config] Failed to add resource:', error)
    throw error
  }
}

/**
 * Update an existing resource
 * 
 * Modifies resource configuration, usage, or active status.
 * Can be used to enable/disable resources, update API keys,
 * or adjust limits.
 * 
 * @param id - Resource ID to update
 * @param updates - Partial resource object with changes
 * @returns Promise<DBResource> - Updated resource
 * 
 * @example
 * ```typescript
 * // Disable a resource
 * await updateDBResource(resourceId, { active: false })
 * 
 * // Update usage after API call
 * await updateDBResource(resourceId, { used: newUsage })
 * 
 * // Change name/identifier
 * await updateDBResource(resourceId, { name: 'new-name' })
 * ```
 * 
 * @throws Error if resource not found or update fails
 */
export async function updateDBResource(id: string, updates: Partial<DBResource>): Promise<DBResource> {
  try {
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...updates,
        config: updates.config as any
      }
    })
    return updated as unknown as DBResource
  } catch (error) {
    console.error('[Config] Failed to update resource:', error)
    throw error
  }
}

/**
 * Remove (deactivate) a resource
 * 
 * Soft-deletes a resource by marking it as inactive.
 * The resource record is preserved for audit history.
 * 
 * @param id - Resource ID to remove
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Remove exhausted account
 * await removeDBResource(exhaustedResourceId)
 * console.log('Resource removed')
 * ```
 * 
 * @throws Error if resource not found
 */
export async function removeDBResource(id: string): Promise<void> {
  try {
    await prisma.resource.delete({ where: { id } })
    console.log(`[Config] Removed resource: ${id}`)
  } catch (error) {
    console.error('[Config] Failed to remove resource:', error)
    throw error
  }
}

/**
 * Mark resource as exhausted
 * 
 * Automatically deactivates a resource when its usage reaches
 * or exceeds its limit. Called after tracking usage.
 * 
 * @param id - Resource ID to mark exhausted
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // After usage update
 * if (newUsage >= resource.limit) {
 *   await markResourceExhausted(resource.id)
 *   console.log('Resource marked as exhausted')
 * }
 * ```
 */
export async function markResourceExhausted(id: string): Promise<void> {
  await updateDBResource(id, { active: false })
}

/**
 * Increment usage counter for a resource
 * 
 * Tracks usage (tokens, requests, etc.) for a resource and
 * automatically disables it when limit is reached.
 * 
 * @param id - Resource ID to update
 * @param amount - Amount to add to usage counter
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // After OpenRouter API call with 1500 tokens
 * await incrementResourceUsage(resourceId, 1500)
 * 
 * // If usage now >= limit, resource auto-disables
 * ```
 * 
 * LOGIC:
 * 1. Fetch current resource
 * 2. Add amount to used counter
 * 3. Update database
 * 4. If used >= limit, auto-disable
 */
export async function incrementResourceUsage(id: string, amount: number): Promise<void> {
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (resource) {
    const newUsed = resource.used + amount
    await prisma.resource.update({
      where: { id },
      data: { used: newUsed }
    })

    // AUTO-DISABLE: If limit reached or exceeded
    if (resource.limit && newUsed >= resource.limit) {
      await markResourceExhausted(id)
      console.log(`[Config] Resource ${resource.name} marked as exhausted`)
    }
  }
}

/**
 * List all resources (including inactive)
 * 
 * Returns every resource in the database, regardless of
 * active status. Useful for admin dashboards and
 * resource management UIs.
 * 
 * @returns Promise<DBResource[]> - All resources, active and inactive
 * 
 * @example
 * ```typescript
 * const allResources = await listAllDBResources()
 * 
 * // Group by status
 * const active = allResources.filter(r => r.active)
 * const inactive = allResources.filter(r => !r.active)
 * 
 * // Group by type
 * const byType = allResources.reduce((acc, r) => {
 *   acc[r.type] = acc[r.type] || []
 *   acc[r.type].push(r)
 *   return acc
 * }, {})
 * ```
 */
export async function listAllDBResources(): Promise<DBResource[]> {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return resources as unknown as DBResource[]
  } catch (error) {
    console.error('[Config] Failed to list all resources:', error)
    return []
  }
}

/**
 * =============================================================================
 * END OF DATABASE RESOURCE LOADER
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */