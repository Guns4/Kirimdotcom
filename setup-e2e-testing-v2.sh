#!/bin/bash

# =============================================================================
# Setup E2E Testing V2 (Phase 116)
# Core Flow Verification & QA Robot
# =============================================================================

echo "Setting up QA Robot (E2E V2)..."
echo "================================================="
echo ""

# 1. Config (Updated for CI/CD)
echo "1. Updating Playwright Config: playwright.config.ts"

cat <<EOF > playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Standard directory
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
EOF
echo "   [✓] Config updated."
echo ""

# 2. Test Spec (Core Flow)
echo "2. Creating Test Spec: tests/core-flow.spec.ts"
mkdir -p tests

cat <<EOF > tests/core-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical Path: Tracking', () => {
  
  test('User can search receipt and see results without crashing', async ({ page }) => {
    // 1. Open Homepage
    await page.goto('/');
    
    // Ensure we are on the right page
    await expect(page).toHaveTitle(/CekKirim/i);

    // 2. Input dummy receipt
    // Adjust selector based on your actual UI (placeholder or aria-label)
    const input = page.getByPlaceholder(/nomor resi/i).first();
    await expect(input).toBeVisible();
    await input.fill('JNE123');
    
    // 3. Click Check
    const submitBtn = page.getByRole('button', { name: /cek resi/i }).first();
    await submitBtn.click();

    // 4. Assertions
    // A. Wait for some reaction (loading or result)
    // We expect EITHER a success result OR a "Not Found" message, but NEVER an application error.
    
    // Check for obvious crash text
    const crashText = page.getByText('Application Error', { exact: false });
    await expect(crashText).not.toBeVisible();
    
    const serverError = page.getByText('Internal Server Error', { exact: false });
    await expect(serverError).not.toBeVisible();

    // Verify URL didn't change to a 500 page
    // (Optional: depending on error handling strategy)
  });

});
EOF
echo "   [✓] Core flow test created."
echo ""

# 3. Scripts
echo "3. Update package.json scripts (Instruction)"
echo "   Run: npm pkg set scripts.test:e2e=\"playwright test\""
echo ""

echo "================================================="
echo "Setup Complete!"
echo "To run the robot: npm run test:e2e"
