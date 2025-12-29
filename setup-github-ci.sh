#!/bin/bash

# =============================================================================
# GitHub CI: Build Safety Check
# =============================================================================

echo "Initializing Build Safety Pipeline..."
echo "================================================="

# 1. Create Directory
mkdir -p .github/workflows

# 2. Create Workflow File
echo "1. Creating Workflow: .github/workflows/build-check.yml"

cat <<EOF > .github/workflows/build-check.yml
name: Production Build Check

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    name: Verify Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Build
        run: npm run build
        
      # If 'npm run build' fails (exit code != 0), the job fails here.
      # GitHub automatically sends an email notification to the committer 
      # and repository owner for failed runs on the default branch.
EOF

echo "   [?] Workflow created."

echo ""
echo "================================================="
echo "CI Setup Complete!"
echo "1. Push this file to GitHub."
echo "2. On the next push to 'main', GitHub will try to build your project."
echo "3. If it fails, you will receive an email and Vercel will not deploy (if git checks are enabled)."
