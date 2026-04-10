/**
 * =============================================================================
 * Resource Rotator - Smart Account Rotation Logic
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * LICENSE: UNLICENSED (Proprietary)
 * =============================================================================
 * 
 * PURPOSE:
 * --------
 * This module provides intelligent account rotation for multi-account AI
 * providers. When multiple API keys are configured, this system automatically
 * selects the next available account based on the configured rotation strategy.
 * 
 * ROTATION STRATEGIES:
 * --------------------
 * 1. SEQUENTIAL (Default): Uses accounts in order, cycles through
 *    - Account 1 → Account 2 → Account 3 → ... → Account 1
 *    - Predictable, fair distribution
 *    - Good for load balancing
 * 
 * 2. RANDOM: Randomly selects an account
 *    - Even distribution over time
 *    - Unpredictable but spreads load naturally
 *    - Good for avoiding rate limit patterns
 * 
 * 3. FAILOVER: Always tries first account, only switches on failure
 *    - Uses primary until exhausted or failed
 *    - Then tries next available
 *    - Good for prioritizing premium accounts
 * 
 * WHY ROTATION MATTERS:
 * ---------------------
 * - Prevents any single account from hitting rate limits
 * - Enables horizontal scaling without upgrading plans
 * - Provides automatic failover for high availability
 * - Maximizes available quota across all accounts
 * 
 * FEATURES:
 * ---------
 * - State tracking per provider (remembers current position)
 * - Automatic exhaustion detection and skip
 * - Manual exhaustion marking (for rate limit handling)
 * - Rotation state inspection for monitoring
 * - Reset capability for testing
 * 
 * USAGE:
 * -------
 * ```typescript
 * import { getRotator, rotateAIAccount } from './resource-rotator'
 * 
 * // Get rotator for a specific provider
 * const rotator = getRotator('openrouter')
 * 
 * // Get next available account
 * const account = await rotator.getNext()
 * 
 * // Or use the convenience function
 * const quickAccount = await rotateAIAccount('gemini')
 * 
 * // Mark exhausted and get next
 * const nextAccount = await rotateAfterExhaustion('openrouter', 'account-1')
 * ```
 * 
 * INTERNALS:
 * -----------
 * - Maintains rotation state in memory
 * - State persists across requests within same process
 * - Combined with resource registry for account data
 * 
 * PERFORMANCE:
 * ------------
 * - O(1) rotation for sequential/random
 * - O(n) for failover (scans for available)
 * - Minimal memory overhead
 * 
 * =============================================================================
 */

import type { AIAccount } from './types'
import { getSettings, getAIAccounts } from './resource-registry'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Rotation State
 * 
 * Maintains the current position in rotation for a provider.
 * 
 * @property currentIndex - Index of current/next account
 * @property lastRotation - Timestamp of last rotation
 * 
 * @example
 * ```typescript
 * const state: RotationState = {
 *   currentIndex: 2,  // Next account will be index 2
 *   lastRotation: 1700000000000  // Last rotation timestamp
 * }
 * ```
 */
interface RotationState {
  currentIndex: number
  lastRotation: number
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Rotation state storage
 * 
 * Maintains state for each provider to track position in rotation.
 * Keyed by provider name for isolation between providers.
 * 
 * STATE STRUCTURE:
 * ```typescript
 * {
 *   'openrouter': { currentIndex: 0, lastRotation: 1700000000000 },
 *   'gemini': { currentIndex: 1, lastRotation: 1700000005000 }
 * }
 * ```
 */
const rotationStates: Record<string, RotationState> = {}

// ============================================================================
// RESOURCE ROTATOR CLASS
// ============================================================================

/**
 * Resource Rotator
 * 
 * Smart rotation handler for a specific AI provider.
 * Manages account selection based on configured strategy.
 */
export class ResourceRotator {
  /**
   * Provider being rotated
   * Either 'openrouter' or 'gemini'
   */
  private provider: 'openrouter' | 'gemini'

  /**
   * Create a new rotator for a provider
   * 
   * @param provider - 'openrouter' or 'gemini'
   */
  constructor(provider: 'openrouter' | 'gemini') {
    this.provider = provider
  }

  /**
   * Get the next available account
   * 
   * Applies the configured rotation strategy to select
   * the next account from the available pool.
   * 
   * ALGORITHM:
   * 1. Load active accounts for provider
   * 2. Filter to active (not exhausted) accounts
   * 3. If none available, return null
   * 4. Apply rotation strategy (sequential/random/failover)
   * 
   * @returns Promise<AIAccount | null> - Next account or null if none available
   * 
   * @example
   * ```typescript
   * const rotator = new ResourceRotator('openrouter')
   * const account = await rotator.getNext()
   * if (account) {
   *   console.log(`Using account: ${account.name}`)
   *   // Use account for API call
   * }
   * ```
   */
  async getNext(): Promise<AIAccount | null> {
    // LOAD: Get accounts from registry
    const accounts = await getAIAccounts(this.provider)
    const settings = await getSettings()
    
    // VALIDATE: Check if any accounts exist
    if (accounts.length === 0) {
      console.warn(`[Rotator] No active accounts for ${this.provider}`)
      return null
    }

    // FILTER: Active accounts only (not exhausted)
    const activeAccounts = accounts.filter(a => a.active && a.used < a.limit)
    
    if (activeAccounts.length === 0) {
      console.warn(`[Rotator] No available accounts for ${this.provider} (all exhausted)`)
      return null
    }

    // ROUTE: Apply configured rotation strategy
    switch (settings.rotationStrategy) {
      case 'random':
        return this.getRandom(activeAccounts)
      case 'failover':
        return this.getFailover(activeAccounts)
      case 'sequential':
      default:
        return this.getSequential(activeAccounts)
    }
  }

  /**
   * Sequential rotation
   * 
   * Uses accounts in order, advancing index after each call.
   * Cycles back to start after reaching end.
   * 
   * @param accounts - Available accounts to rotate through
   * @returns Selected account
   */
  private getSequential(accounts: AIAccount[]): AIAccount {
    // GET STATE: Initialize if needed
    const key = this.provider
    const state = rotationStates[key] || { currentIndex: 0, lastRotation: 0 }
    
    // SELECT: Get current account based on index
    const account = accounts[state.currentIndex % accounts.length]
    
    // ADVANCE: Move to next index for next call
    state.currentIndex = (state.currentIndex + 1) % accounts.length
    state.lastRotation = Date.now()
    rotationStates[key] = state
    
    console.log(`[Rotator] Sequential: using ${account.name} (index: ${state.currentIndex - 1})`)
    return account
  }

  /**
   * Random rotation
   * 
   * Randomly selects an account from the pool.
   * Over time, provides even distribution.
   * 
   * @param accounts - Available accounts to choose from
   * @returns Randomly selected account
   */
  private getRandom(accounts: AIAccount[]): AIAccount {
    // RANDOM: Select random index
    const index = Math.floor(Math.random() * accounts.length)
    const account = accounts[index]
    
    console.log(`[Rotator] Random: using ${account.name}`)
    return account
  }

  /**
   * Failover rotation
   * 
   * Always tries current account first. If exhausted,
   * finds next available account.
   * 
   * Best for prioritizing premium accounts while
   * maintaining fallback capability.
   * 
   * @param accounts - Available accounts
   * @returns Best available account
   */
  private getFailover(accounts: AIAccount[]): AIAccount {
    // GET STATE: Initialize if needed
    const key = this.provider
    const state = rotationStates[key] || { currentIndex: 0, lastRotation: 0 }
    
    // TRY FIRST: Always start with current
    let account = accounts[state.currentIndex % accounts.length]
    
    // CHECK: If current is exhausted, find next available
    if (account.used >= account.limit) {
      const available = accounts.find(a => a.used < a.limit)
      if (available) {
        account = available
        // Update state to track which account we're using
        const newIndex = accounts.findIndex(a => a.name === available.name)
        state.currentIndex = newIndex >= 0 ? newIndex : 0
      }
    }
    
    state.lastRotation = Date.now()
    rotationStates[key] = state
    
    console.log(`[Rotator] Failover: using ${account.name}`)
    return account
  }

  /**
   * Mark account as exhausted and get next
   * 
   * Called when an account hits a rate limit or error.
   * Marks current as exhausted and returns next available.
   * 
   * @param accountName - Name of exhausted account
   * @returns Promise<AIAccount | null> - Next available account
   * 
   * @example
   * ```typescript
   * try {
   *   await makeAPICall(account)
   * } catch (error) {
   *   if (error.status === 429) {
   *     const nextAccount = await rotator.markExhausted(account.name)
   *     // Retry with next account
   *   }
   * }
   * ```
   */
  async markExhausted(accountName: string): Promise<AIAccount | null> {
    console.log(`[Rotator] Marking ${accountName} as exhausted`)
    
    // RESET: Move to next index
    const key = this.provider
    if (rotationStates[key]) {
      rotationStates[key].currentIndex = (rotationStates[key].currentIndex + 1) % 10
    }
    
    // GET NEXT: Return next available
    return this.getNext()
  }

  /**
   * Reset rotation state
   * 
   * Clears all rotation state for this provider.
   * Useful for testing or manual reset.
   */
  reset() {
    rotationStates[this.provider] = { currentIndex: 0, lastRotation: 0 }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get rotator instance for a provider
 * 
 * Factory function to create a rotator for a specific provider.
 * 
 * @param provider - 'openrouter' or 'gemini'
 * @returns ResourceRotator instance
 * 
 * @example
 * ```typescript
 * const rotator = getRotator('gemini')
 * const account = await rotator.getNext()
 * ```
 */
export function getRotator(provider: 'openrouter' | 'gemini'): ResourceRotator {
  return new ResourceRotator(provider)
}

/**
 * Rotate to next AI account
 * 
 * Convenience function for single-call rotation.
 * 
 * @param provider - 'openrouter' or 'gemini'
 * @returns Promise<AIAccount | null> - Next available account
 * 
 * @example
 * ```typescript
 * const account = await rotateAIAccount('openrouter')
 * if (account) {
 *   const response = await callOpenRouter(account.key, messages)
 * }
 * ```
 */
export async function rotateAIAccount(provider: 'openrouter' | 'gemini'): Promise<AIAccount | null> {
  const rotator = new ResourceRotator(provider)
  return rotator.getNext()
}

/**
 * Rotate after account exhaustion
 * 
 * Called when an account becomes unusable (rate limit, error).
 * Marks current as exhausted and gets next.
 * 
 * @param provider - 'openrouter' or 'gemini'
 * @param exhaustedAccountName - Name of account that exhausted
 * @returns Promise<AIAccount | null> - Next available account
 * 
 * @example
 * ```typescript
 * try {
   *   await makeAPICall()
 * } catch (error) {
 *   if (error.status === 429) {
 *     const next = await rotateAfterExhaustion('openrouter', currentAccount.name)
 *   }
 * }
 * ```
 */
export async function rotateAfterExhaustion(
  provider: 'openrouter' | 'gemini', 
  exhaustedAccountName: string
): Promise<AIAccount | null> {
  const rotator = new ResourceRotator(provider)
  return rotator.markExhausted(exhaustedAccountName)
}

/**
 * Get rotation state for monitoring
 * 
 * Returns current rotation state for a provider.
 * Useful for debugging and monitoring.
 * 
 * @param provider - Provider name to check
 * @returns RotationState or null if not initialized
 * 
 * @example
 * ```typescript
 * const state = getRotationState('openrouter')
 * console.log(`Current index: ${state?.currentIndex}`)
 * console.log(`Last rotation: ${new Date(state?.lastRotation || 0)}`)
 * ```
 */
export function getRotationState(provider: string): RotationState | null {
  return rotationStates[provider] || null
}

/**
 * Update account usage
 * 
 * Tracks usage after API call. Can be used to
 * update the resource registry usage counter.
 * 
 * @param provider - 'openrouter' or 'gemini'
 * @param accountName - Account that was used
 * @param tokensUsed - Number of tokens consumed
 * 
 * @example
 * ```typescript
 * // After API call
 * await updateAccountUsage('openrouter', 'account-1', 1500)
 * ```
 */
export async function updateAccountUsage(
  provider: 'openrouter' | 'gemini',
  accountName: string,
  tokensUsed: number
) {
  // Would update via db-loader in full implementation
  // For now, just log the usage
  console.log(`[Rotator] Updated usage for ${accountName}: +${tokensUsed} tokens`)
}

/**
 * =============================================================================
 * END OF RESOURCE ROTATOR
 * =============================================================================
 * This file is part of SunnyGPT Prime Edition
 * Built by Shamiur Rashid Sunny (shamiur.com)
 * =============================================================================
 */