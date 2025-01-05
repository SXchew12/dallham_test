-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "uid" TEXT,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "mobile" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "plan" JSONB,
    "plan_expire" TEXT,
    "trial" BOOLEAN NOT NULL DEFAULT false,
    "api_key" TEXT,
    "gemini_token" TEXT NOT NULL DEFAULT '0',
    "openai_token" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "price" TEXT,
    "in_app_chat" BOOLEAN NOT NULL DEFAULT false,
    "image_maker" BOOLEAN NOT NULL DEFAULT false,
    "code_writer" BOOLEAN NOT NULL DEFAULT false,
    "speech_to_text" BOOLEAN NOT NULL DEFAULT false,
    "voice_maker" BOOLEAN NOT NULL DEFAULT false,
    "ai_video" BOOLEAN NOT NULL DEFAULT false,
    "validity_days" TEXT NOT NULL DEFAULT '0',
    "gemini_token" TEXT NOT NULL DEFAULT '0',
    "openai_token" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKeys" (
    "id" SERIAL NOT NULL,
    "open_ai" TEXT,
    "gemini_ai" TEXT,
    "stable_diffusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiImage" (
    "id" SERIAL NOT NULL,
    "uid" TEXT,
    "ai_type" TEXT,
    "image_size" TEXT,
    "image_style" TEXT,
    "prompt" TEXT,
    "filename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSpeech" (
    "id" SERIAL NOT NULL,
    "uid" TEXT,
    "type" TEXT,
    "filename" TEXT,
    "output" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiVoice" (
    "id" SERIAL NOT NULL,
    "uid" TEXT,
    "prompt" TEXT,
    "voice" TEXT,
    "filename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiVoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
