const prisma = require('./prisma')

const query = async (sql, params) => {
  console.warn('Warning: Using legacy query interface. Please migrate to Prisma client.')
  
  if (sql.toLowerCase().includes('select')) {
    return await prisma.$queryRaw`${sql}`
  }
  
  if (sql.toLowerCase().includes('insert')) {
    return await prisma.$executeRaw`${sql}`
  }
  
  if (sql.toLowerCase().includes('update')) {
    return await prisma.$executeRaw`${sql}`
  }
  
  if (sql.toLowerCase().includes('delete')) {
    return await prisma.$executeRaw`${sql}`
  }
  
  throw new Error('Unsupported query type')
}

const db = {
  user: prisma.user,
  plan: prisma.plan,
  admin: prisma.admin,
  apiKeys: prisma.apiKeys,
  webPublic: prisma.webPublic,
  webPrivate: prisma.webPrivate,
  aiImage: prisma.aiImage,
  aiSpeech: prisma.aiSpeech,
  aiVoice: prisma.aiVoice,
  aiVideo: prisma.aiVideo
}

module.exports = { query, db }   
