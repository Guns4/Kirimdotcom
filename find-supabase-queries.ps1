# Find Supabase queries that need type casting
# This helps identify all .insert()/.update()/.upsert() calls in action files

Write-Host "Scanning for Supabase queries..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src/app/actions" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check for .insert(, .update(, .upsert(
    if ($content -match '\.from\([^)]+\)\s*\.(insert|update|upsert)\(') {
        if ($content -notmatch 'as any\)') {
            Write-Host "`n$($file.Name):" -ForegroundColor Yellow
            Select-String -Path $file.FullName -Pattern "\\.from\\([^)]+\\)\\s*\\.(insert|update|upsert)\\(" | 
                ForEach-Object { Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" }
        }
    }
}

Write-Host "`nScan complete." -ForegroundColor Green
