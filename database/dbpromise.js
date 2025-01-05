const { PrismaClient } = require('@prisma/client')
const prisma = require('./prisma')

// Export the prisma client for use in routes
module.exports = prisma   
