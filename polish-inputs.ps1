# Form Inputs Polish (Accessibility & Visibility) (PowerShell)

Write-Host "Initializing Form Polish..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Backup
Write-Host "1. Backing up Form components..." -ForegroundColor Yellow
$inputPath = "src\components\ui\input.tsx"
$selectPath = "src\components\ui\select.tsx"

if (Test-Path $inputPath) { Copy-Item $inputPath "$inputPath.bak" -Force }
if (Test-Path $selectPath) { Copy-Item $selectPath "$selectPath.bak" -Force }

# 2. Rewrite Input (Clean, Standard Shadcn + Custom Rings)
Write-Host "2. Polishing Input Component..." -ForegroundColor Yellow
$inputContent = @'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
         {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
                {leftIcon}
            </div>
         )}
         <input
            type={type}
            className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
            )}
            ref={ref}
            {...props}
        />
         {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
                {rightIcon}
            </div>
         )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
'@
$inputContent | Set-Content -Path $inputPath -Encoding UTF8

# 3. Create Textarea
Write-Host "3. Creating Textarea Component..." -ForegroundColor Yellow
$textareaContent = @'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
'@
$textareaContent | Set-Content -Path "src\components\ui\textarea.tsx" -Encoding UTF8

# 4. Polish Select
Write-Host "4. Polishing Select Component..." -ForegroundColor Yellow
if (Test-Path $selectPath) {
    $content = Get-Content $selectPath -Raw -Encoding UTF8
    
    # Replace ring-ring with ring-primary
    $content = $content -replace "focus:ring-ring", "focus:ring-primary"
    $content = $content -replace "focus:ring-1", "focus:ring-2"
    
    # Ensure border-input matches (simple check)
    if ($content -notmatch "border-input") {
        $content = $content -replace "border", "border border-input"
    }
    
    $content | Set-Content -Path $selectPath -Encoding UTF8
    Write-Host "   [?] Select component updated (Ring Primary)." -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Form Polish Complete!" -ForegroundColor Green
Write-Host "1. Inputs now use 'bg-background' and 'border-input'." -ForegroundColor White
Write-Host "2. Focus states set to 'ring-primary'." -ForegroundColor White
Write-Host "3. Added 'src/components/ui/textarea.tsx'." -ForegroundColor White
