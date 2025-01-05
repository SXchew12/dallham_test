#!/bin/bash
export NODE_OPTIONS="--max_old_space_size=4096"
npm install
npx prisma generate
mkdir -p chats/inapp chats/embed public/media srt/src
echo '{}' > srt/src/ass.json 