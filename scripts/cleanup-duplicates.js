const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting cleanup of duplicate entries...')

    // Clean up admin duplicates
    const admins = await prisma.admin.findMany()
    const adminEmailMap = new Map()
    const adminUidMap = new Map()

    for (const admin of admins) {
      if (admin.email) {
        if (adminEmailMap.has(admin.email)) {
          // Delete duplicate
          await prisma.admin.delete({ where: { id: admin.id } })
        } else {
          adminEmailMap.set(admin.email, admin.id)
        }
      }
      
      if (admin.uid) {
        if (adminUidMap.has(admin.uid)) {
          // Delete duplicate
          await prisma.admin.delete({ where: { id: admin.id } })
        } else {
          adminUidMap.set(admin.uid, admin.id)
        }
      }
    }

    // Clean up user duplicates
    const users = await prisma.user.findMany()
    const userEmailMap = new Map()
    const userUidMap = new Map()

    for (const user of users) {
      if (user.email) {
        if (userEmailMap.has(user.email)) {
          // Delete duplicate
          await prisma.user.delete({ where: { id: user.id } })
        } else {
          userEmailMap.set(user.email, user.id)
        }
      }
      
      if (user.uid) {
        if (userUidMap.has(user.uid)) {
          // Delete duplicate
          await prisma.user.delete({ where: { id: user.id } })
        } else {
          userUidMap.set(user.uid, user.id)
        }
      }
    }

    console.log('✅ Cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

cleanupDuplicates()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  }) 