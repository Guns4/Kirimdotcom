import { test, expect, type Page } from '@playwright/test';

test.describe('Critical Path: Tracking', () => {

    test('User can search receipt and see results without crashing', async ({ page }: { page: Page }) => {
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
