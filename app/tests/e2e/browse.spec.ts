import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('browse view', () => {
  test('user browses, sees 2 categories, opens softdrinks category and puts cola to cart', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    
    await page.getByRole('button', { name: /kein Barcode/i }).click();
    await expect(page).toHaveScreenshot('browse-two-categories.png'); // expect two categories

    await page.getByRole('button', { name: /softdrinks/i }).click();
    const productTiles = page.getByRole('button').filter({ hasText: /S01|S02/ });
    await expect(productTiles).toHaveCount(2);

    await page.getByRole('button', { name: /cola/i }).click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('1'); // expect 1 cola in cart
  });
});
