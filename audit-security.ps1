# Dependency Security Audit (PowerShell)

Write-Host "Starting Security Audit..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Automatic Fix
Write-Host "1. Attempting to auto-fix vulnerabilities..." -ForegroundColor Yellow
# 'npm audit fix' updates compatible versions to patch vulnerabilities
npm audit fix
Write-Host "   [i] Auto-fix attempt complete." -ForegroundColor Gray
Write-Host ""

# 2. Critical Scan
Write-Host "2. Scanning for remaining High/Critical issues..." -ForegroundColor Yellow
$REPORT_FILE = "SECURITY_REPORT.txt"

# Run npm audit checking only high/critical, capture output
# Note: npm audit exits with 1 if vulnerabilities found (if configured via audit-level, but audit-level flag behavior varies across npm versions, using args directly)
# --audit-level=high works in newer npm to fail the command
npm audit --audit-level=high 2>&1 | Out-File -FilePath $REPORT_FILE -Encoding UTF8
$cmdSuccess = $LASTEXITCODE -eq 0

# 3. Analyze Result
if ($cmdSuccess) {
    Write-Host "   [?] SUCCESS: No High or Critical vulnerabilities found." -ForegroundColor Green
    Write-Host "       (You can inspect $REPORT_FILE to be sure)" -ForegroundColor Gray
}
else {
    Write-Host "   [!] WARNING: Validated High/Critical vulnerabilities detected!" -ForegroundColor Red
    Write-Host "       These could not be automatically fixed." -ForegroundColor Red
    Write-Host ""
    Write-Host "   Action Required:" -ForegroundColor Yellow
    Write-Host "   1. Open '$REPORT_FILE' to identify the vulnerable packages." -ForegroundColor White
    Write-Host "   2. Manually update them (e.g., 'npm install package@latest')." -ForegroundColor White
    Write-Host "   3. If a direct dependency is fine but a nested one is not," -ForegroundColor White
    Write-Host "      try 'npm update' or check GitHub issues for that package." -ForegroundColor White
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Report saved to: $REPORT_FILE" -ForegroundColor Cyan
