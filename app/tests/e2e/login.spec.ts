import { test, expect } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { customers, memberIdFor, mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';

test.describe('login', () => {
  const customer = customers[0];
  
  test('shows and hides dialog', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');

    await page.getByRole('button', { name: /Mitgliedsausweis/i }).click();
    await expect(page).toHaveScreenshot('member-id.png'); // expect member id dialog

    await page.keyboard.type(memberIdFor(customer.id));
    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(customer.first_name + ' ' + customer.last_name);
    await expect(page.getByText('Mitgliedsausweis zeigen')).toHaveCount(0);
    
    await expect(page).toHaveScreenshot('after-login.png'); // expect no dialog, name and grey buttons
  });
});
