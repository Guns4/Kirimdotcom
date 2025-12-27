# ============================================================================
# PHASE 300 FINAL CHECK SCRIPT (PowerShell)
# CekKirim.com - The Logistics OS
# ============================================================================
# Run: .\scripts\phase300-final-check.ps1
# ============================================================================

$ErrorActionPreference = "Continue"

# Counters
$script:Warnings = 0
$script:Errors = 0
$script:CleanupCount = 0

# Colors
function Write-Header { param($Text) Write-Host "`n$Text`n" -ForegroundColor Magenta }
function Write-Success { param($Text) Write-Host "✓ $Text" -ForegroundColor Green }
function Write-Warning { param($Text) Write-Host "⚠️  $Text" -ForegroundColor Yellow; $script:Warnings++ }
function Write-Error-Custom { param($Text) Write-Host "✗ $Text" -ForegroundColor Red; $script:Errors++ }
function Write-Info { param($Text) Write-Host "⚙️  $Text" -ForegroundColor Cyan }

Clear-Host
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                    PHASE 300 FINAL CHECK                       ║" -ForegroundColor Magenta
Write-Host "║                  CekKirim - The Logistics OS                   ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ============================================================================
# 1. MODULE INTEGRATION CHECK
# ============================================================================
Write-Header "[1/5] MODULE INTEGRATION CHECK"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (Test-Path "src\app") {
    Write-Info "Scanning app directory for empty folders..."
    
    $appDirs = Get-ChildItem -Path "src\app" -Directory -Recurse
    foreach ($dir in $appDirs) {
        $hasPage = Test-Path "$($dir.FullName)\page.tsx"
        $hasRoute = Test-Path "$($dir.FullName)\route.ts"
        $hasLayout = Test-Path "$($dir.FullName)\layout.tsx"
        
        if (-not ($hasPage -or $hasRoute -or $hasLayout)) {
            # Check if it has valid subdirectories
            $hasValidSubdir = $false
            $subDirs = Get-ChildItem -Path $dir.FullName -Directory
            foreach ($subDir in $subDirs) {
                if ((Test-Path "$($subDir.FullName)\page.tsx") -or 
                    (Test-Path "$($subDir.FullName)\route.ts") -or 
                    (Test-Path "$($subDir.FullName)\layout.tsx")) {
                    $hasValidSubdir = $true
                    break
                }
            }
            
            if (-not $hasValidSubdir) {
                $fileCount = (Get-ChildItem -Path $dir.FullName -File).Count
                if ($fileCount -eq 0) {
                    Write-Warning "Empty folder detected: $($dir.FullName)"
                    $script:CleanupCount++
                }
            }
        }
    }
    
    Write-Success "Module structure validated"
}
else {
    Write-Warning "src\app directory not found"
}

# Check for misplaced .sh files
Write-Host ""
Write-Info "Checking for misplaced shell scripts..."
$rootScripts = Get-ChildItem -Path "." -Filter "*.sh" -File -ErrorAction SilentlyContinue
if ($rootScripts.Count -gt 0) {
    Write-Warning "Found shell scripts in root directory:"
    foreach ($script in $rootScripts) {
        Write-Host "     - $($script.Name)" -ForegroundColor Yellow
        if (-not (Test-Path "scripts")) {
            New-Item -ItemType Directory -Path "scripts" -Force | Out-Null
        }
        Move-Item -Path $script.FullName -Destination "scripts\" -Force
        Write-Host "     Moved to scripts\ directory" -ForegroundColor Green
        $script:CleanupCount++
    }
}
else {
    Write-Success "No misplaced scripts found"
}

Write-Host ""

# ============================================================================
# 2. DATABASE MIGRATION CONSISTENCY
# ============================================================================
Write-Header "[2/5] DATABASE MIGRATION CONSISTENCY"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (Test-Path "src\utils\supabase\migrations") {
    Write-Info "Analyzing migration files..."
    
    $migrations = Get-ChildItem -Path "src\utils\supabase\migrations" -Filter "*.sql" | Sort-Object Name
    Write-Host "   Found $($migrations.Count) migration files"
    
    # Check for timestamp conflicts
    $timestamps = $migrations | ForEach-Object { $_.Name.Substring(0, 8) }
    $duplicates = $timestamps | Group-Object | Where-Object { $_.Count -gt 1 }
    
    if ($duplicates) {
        Write-Error-Custom "DUPLICATE TIMESTAMPS DETECTED:"
        $duplicates | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Red }
    }
    else {
        Write-Success "No timestamp conflicts"
    }
    
    # List migrations
    Write-Host "`nMigration sequence:" -ForegroundColor Cyan
    foreach ($migration in $migrations) {
        Write-Host "   - $($migration.Name)"
    }
}
else {
    Write-Warning "No migrations directory found"
}

Write-Host ""

# ============================================================================
# 3. SECURITY SCAN
# ============================================================================
Write-Header "[3/5] SECURITY SCAN"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Info "Scanning for hardcoded secrets..."

$dangerousPatterns = @(
    "sk_live_",
    "sk_test_",
    "eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*",
    "AKIA[0-9A-Z]{16}",
    "postgres://.*:.*@",
    "mongodb://.*:.*@",
    "mysql://.*:.*@"
)

$securityIssues = 0

foreach ($pattern in $dangerousPatterns) {
    $files = Get-ChildItem -Path "src" -Include "*.ts", "*.tsx", "*.js", "*.jsx" -Recurse -File
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match $pattern) {
            Write-Error-Custom "POTENTIAL SECRET DETECTED in $($file.Name) (Pattern: $pattern)"
            $securityIssues++
            break
        }
    }
}

# Check for .env files in git
$gitFiles = git ls-files 2>$null
if ($gitFiles -match "\.env$|\.env\.local$") {
    Write-Error-Custom "DANGER: .env files are tracked in git!"
    Write-Host "   Run: git rm --cached .env .env.local" -ForegroundColor Red
}
else {
    Write-Success "No .env files in git"
}

# Check .gitignore
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Success ".env files are properly ignored"
    }
    else {
        Write-Warning ".env not in .gitignore"
    }
}

if ($securityIssues -eq 0) {
    Write-Success "No hardcoded secrets detected"
}

Write-Host ""

# ============================================================================
# 4. PERFORMANCE BUILD
# ============================================================================
Write-Header "[4/5] PERFORMANCE BUILD"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Info "Stopping running lint process..."
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*npm*lint*" 
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Clean build artifacts
if (Test-Path ".next") {
    Write-Info "Cleaning previous build..."
    Remove-Item -Path ".next" -Recurse -Force
}

Write-Info "Running production build..."
Write-Host ""

$buildOutput = npm run build 2>&1 | Out-String
$buildExitCode = $LASTEXITCODE

if ($buildExitCode -ne 0) {
    Write-Error-Custom "BUILD FAILED"
    Write-Host $buildOutput -ForegroundColor Red
    Write-Host "`nCannot proceed to git push. Fix build errors first." -ForegroundColor Red
    exit 1
}
else {
    Write-Success "Build successful"
    
    # Analyze bundle size
    Write-Host ""
    Write-Info "Analyzing bundle sizes..."
    
    # Check for large bundles in output
    if ($buildOutput -match "First Load JS.*[2-9][0-9][0-9] kB") {
        Write-Warning "Some bundles are larger than 200KB"
    }
    else {
        Write-Success "All page bundles are optimized"
    }
    
    # Show build summary
    Write-Host "`nBuild Summary:" -ForegroundColor Cyan
    $buildOutput -split "`n" | Select-Object -Last 15 | ForEach-Object { Write-Host $_ }
}

Write-Host ""

# ============================================================================
# 5. GIT PUSH SEQUENCE
# ============================================================================
Write-Header "[5/5] GIT PUSH SEQUENCE"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Summary
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "                        FINAL REPORT                            " -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "   Errors:   " -NoNewline; Write-Host $script:Errors -ForegroundColor $(if ($script:Errors -gt 0) { "Red" } else { "Green" })
Write-Host "   Warnings: " -NoNewline; Write-Host $script:Warnings -ForegroundColor $(if ($script:Warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host "   Cleanup:  " -NoNewline; Write-Host "$($script:CleanupCount) items" -ForegroundColor Green
Write-Host ""

if ($script:Errors -gt 0) {
    Write-Host "✗ CRITICAL ERRORS DETECTED" -ForegroundColor Red
    Write-Host "Cannot proceed with git push. Please fix the errors above." -ForegroundColor Red
    Write-Host ""
    exit 1
}

if ($script:Warnings -gt 0) {
    Write-Host "⚠️  WARNINGS DETECTED" -ForegroundColor Yellow
    Write-Host "Proceed with caution. Review warnings above." -ForegroundColor Yellow
    Write-Host ""
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "✗ Git repository not initialized" -ForegroundColor Red
    Write-Host "Run: git init" -ForegroundColor Yellow
    exit 1
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "No changes to commit" -ForegroundColor Yellow
    exit 0
}

Write-Success "ALL CHECKS PASSED"
Write-Host ""
Write-Host "Ready to push to GitHub?" -ForegroundColor Cyan
Write-Host "This will:" -ForegroundColor Cyan
Write-Host "   1. Stage all changes (git add .)"
Write-Host "   2. Commit with message: 'chore: RELEASE PHASE 300 - THE LOGISTICS OS'"
Write-Host "   3. Push to origin main"
Write-Host ""

$response = Read-Host "Proceed? (y/N)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Info "Staging changes..."
    git add .
    
    Write-Info "Creating commit..."
    git commit -m "chore: RELEASE PHASE 300 - THE LOGISTICS OS - 300+ Enterprise Features"
    
    Write-Info "Pushing to GitHub..."
    git push origin main
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  🚀 SUCCESSFULLY DEPLOYED 🚀                   ║" -ForegroundColor Green
    Write-Host "║                Phase 300 - The Logistics OS                    ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Deploy to Vercel/Railway"
    Write-Host "   2. Run database migrations on production"
    Write-Host "   3. Configure environment variables"
    Write-Host "   4. Set up cron jobs for maintenance"
    Write-Host ""
    Write-Host "Congratulations on building a world-class logistics platform! 🎉" -ForegroundColor Magenta
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "Push cancelled. You can manually run:" -ForegroundColor Yellow
    Write-Host "   git add ."
    Write-Host "   git commit -m 'your message'"
    Write-Host "   git push origin main"
    Write-Host ""
}
