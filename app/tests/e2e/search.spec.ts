import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('search view', () => {
  test('user searches for 01, sees four products and puts spaghetti to cart', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    
    await page.getByRole('button', { name: /Nummer/i }).click();
    await page.getByTestId('search-pad').getByRole('button', { name: '0' }).click();
    await page.getByTestId('search-pad').getByRole('button', { name: '1' }).click();
    await expect(page).toHaveScreenshot('numpad.png'); // expect numpad

    await page.getByText('OK').click();
    const productTiles = page.getByRole('button').filter({ hasText: /01/ });
    await expect(productTiles).toHaveCount(4);
    await expect(page).toHaveScreenshot('spaghetti.png'); 

    await page.getByRole('button', { name: /spaghetti/i }).click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('1'); // expect 1 cola in cart
  });

});
