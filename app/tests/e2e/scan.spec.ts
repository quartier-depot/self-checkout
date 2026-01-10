import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { memberIdFor, mockWoocommerce, vegetables } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('scan', () => {
  test('user scans barcode and product is in his cart', async ({ page }) => {

    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    
    await page.keyboard.type("1234567890302"); // barcode of product
    
    await expect(page.getByTestId('cart-quantity')).toHaveText('1'); // expect 1 spinach in cart
    await expect(page).toHaveScreenshot('cart.png'); // expect two categories
  });
});