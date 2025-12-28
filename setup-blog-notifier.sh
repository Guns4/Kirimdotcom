#!/bin/bash

# =============================================================================
# Setup Blog Notifier (Phase 115)
# Telegram Marketing Automation
# =============================================================================

echo "Setting up Blog Notifier..."
echo "================================================="
echo ""

# 1. Telegram Library
echo "1. Creating Library: src/lib/telegram-notifier.ts"
# (File created via tool)

# 2. Webhook Route
echo "2. Creating Webhook: src/app/api/webhooks/blog-published/route.ts"
mkdir -p src/app/api/webhooks/blog-published
# (File created via tool)

# Instructions
echo "================================================="
echo "Setup Complete!"
echo ""
echo "Configuration Steps:"
echo "1. Get a Bot Token from @BotFather."
echo "2. Create a Channel, add the Bot as Administrator."
echo "3. Get Channel ID (e.g. -100xxxxxxx)."
echo "4. Update .env.local:"
echo "   TELEGRAM_BOT_TOKEN=..."
echo "   TELEGRAM_CHANNEL_ID=..."
echo "   BLOG_NOTIFIER_SECRET=my-secret-key"
echo ""
echo "Usage:"
echo "- Option A: Setup Supabase Database Webhook to POST to /api/webhooks/blog-published?secret=..."
echo "- Option B: Call notifyChannel() directly in your Server Action (publishArticle)."
