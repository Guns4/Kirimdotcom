#!/bin/bash

# Execute ALL Scripts - Master Orchestrator
# Runs all 320+ scripts and logs results

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     MASTER SCRIPT EXECUTOR - ALL CATEGORIES              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

source ./master-runner.sh

SCRIPTS_DIR="./scripts"
total_success=0
total_failed=0
total_skipped=0

# Get all setup scripts
scripts=$(find "$SCRIPTS_DIR" -name "setup-*.sh" -type f | sort)
script_count=$(echo "$scripts" | wc -l)

echo "Found $script_count setup scripts to execute"
echo "Starting bulk execution..."
echo ""

# Execute each script
for script in $scripts; do
    if execute_script "$script"; then
        ((total_success++))
    else
        if [ -f "$script" ]; then
            ((total_failed++))
        else
            ((totalskipped++))
        fi
    fi
done

# Final Summary
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  EXECUTION COMPLETE!                     ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Total Scripts: $script_count"
echo "║  Successful:    $total_success"
echo "║  Failed:        $total_failed"
echo "║  Skipped:       $total_skipped"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Log file: script-execution-log.txt"
echo "Check individual .log files for details on any failures"
