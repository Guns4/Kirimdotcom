#!/bin/bash

# setup-voice-support.sh
# ----------------------
# AI Accessibility: Voice-to-Text using OpenAI Whisper.
# Allows users to complain via Voice Note.

echo "🎤 Setting up AI Voice Support..."

# 1. Install OpenAI (Already handled)
# npm install openai

mkdir -p src/lib/ai
mkdir -p src/components/support

echo "✅ Voice Support setup complete."
echo "   Logic: src/lib/ai/whisper.ts"
echo "   UI: src/components/support/VoiceRecorder.tsx"
echo "👉 Add OPENAI_API_KEY to your .env file."
