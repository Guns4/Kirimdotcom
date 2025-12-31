#!/bin/bash

# Master Script Runner
# Executes setup scripts in batches with logging and error handling

# Don't exit on error - we want to continue executing other scripts
# set -e

SCRIPT_DIR="./scripts"
LOG_FILE="script-execution-log.txt"
RESULTS_FILE="batch-results.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize log file if not exists
if [ ! -f "$LOG_FILE" ]; then
    echo "Script Execution Log - Started at $(date '+%Y-%m-%d %H:%M:%S')" > "$LOG_FILE"
    echo "========================================" >> "$LOG_FILE"
fi

# Function to log execution
log_execution() {
    local script=$1
    local status=$2
    local message=$3
    
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $script - $status: $message"
    
    # Simple text-based logging
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $script - $status: $message" >> "$LOG_FILE"
}

# Function to execute a single script
execute_script() {
    local script=$1
    
    echo -e "\n${YELLOW}=== Executing: $script ===${NC}"
    
    if [ ! -f "$script" ]; then
        log_execution "$script" "SKIPPED" "File not found"
        return 1
    fi
    
    # Make executable
    chmod +x "$script"
    
    # Execute and capture output
    if bash "$script" > "${script}.log" 2>&1; then
        log_execution "$script" "SUCCESS" "Executed successfully"
        
        # Delete script after successful execution
        rm "$script"
        echo -e "${GREEN}✓ Script executed and deleted${NC}"
        return 0
    else
        log_execution "$script" "FAILED" "Execution failed - check ${script}.log"
        echo -e "${RED}✗ Script failed - log saved to ${script}.log${NC}"
        return 1
    fi
}

# Function to execute a batch of scripts
execute_batch() {
    local batch_name=$1
    shift
    local scripts=("$@")
    
    echo -e "\n${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  BATCH: $batch_name${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"
    
    local success_count=0
    local fail_count=0
    local skip_count=0
    
    for script in "${scripts[@]}"; do
        if execute_script "$script"; then
            ((success_count++))
        else
            if [ -f "$script" ]; then
                ((fail_count++))
            else
                ((skip_count++))
            fi
        fi
    done
    
    # Summary
    echo -e "\n${YELLOW}=== Batch Summary ===${NC}"
    echo -e "${GREEN}Success: $success_count${NC}"
    echo -e "${RED}Failed: $fail_count${NC}"
    echo -e "${YELLOW}Skipped: $skip_count${NC}"
    
    # Save batch results
    echo "Batch: $batch_name" >> "$RESULTS_FILE"
    echo "Success: $success_count, Failed: $fail_count, Skipped: $skip_count" >> "$RESULTS_FILE"
    echo "---" >> "$RESULTS_FILE"
    
    return $fail_count
}

# Export functions for use in category scripts
export -f execute_script
export -f log_execution
export -f execute_batch

echo -e "${GREEN}Master Script Runner Initialized${NC}"
echo -e "Log file: $LOG_FILE"
echo -e "Results file: $RESULTS_FILE\n"
