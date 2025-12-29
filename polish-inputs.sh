#!/bin/bash

# =============================================================================
# Form Inputs Polish (Accessibility & Visibility)
# =============================================================================

echo "Initializing Form Polish..."
echo "================================================="

# 1. Backup
echo "1. Backing up Form components..."
cp src/components/ui/input.tsx src/components/ui/input.tsx.bak 2>/dev/null
cp src/components/ui/select.tsx src/components/ui/select.tsx.bak 2>/dev/null

# 2. Rewrite Input (Clean, Standard Shadcn + Custom Rings)
echo "2. Polishing Input Component..."
cat <<EOF > src/components/ui/input.tsx
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
EOF

# 3. Create Textarea (Missing Component)
echo "3. Creating Textarea Component..."
cat <<EOF > src/components/ui/textarea.tsx
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
EOF

# 4. Polish Select
echo "4. Polishing Select Component..."
# We assume the content wrapping SelectTrigger is mostly standard, but we ensure colors.
# Note: Since Select is complex (Radix), we just regex patch the Trigger to ensure correct border/bg.

node -e "
const fs = require('fs');
const file = 'src/components/ui/select.tsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Target: Trigger className
    // look for: className={cn(\"flex h-10 ...
    // ensure it has: border-input bg-background ring-offset-background focus:ring-primary
    
    // Replace ring-ring with ring-primary for user preference
    content = content.replace(/focus:ring-ring/g, 'focus:ring-primary');
    
    // Ensure border-input matches
    if (!content.includes('border-input')) {
        content = content.replace('border', 'border border-input');
    }

    fs.writeFileSync(file, content);
    console.log('   [✓] Select component updated (Ring Primary).');
}
"

echo ""
echo "================================================="
echo "Form Polish Complete!"
echo "1. Inputs now use 'bg-background' and 'border-input'."
echo "2. Focus states set to 'ring-primary'."
echo "3. Added 'src/components/ui/textarea.tsx'."
