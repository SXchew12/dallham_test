const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Starting database migration...')

    // Insert default admin
    console.log('👤 Creating admin...')
    await prisma.admin.create({
      data: {
        email: 'admin@admin.com',
        password: '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6',
        role: 'admin',
        uid: 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz'
      }
    })

    // Insert API keys
    console.log('🔑 Setting up API keys...')
    await prisma.apiKeys.create({
      data: {
        open_ai: 'sk-proj-KA3vYIRjJ1gJ81DB4L2uT3BlbkFJtDiMXXXXXXXXXXX',
        gemini_ai: 'AIzaSyA27vzeSnobuj1a67XJd_MXXXXXXXXXXX',
        stable_diffusion: 'sk-f9WeKwC7YuZAgS0wzTLDk4kO84fpRNDa8OMXXXXXXXXXXX'
      }
    })

    // Insert test user
    console.log('👥 Creating test user...')
    await prisma.user.create({
      data: {
        role: 'user',
        uid: 'testuser123',
        name: 'Test User',
        email: 'test@test.com',
        password: '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6',
        mobile: '1234567890',
        timezone: 'UTC',
        plan: JSON.stringify({
          id: 1,
          name: 'Full Access',
          price: '0',
          in_app_chat: 1,
          image_maker: 1,
          code_writer: 1,
          speech_to_text: 1,
          voice_maker: 1,
          ai_video: 1,
          validity_days: '365',
          gemini_token: '999999',
          openai_token: '999999'
        }),
        plan_expire: '1735689600000',
        trial: 0,
        gemini_token: '999999',
        openai_token: '999999'
      }
    })

    // Insert default plan
    console.log('📋 Creating default plan...')
    await prisma.plan.create({
      data: {
        name: 'Test Plan',
        price: '0',
        in_app_chat: 1,
        image_maker: 1,
        code_writer: 1,
        speech_to_text: 1,
        voice_maker: 1,
        ai_video: 1,
        validity_days: '365',
        gemini_token: '999999',
        openai_token: '999999'
      }
    })

    // Insert web configuration
    console.log('⚙️ Setting up web configuration...')
    await prisma.webPublic.create({
      data: {
        currency_code: 'USD',
        app_name: 'AI Platform',
        is_custom_home: 0,
        meta_description: 'AI Platform with multiple features',
        currency_symbol: '$',
        login_header_footer: 1,
        exchange_rate: '1'
      }
    })

    await prisma.webPrivate.create({
      data: {
        offline_active: '0',
        stripe_active: '1',
        paystack_active: '0'
      }
    })

    console.log('✅ Database migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 