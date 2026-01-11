import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { customers, memberIdFor, mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('payment', () => {
  const customer = customers[0];
  
  test('with wallet', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    await expect(page).toHaveScreenshot('start.png');

    await page.keyboard.type(memberIdFor(customer.id));
    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(customer.first_name + ' ' + customer.last_name);

    await page.getByRole('button', { name: /kein Barcode/i }).click();
    await page.getByRole('button', { name: /softdrinks/i }).click();
    await page.getByRole('button', { name: /cola/i }).click();
    await expect(page).toHaveScreenshot('cart.png'); // expect name and grey button
    
    await page.getByRole('button', { name: /Guthaben/i }).click();
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/#newOrderId/);
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/#walletTransactionId/);
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/Vielen Dank/);
    await expect(page).toHaveScreenshot('confirmation-wallet.png');
  });
});
