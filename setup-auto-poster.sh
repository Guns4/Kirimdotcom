#!/bin/bash

# =============================================================================
# Setup Auto Poster (Phase 105)
# Social Media Distribution Automation
# =============================================================================

echo "Setting up Auto Poster..."
echo "================================================="
echo ""

# 1. Social Library
echo "1. Creating Library: src/lib/social-publisher.ts"
# (File created via tool)

# 2. Webhook Route
echo "2. Creating Webhook: src/app/api/webhooks/auto-post/route.ts"
mkdir -p src/app/api/webhooks/auto-post
# (File created via tool)

# 3. DB Schema (Instruction)
echo "3. Creating SQL Schema (info only)..."
# (File created via tool)

echo "================================================="
echo "Setup Complete!"
echo "1. Create 'social_logs' table in Supabase."
echo "2. Set env vars: TWITTER_API_KEY, FB_PAGE_TOKEN, AUTO_POST_SECRET."
echo "3. Trigger POST /api/webhooks/auto-post with { title, url }."
