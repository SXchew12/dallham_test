#!/bin/bash
npm install
npx prisma generate
mkdir -p chats/inapp chats/embed public/media srt/src
echo '{}' > srt/src/ass.json 