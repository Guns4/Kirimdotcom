# Code Consistency & Formatting Automation (PowerShell)

Write-Host "Starting Code Consistency Audit..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Install Dependencies
Write-Host "1. Installing ESLint plugins & Prettier..." -ForegroundColor Yellow
npm install --save-dev prettier eslint-config-prettier eslint-plugin-react-hooks

# 2. Configure ESLint (Strict + Prettier Compatible)
Write-Host "2. Generating strict .eslintrc.json..." -ForegroundColor Yellow

$eslintConfig = @'
{
  "extends": [
    "next/core-web-vitals",
    "prettier" 
  ],
  "plugins": [
    "react-hooks"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "off", 
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
'@

$eslintConfig | Set-Content -Path ".eslintrc.json" -Encoding UTF8
Write-Host "   [?] .eslintrc.json configured." -ForegroundColor Green

# 3. Configure Prettier
Write-Host "2b. Generating .prettierrc..." -ForegroundColor Yellow
$prettierConfig = @'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
'@

$prettierConfig | Set-Content -Path ".prettierrc" -Encoding UTF8

# 4. Auto-Fix Code
Write-Host "3. Running Auto-Fix (Linting & Formatting)..." -ForegroundColor Yellow
Write-Host "   This will automatically fix indentation, spacing, and simple errors." -ForegroundColor Gray

# Run lint fix
# Note: npm run lint usually runs 'next lint'. We pass -- --fix
npm run lint -- --fix
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [?] Linting Complete. Code is clean." -ForegroundColor Green
}
else {
    Write-Host "   [!] Linting finished with some manual errors remaining." -ForegroundColor Red
}

# Run prettier write
# Note: glob pattern logic in PS can vary, but quotes passed to npx work.
npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md}"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Audit Complete!" -ForegroundColor Green
Write-Host "Your code should now be formatted and consistent." -ForegroundColor White
