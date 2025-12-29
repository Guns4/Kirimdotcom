#!/bin/bash

# =============================================================================
# Modern SaaS Theme Overhaul (Stripe/Linear Style)
# =============================================================================

echo "Initializing Theme Overhaul..."
echo "================================================="

# 1. Backup
echo "1. Backing up existing configuration..."
cp src/app/globals.css src/app/globals.css.bak 2>/dev/null || echo "   [!] Globals.css not found, skipping backup."
cp tailwind.config.ts tailwind.config.ts.bak 2>/dev/null || echo "   [!] Tailwind config not found, skipping backup."

# 2. Rewrite Global CSS
echo "2. Writing new Modern SaaS CSS to src/app/globals.css..."
cat <<EOF > src/app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light Mode - Clean, Stripe-ish */
    --background: 0 0% 100%;       /* White */
    --foreground: 222 47% 11%;     /* Deep Navy */
    
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
 
    --primary: 221 83% 53%;        /* Electric Blue */
    --primary-foreground: 210 40% 98%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222 47% 11.2%;
 
    --muted: 210 40% 96%;          /* Soft Blue Gray */
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222 47% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221 83% 53%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    /* Dark Mode - High Contrast, Deep Navy */
    --background: 222 47% 11%;     /* Deep Navy/Black */
    --foreground: 210 40% 98%;     /* White */
 
    --card: 222 47% 13%;           /* Slightly lighter than bg */
    --card-foreground: 210 40% 98%;
 
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 217 91% 60%;        /* Blue Luminous */
    --primary-foreground: 222 47% 11.2%;
 
    --secondary: 217 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217 33% 17%;          /* Darker Blue Gray */
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 217 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217 32.6% 17.5%;
    --input: 217 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF

# 3. Update Tailwind Config
echo "3. Updating tailwind.config.ts to use CSS Variables..."

node -e "
const fs = require('fs');
const configFile = 'tailwind.config.ts';

try {
    let content = fs.readFileSync(configFile, 'utf8');

    // Define the new colors object string
    const newColors = \`colors: {
                border: \"hsl(var(--border))\",
                input: \"hsl(var(--input))\",
                ring: \"hsl(var(--ring))\",
                background: \"hsl(var(--background))\",
                foreground: \"hsl(var(--foreground))\",
                primary: {
                    DEFAULT: \"hsl(var(--primary))\",
                    foreground: \"hsl(var(--primary-foreground))\",
                },
                secondary: {
                    DEFAULT: \"hsl(var(--secondary))\",
                    foreground: \"hsl(var(--secondary-foreground))\",
                },
                destructive: {
                    DEFAULT: \"hsl(var(--destructive))\",
                    foreground: \"hsl(var(--destructive-foreground))\",
                },
                muted: {
                    DEFAULT: \"hsl(var(--muted))\",
                    foreground: \"hsl(var(--muted-foreground))\",
                },
                accent: {
                    DEFAULT: \"hsl(var(--accent))\",
                    foreground: \"hsl(var(--accent-foreground))\",
                },
                popover: {
                    DEFAULT: \"hsl(var(--popover))\",
                    foreground: \"hsl(var(--popover-foreground))\",
                },
                card: {
                    DEFAULT: \"hsl(var(--card))\",
                    foreground: \"hsl(var(--card-foreground))\",
                },
            },\`;

    // Regex to find the existing colors object inside theme.extend
    // Logic: Look for 'colors: {' and capture until the matching closing brace.
    // Simplifying assumption: standard formatting or standard object structure from previous tools.
    // We'll use a slightly safer replacement by targeting the known structure we saw in view_file.
    
    // We saw: colors: { ... } inside extend.
    // Replacement:
    const updatedContent = content.replace(/colors:\s*\{[\s\S]*?\n\s*\},\s*\n/m, newColors + '\n');
    
    if (content !== updatedContent) {
        fs.writeFileSync(configFile, updatedContent);
        console.log('   [✓] tailwind.config.ts updated successfully.');
    } else {
        console.error('   [!] Could not automatically replace colors object. Please check regex match.');
    }

} catch (e) {
    console.error('   [!] Error updating tailwind config:', e.message);
}
"

echo ""
echo "================================================="
echo "Theme Overhaul Complete!"
echo "1. Verify 'tailwind.config.ts' syntax."
echo "2. Run 'npm run dev' to see the new Linear-style colors."
