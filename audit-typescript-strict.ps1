# TypeScript Strictness Audit (PowerShell)

Write-Host "Starting Strict Type Audit..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Update tsconfig.json (Safe JSON manipulation via Node)
Write-Host "1. Enforcing Strict Mode in tsconfig.json..." -ForegroundColor Yellow
$nodeScript = @'
try {
    const fs = require('fs');
    if (fs.existsSync('tsconfig.json')) {
        const config = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        config.compilerOptions = config.compilerOptions || {};
        
        // Enforce Rules
        config.compilerOptions.strict = true;
        config.compilerOptions.noImplicitAny = true;
        
        fs.writeFileSync('tsconfig.json', JSON.stringify(config, null, 2));
        console.log('   [OK] tsconfig.json updated: strict=true, noImplicitAny=true');
    } else {
        console.log('   [!] tsconfig.json not found.');
    }
} catch (e) {
    console.error('   [!] Failed to update tsconfig:', e.message);
}
'@
node -e $nodeScript

# 2. Run Compiler Check
Write-Host "2. Scanning codebase for type errors (tsc --noEmit)..." -ForegroundColor Yellow
Write-Host "   This may take a moment..." -ForegroundColor Gray

# Run tsc and redirect output. 
# In PowerShell, we capture stdout/stderr to file.
$logFile = "TYPE_ERRORS.log"
cmd /c "npx tsc --noEmit > $logFile 2>&1"

if (Test-Path $logFile) {
    $lineCount = (Get-Content $logFile).Count
}
else {
    $lineCount = 0
}

Write-Host "   [!] Scan Complete. Found approx $lineCount lines of output in $logFile." -ForegroundColor Red

# 3. Helper Guide
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "FIXING GUIDE: 'Implicit Any'" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Problem: TypeScript infers 'any' because you didn't specify a type." -ForegroundColor White
Write-Host "Risk: 'any' disables type checking, leading to runtime crashes." -ForegroundColor White
Write-Host ""
Write-Host "HOW TO FIX:" -ForegroundColor Yellow
Write-Host "-------------------------------------------------" -ForegroundColor Yellow
Write-Host "1. Function Arguments" -ForegroundColor White
Write-Host "   BAD:  function greet(name) { ... }" -ForegroundColor Gray
Write-Host "   GOOD: function greet(name: string) { ... }" -ForegroundColor Green
Write-Host ""
Write-Host "2. Objects / API Responses" -ForegroundColor White
Write-Host "   BAD:  const data = await res.json();" -ForegroundColor Gray
Write-Host "   GOOD: " -ForegroundColor Green
Write-Host "         interface User { id: string; name: string }" -ForegroundColor Green
Write-Host "         const data: User = await res.json();" -ForegroundColor Green
Write-Host ""
Write-Host "3. Event Handlers (React)" -ForegroundColor White
Write-Host "   BAD:  onChange={(e) => setValue(e.target.value)}" -ForegroundColor Gray
Write-Host "   GOOD: onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open '$logFile'." -ForegroundColor White
Write-Host "2. Fix errors file by file." -ForegroundColor White
Write-Host "3. Re-run this script until log is empty." -ForegroundColor White
