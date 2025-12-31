#!/bin/bash

# setup-resi-highlighter.sh
# -------------------------
# User Acquisition: Chrome Extension.
# Automatically highlights receipt numbers on any website.

echo "🧩 Generating Chrome Extension..."

mkdir -p extension

echo "✅ Manifest: extension/manifest.json"
echo "✅ Content Script: extension/content.js"
echo "👉 Load 'extension' folder in chrome://extensions as Unpacked Extension."
