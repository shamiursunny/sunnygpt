import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to DB...')
        const chats = await prisma.chat.findMany()
        console.log('Successfully connected to DB. Chats found:', chats.length)
    } catch (e) {
        console.error('Error connecting to DB:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
