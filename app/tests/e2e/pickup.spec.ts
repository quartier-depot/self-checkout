import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { customers, memberIdFor, mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('browse view', () => {
  test('user navigates to pickup, sees 2 lists, adds 10 apples to cart', async ({ page }) => {
    const customer = customers[0];
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    
    await page.keyboard.type(memberIdFor(customer.id));
    
    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(customer.first_name + ' ' + customer.last_name);
    
    await page.getByRole('button', { name: /Abo/i }).click();

    await page.getByRole('button', { name: /Apfel/i }).click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('10');
    await expect(page).toHaveScreenshot('pick-up-add-apples-to-cart.png'); // expect adding 10 apples
  });
});
