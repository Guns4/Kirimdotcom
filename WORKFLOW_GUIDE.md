# Professional Developer Workflow

## The Golden Rule
🚫 **NEVER COMMIT DIRECTLY TO MAIN.**
The `main` branch is Production. If you break it, the website dies.

## The Cycle
1.  **Code**: Work on the `develop` branch (or feature branches like `feature/login`).
2.  **Push**: `git push origin develop`
3.  **Preview**: Vercel will automatically detect the push and create a **Preview URL** (e.g., `cekkirim-git-develop.vercel.app`).
4.  **Verify**: Open that URL. Test it on your phone. Send it to the client.
5.  **Merge**: Only when the Preview is perfect, create a Pull Request (PR) to merge `develop` into `main`.

## Command Cheat Sheet
```bash
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
```

## Branch Strategy

### Main Branches
- **`main`** - Production (live website)
- **`develop`** - Staging (preview deployments)

### Feature Branches
- **`feature/feature-name`** - New features
- **`fix/bug-name`** - Bug fixes
- **`hotfix/critical-fix`** - Emergency production fixes

## Vercel Auto-Deployment

| Branch | Deploys To | Purpose |
|--------|-----------|---------|
| `main` | Production URL | Live website |
| `develop` | Preview URL | Testing before production |
| `feature/*` | Preview URL | Individual feature testing |

## Best Practices

### Commit Messages
Follow conventional commits:
```
feat: add user authentication
fix: resolve mobile menu issue
docs: update README
style: format code with prettier
refactor: simplify tracking logic
test: add unit tests for API
chore: update dependencies
```

### Before Pushing
```bash
# Check for errors
npm run build

# Run type check
npx tsc --noEmit

# Run linter
npm run lint
```

### Emergency Rollback
```bash
# If production is broken
git checkout main
git revert HEAD
git push origin main
```

## Deployment Flow

```
Developer
    ↓
Feature Branch → develop (Preview URL)
    ↓
Test & Verify
    ↓
Pull Request → main (Production)
    ↓
Auto-Deploy
```

## Need Help?
- Review `RELEASE_CHECKLIST.md` before deploying
- Check Vercel dashboard for deployment status
- Monitor error logs in production
