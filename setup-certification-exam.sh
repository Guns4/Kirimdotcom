#!/bin/bash

# setup-certification-exam.sh
# Certification System Setup

echo ">>> Setting up Certification System..."

# Components Created:
# 1. src/lib/quiz-engine.ts (Mock Data)
# 2. src/app/actions/certification.ts (Grading Logic)
# 3. src/components/academy/CertificateGenerator.tsx (PDF Gen)
# 4. src/app/academy/[slug]/exam/page.tsx (Exam UI)

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
echo "Exam Live at: http://localhost:3000/academy/business-online-101/exam"
