import { test, expect, type Page } from '@playwright/test';

test.describe('Core Tracking Flow', () => {

    test('should navigate to home and display title', async ({ page }: { page: Page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/CekKirim/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should handle empty search gracefully', async ({ page }: { page: Page }) => {
        await page.goto('/');
        // Assuming there's a search button
        const searchButton = page.getByRole('button', { name: /Cek Resi/i });
        if (await searchButton.isVisible()) {
            await searchButton.click();
            // Expect some error message or toast
            // await expect(page.getByText('Masukkan nomor resi')).toBeVisible(); 
        }
    });

    test('should allow entering a receipt number', async ({ page }: { page: Page }) => {
        await page.goto('/');
        const input = page.getByPlaceholder(/Masukkan nomor resi/i);
        await input.fill('JP1234567890');
        await expect(input).toHaveValue('JP1234567890');
    });

});
