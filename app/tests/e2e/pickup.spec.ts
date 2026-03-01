import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { customers, memberIdFor, mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('browse view', () => {
  test('user 1 navigates to pickup, sees 2 lists, adds 10 apples to cart', async ({ page }) => {
    const customer = customers[0];
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    
    await page.keyboard.type(memberIdFor(customer.id));
    
    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(customer.first_name + ' ' + customer.last_name);
    
    await page.getByRole('button', { name: /Vorbestellungen/i }).click();
    

    await page.getByRole('button', { name: /Apfel/i }).click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('10');
    await expect(page).toHaveScreenshot('cart.png'); // expect adding 10 apples
  });

  test('user 2 navigates to pickup, sees many items and a scrollbar', async ({ page }) => {
    const customer = customers[1];
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');

    await page.keyboard.type(memberIdFor(customer.id));

    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(customer.first_name + ' ' + customer.last_name);

    await page.getByRole('button', { name: /Vorbestellungen/i }).click();
    await expect(page).toHaveScreenshot('scrollbar.png'); 
  });
});
