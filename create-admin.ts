// Create admin user
// Run with: npx tsx create-admin.ts

const { PrismaClient } = require('./node_modules/.prisma/client/index.js')
const prisma = new PrismaClient()

async function createAdmin() {
    try {
        // Try to create admin user
        const user = await prisma.user.create({
            data: {
                email: 'shamiur.sunny@gmail.com',
                name: 'Shamiur Rashid Sunny',
                role: 'admin',
                image: null
            }
        })
        console.log('Admin created successfully!')
        console.log('ID:', user.id)
        console.log('Email:', user.email)
        console.log('Role:', user.role)
    } catch (error) {
        if (error.code === 'P2002') {
            // Check if it's the email unique constraint
            console.log('User already exists. Checking role...')
            
            const existingUser = await prisma.user.findUnique({
                where: { email: 'shamiur.sunny@gmail.com' }
            })
            
            if (existingUser) {
                // Update role to admin if not already
                if (existingUser.role !== 'admin') {
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: { role: 'admin' }
                    })
                    console.log('Updated user role to: admin')
                } else {
                    console.log('User already is admin')
                }
            }
        } else {
            console.log('Error:', error.message)
        }
    } finally {
        await prisma.$disconnect()
    }
}

createAdmin()