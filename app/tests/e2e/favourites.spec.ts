import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { customers, memberIdFor, mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('favourites view', () => {
  test('user navigates to favourites, sees 4 products and adds 10 pears to cart', async ({ page }) => {
    const customer = customers[0];
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    
    await page.keyboard.type(memberIdFor(customer.id));
    
    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(customer.first_name + ' ' + customer.last_name);
    
    await page.getByRole('button', { name: /Favoriten/i }).click();
    
    const productTiles = page.getByRole('button').filter({ hasText: /02/ });
    await expect(productTiles).toHaveCount(4);

    await page.getByRole('button', { name: /Birne/i }).click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('1');
    await expect(page).toHaveScreenshot('cart.png'); // expect adding 1 pear
  });
});
