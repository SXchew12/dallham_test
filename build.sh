#!/bin/bash
export NODE_OPTIONS="--max_old_space_size=4096"

# Create necessary directories
mkdir -p chats/inapp chats/embed public/media srt/src

# Create initial JSON files
echo '{"version":1,"subtitles":[]}' > srt/src/ass.json

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate --no-engine

# Setup database
node scripts/vercel-setup.js

# Verify file creation
if [ ! -f "srt/src/ass.json" ]; then
    echo "Error: ass.json file was not created"
    exit 1
fi

echo "✅ Build completed successfully" 