#!/bin/bash

# =============================================================================
# Professional Development Workflow Setup
# =============================================================================

echo "Initializing Professional Workflow..."
echo "================================================="

# 1. Git Branch Configuration
echo "1. Verify/Create 'develop' branch..."

if [ ! -d ".git" ]; then
    echo "   [!] Not a git repository. Please run 'git init' first."
else
    # Check if develop exists
    if git show-ref --verify --quiet refs/heads/develop; then
        echo "   [i] Branch 'develop' already exists."
    else
        echo "   [+] Creating 'develop' branch from current HEAD..."
        git branch develop
        echo "   [✓] Branch 'develop' created."
    fi
fi

# 2. Workflow Guide
echo "2. Generating Guide: WORKFLOW_GUIDE.md"
cat <<EOF > WORKFLOW_GUIDE.md
# Professional Developer Workflow

## The Golden Rule
🚫 **NEVER COMMIT DIRECTLY TO MAIN.**
The \`main\` branch is Production. If you break it, the website dies.

## The Cycle
1.  **Code**: Work on the \`develop\` branch (or feature branches like \`feature/login\`).
2.  **Push**: \`git push origin develop\`
3.  **Preview**: Vercel will automatically detect the push and create a **Preview URL** (e.g., \`cekkirim-git-develop.vercel.app\`).
4.  **Verify**: Open that URL. Test it on your phone. Send it to the client.
5.  **Merge**: Only when the Preview is perfect, create a Pull Request (PR) to merge \`develop\` into \`main\`.

## Command Cheat Sheet
\`\`\`bash
# Start work
git checkout develop

# Save work
git add .
git commit -m "feat: new awesome feature"
git push origin develop

# Release to Production (Manual Merge version)
git checkout main
git merge develop
git push origin main
\`\`\`
EOF

# 3. Release Checklist
echo "3. Generating Checklist: RELEASE_CHECKLIST.md"
cat <<EOF > RELEASE_CHECKLIST.md
# Pre-Release Checklist
*Perform these checks before merging to Main.*

## 1. Automated Checks
- [ ] **Build Success**: Did \`npm run build\` pass locally?
- [ ] **Type Check**: Did \`npx tsc --noEmit\` pass without errors?
- [ ] **Linting**: Did \`npm run lint\` pass?

## 2. Manual Verification (Preview URL)
- [ ] **Mobile Responsiveness**: Opened on actual phone (iOS/Android)?
- [ ] **Critical Flows**: Tested login, checkout, or main feature?
- [ ] **Console Errors**: Checked Browser Console (F12) for red flags?

## 3. Monitoring (Post-Release)
- [ ] **Sentry**: No new error spikes in the dashboard?
- [ ] **Vercel**: Deployment status is "Ready"?
EOF

echo ""
echo "================================================="
echo "Setup Complete!"
echo "1. Run: 'git checkout develop'"
echo "2. Read 'WORKFLOW_GUIDE.md' to understand the new rules."
