/**
 * Prisma Database Client Configuration
 * 
 * This module initializes and exports the Prisma client for database operations.
 * Uses a singleton pattern to prevent multiple instances in development (hot reload).
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { PrismaClient } from '@prisma/client'

// Global type extension to store Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Use existing Prisma instance if available, otherwise create a new one
// This prevents multiple instances during development hot reloads
export const prisma = globalForPrisma.prisma || new PrismaClient()

// In development, store the Prisma instance globally to reuse across hot reloads
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
