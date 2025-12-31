#!/bin/bash

# setup-review-prompt.sh
# Reputation Management (Phase 1841-1850)

echo ">>> Setting up Review Prompt System..."

# 1. Components Created:
# - src/hooks/useReviewPrompt.ts (Logic & Flow)
# - src/components/feedback/ReviewPrompt.tsx (UI Modal)

echo ">>> Features:"
echo "  1. Happy Moment Trigger (Delivered / Withdraw Success)"
echo "  2. Smart Flow:"
echo "     - Happy -> Play Store (5 Stars)"
echo "     - Unhappy -> Internal Feedback (Handling)"

echo ""
echo ">>> Integration Instructions:"
echo "1. In your Layout/Provider:"
echo "   const { isOpen, triggerReview, handlePositive, handleNegative, close } = useReviewPrompt();"
echo "   "
echo "   return ("
echo "     <>"
echo "       {children}"
echo "       <ReviewPrompt isOpen={isOpen} onPositive={handlePositive} onNegative={handleNegative} onClose={close} />"
echo "     </>"
echo "   )"

echo "2. Usage:"
echo "   const { triggerReview } = useReviewPrompt();"
echo "   // When package delivered:"
echo "   triggerReview({ trigger: 'DELIVERED', id: 'RESI-123' });"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
