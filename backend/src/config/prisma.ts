
import { PrismaPg } from '@prisma/adapter-pg'
import {PrismaClient} from '../../prisma/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString= process.env.DATABASE_URL
if(!connectionString) throw new Error("Mising DB Url")


const adapter = new PrismaPg({ connectionString })

const prismaLogLevel = process.env.PRISMA_LOG_QUERIES === 'true' ? (['query', 'error'] as const) : (['error'] as const)

export const prisma = globalForPrisma.prisma ?? new PrismaClient ({adapter, log:[...prismaLogLevel]})

if(process.env.NODE_ENV  !== 'production') globalForPrisma.prisma = prisma