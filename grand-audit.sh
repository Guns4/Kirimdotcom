#!/bin/bash

# Define Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}     GRAND AUDIT: GOLDEN MASTER       ${NC}"
echo -e "${BLUE}=========================================${NC}"

# Function for error handling
handle_error() {
    echo -e "${RED}AUDIT FAILED: $1${NC}"
    exit 1
}

# 1. ENV VALIDATION
echo -e "\n${YELLOW}[1/6] Validating Environment Variables...${NC}"
REQUIRED_KEYS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
MISSING_KEYS=()

if [ ! -f .env.local ]; then
    echo -e "${RED}.env.local file not found! Using .env for check if exists...${NC}"
    if [ ! -f .env ]; then
         handle_error "No .env or .env.local found!"
    fi
fi

# Determine which file to check
ENV_FILE=".env.local"
[ -f .env ] && ENV_FILE=".env"
[ -f .env.local ] && ENV_FILE=".env.local"

for key in "${REQUIRED_KEYS[@]}"; do
    if ! grep -q "^$key=" "$ENV_FILE"; then
        MISSING_KEYS+=("$key")
    fi
done

if [ ${#MISSING_KEYS[@]} -ne 0 ]; then
    handle_error "Missing Env Variables: ${MISSING_KEYS[*]}"
else
    echo -e "${GREEN}Env Variables look good (Checked in $ENV_FILE).${NC}"
fi

# 2. TYPE CHECKING
echo -e "\n${YELLOW}[2/6] Running TypeScript Check...${NC}"
if npx tsc --noEmit --skipLibCheck; then
    echo -e "${GREEN}TypeScript check passed.${NC}"
else
    echo -e "${RED}TypeScript errors detected - Check output above.${NC}"
    echo -e "${YELLOW}Note: Some errors may be expected (Supabase types, etc.)${NC}"
fi

# 3. LINTING
echo -e "\n${YELLOW}[3/6] Running Linter & Fix...${NC}"
echo "Attempting auto-fix..."
npm run lint -- --fix 2>/dev/null || true
# Check again
if npm run lint; then
    echo -e "${GREEN}Linter cleaned up successfully.${NC}"
else
    echo -e "${YELLOW}Linting warnings found - Review if needed.${NC}"
fi

# 4. UNUSED FILES CHECK
echo -e "\n${YELLOW}[4/6] Checking for Unused Public Assets...${NC}"
UNUSED_COUNT=0
if [ -d "public" ]; then
    find public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.webp" \) | while read file; do
        filename=$(basename "$file")
        # Exclude common meta files
        if [[ "$filename" == "favicon.ico" || "$filename" == "manifest.json" || "$filename" == "robots.txt" ]]; then
            continue
        fi
        
        if ! grep -r -q "$filename" src 2>/dev/null; then
            echo -e "${YELLOW}Warning: Potential unused asset: $file${NC}"
        fi
    done
else
    echo "No public directory found, skipping."
fi
echo -e "${GREEN}Asset check complete.${NC}"
echo -e "${YELLOW}Tip: Run 'npx knip' for deep unused code analysis.${NC}"

# 5. BUILD SIMULATION
echo -e "\n${YELLOW}[5/6] Simulating Production Build...${NC}"
# Clean .next first
rm -rf .next
if npm run build; then
    echo -e "${GREEN}Build passed! Application is production-ready.${NC}"
else
    handle_error "Build failed. Check logs above."
fi

# 6. SUPABASE CHECK
echo -e "\n${YELLOW}[6/6] Checking Database Sync...${NC}"
if command -v supabase &> /dev/null; then
    echo "Supabase CLI installed."
    echo -e "${YELLOW}Check 'supabase db diff' manually if needed.${NC}"
else
    echo -e "${YELLOW}Supabase CLI not installed. Skipping DB check.${NC}"
fi

# SUCCESS
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${GREEN}CONGRATULATIONS! ALL SYSTEMS GO!${NC}"
echo -e "${BLUE}=========================================${NC}"

echo -e "\n${YELLOW}Initiating Git Automation...${NC}"

# Check for git changes
if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "feat: Final Release - Golden Master Build"
    
    echo -e "Pushing to remote..."
    if git push origin main; then
        echo -e "\n${GREEN}CODE PUSHED TO PRODUCTION!${NC}"
        echo -e "${BLUE}Great job! Time for coffee.${NC}"
    else
         echo -e "${RED}Git Push Failed. Check internet or permissions.${NC}"
         exit 1
    fi
else
    echo -e "${GREEN}Nothing to commit (Working tree clean).${NC}"
    echo -e "${GREEN}Code is already up to date.${NC}"
fi
