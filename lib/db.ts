import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function isCurrentPrismaClient(client: PrismaClient | undefined) {
  if (!client) return false

  const requiredModels = ['asset', 'order', 'product', 'warrantyRecord', 'warrantyEvent']
  return requiredModels.every((model) => model in (client as unknown as Record<string, unknown>))
}

export const prisma = isCurrentPrismaClient(globalForPrisma.prisma)
  ? globalForPrisma.prisma!
  : new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma