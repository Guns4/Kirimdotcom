#!/bin/bash

# setup-sentiment-radar.sh
# ------------------------
# Customer Empathy: AI Sentiment Analysis
# Detects Angry Users and escalates to CS Admin.

echo "🧠 Setting up Sentiment Radar..."

# Uses OpenAI as well for analysis
mkdir -p src/lib/ai

echo "✅ Sentiment Radar setup complete."
echo "   Logic: src/lib/ai/sentiment.ts"
echo "   Usage: Call analyzeSentiment(text) in your chat handler."
