#!/bin/bash

# setup-dependency-lock.sh
# ------------------------
# Sets up valid package-lock.json and GitHub Action for CI Security Audit.

echo "🔒 Setting up Supply Chain Security..."

# 1. Ensure package-lock.json exists and is in sync
if [ ! -f "package-lock.json" ]; then
    echo "⚠️  package-lock.json not found. Generating..."
    npm install
else
    echo "✅ package-lock.json exists."
fi

# 2. Add '.github' directory
mkdir -p .github/workflows

# 3. Create CI Workflow
cat > .github/workflows/security-audit.yml << 'EOF'
name: Security Audit

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  schedule:
    - cron: '0 0 * * 1' # Weekly scan

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies (Safe)
        # npm ci enforces lockfile usage. If lockfile is out of sync, it fails.
        run: npm ci

      - name: Audit Dependencies
        # Fails if vulnerabilities found with 'high' or 'critical' severity
        run: npm audit --audit-level=high
EOF

echo "✅ Security Audit Workflow created at .github/workflows/security-audit.yml"
echo "👉 This action will run 'npm audit' on every push and weekly."
