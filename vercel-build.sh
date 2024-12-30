#!/bin/bash

# Create required directories
mkdir -p /tmp/media
chmod -R 777 /tmp/media
mkdir -p public/media
chmod -R 777 public/media
mkdir -p srt/src
chmod -R 777 srt/src

# Create empty ass.json if it doesn't exist
echo '{}' > srt/src/ass.json
chmod 666 srt/src/ass.json 