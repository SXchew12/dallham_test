#!/bin/bash
export NODE_OPTIONS="--max_old_space_size=4096"

# Create necessary directories
mkdir -p chats/inapp chats/embed public/media srt/src

# Create initial JSON files
echo '{"version":1,"subtitles":[]}' > srt/src/ass.json

# Install dependencies and generate Prisma client
npm install
npx prisma generate --no-engine

# Verify file creation
if [ ! -f "srt/src/ass.json" ]; then
    echo "Error: ass.json file was not created"
    exit 1
fi

echo "✅ Build completed successfully" 