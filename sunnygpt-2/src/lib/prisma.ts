// Prisma database client setup
// Built by Shamiur Rashid Sunny (shamiur.com)
// Using singleton pattern to avoid multiple instances during dev hot reloads

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Reuse the same Prisma instance to prevent connection issues
export const prisma = globalForPrisma.prisma || new PrismaClient()

// Store globally in dev mode to survive hot reloads
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
