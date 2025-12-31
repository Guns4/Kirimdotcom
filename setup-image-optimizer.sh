#!/bin/bash

# setup-image-optimizer.sh
# ------------------------
# Storage Efficiency: Compresses images to WebP before storage.
# Reduces bandwidth costs & improves load speed.

echo "🖼️  Setting up Image Optimizer..."

# 1. Install Sharp (Already handled via npm install in prompt)
# npm install sharp

mkdir -p src/lib/media
mkdir -p src/app/api/upload/optimize

echo "✅ Image Optimizer setup complete."
echo "   Logic located at: src/lib/media/image-optimizer.ts"
echo "   API Endpoint: /api/upload/optimize"
