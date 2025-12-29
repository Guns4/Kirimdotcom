#!/bin/bash

# =============================================================================
# Release Workflow & Branch Strategy Setup
# =============================================================================

echo "Initializing Branch Strategy..."
echo "================================================="

# 1. Git Branch Setup
echo "1. Configuring Git Branches..."

# Check if .git exists
if [ -d ".git" ]; then
    # Create 'develop' branch if it doesn't exist
    if git show-ref --verify --quiet refs/heads/develop; then
        echo "   [i] Branch 'develop' already exists."
    else
        echo "   [+] Creating 'develop' branch from current HEAD..."
        git branch develop
        echo "   [✓] Branch 'develop' created."
    fi
    
    # Optional: checkout develop
    # git checkout develop
    echo "   [i] Ready to switch: 'git checkout develop'"
else
    echo "   [!] Not a git repository. Run 'git init' first."
fi

# 2. Generate Documentation / Guide
echo "2. Generating Strategy Guide: BRANCH_STRATEGY.md"
cat <<EOF > BRANCH_STRATEGY.md
# Professional Release Workflow Strategy

To ensure code stability in Production (\`main\`), we adopt the following strategy:

## 1. Branch Structure
- **\`main\`**: Production-ready code. NEVER push directly here.
- **\`develop\`**: Staging/Integration branch. All new features go here first.
- **\`feature/xyz\`**: Temporary branches for specific tasks (e.g., \`feature/login-page\`).

## 2. GitHub Branch Protection (CRITICAL)
Prevents accidental pushes to production and enforces Code Review.

1. Go to your **GitHub Repository**.
2. Click **Settings** > **Branches** > **Add branch protection rule**.
3. **Branch name pattern**: \`main\`
4. Check the following:
   - [x] **Require a pull request before merging**
   - [x] **Require status checks to pass before merging** (If you set up CI)
   - [x] **Do not allow bypassing the above settings**
5. Click **Create/Save**.

## 3. Vercel Preview Deployments
Vercel automatically integrates with your git branches.

- **Production**: When you merge a PR into \`main\`, Vercel deploys to \`cekkirim.com\`.
- **Preview**: When you push to \`develop\` or any other branch, Vercel creates a unique URL (e.g., \`cekkirim-git-develop.vercel.app\`).
   - Use this URL to test new features live before merging to \`main\`.
   - Share this URL with your team/clients for feedback.

## 4. The Workflow
1. \`git checkout -b feature/new-feature\`
2. Code... Commit... Push.
3. Open Pull Request (PR) from \`feature/new-feature\` to \`develop\`.
4. Review Preview URL -> Merge to \`develop\`.
5. Test on \`develop\` env.
6. Open PR from \`develop\` to \`main\` (Release).
EOF

echo ""
echo "================================================="
echo "Strategy Setup Complete!"
echo "1. Run 'git checkout develop' to start working safely."
echo "2. Read 'BRANCH_STRATEGY.md' and configure GitHub Settings immediately."
