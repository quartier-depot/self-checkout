import { test, expect, Page } from '@playwright/test';
import { mockRestart } from './mock/restart';
import { customers, memberIdFor, mockWoocommerce } from './mock/woocommerce';
import { mockPayrexx } from './mock/payrexx';
import { formatCustomer } from '../../src/format/formatCustomer';

test.describe('login', () => {
  const customerA = customers[0];
  const customerB = customers[1];
  
  test('shows and hides dialog', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');

    await page.getByRole('button', { name: /Mitgliedsausweis/i }).click();
    await expect(page).toHaveScreenshot('member-id.png'); // expect member id dialog

    await login(page, customerA);
    await expect(page.getByText('Mitgliedsausweis zeigen')).toHaveCount(0);
    
    await expect(page).toHaveScreenshot('after-login.png'); // expect no dialog, name and grey buttons
  });

  test('asks to choose when changing customer', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    await login(page, customerA);
    await page.keyboard.type(memberIdFor(customerB.id));

    await expect(page.getByText('Jemand anderes kauft gerade ein')).toBeInViewport();
    await page.getByRole('button', {name: formatCustomer(customerB)}).click();

    await expect(page.getByText('Jemand anderes kauft gerade ein')).not.toBeInViewport();
    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(formatCustomer(customerB));
  });

  test('does not ask when customer logs in twice', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    await login(page, customerA);
    await login(page, customerA);

    await expect(page.getByText('Jemand anderes kauft gerade ein')).not.toBeInViewport();
  });
  
  async function login(page: Page, customer: {id: number, first_name: string, last_name: string}) {
    await page.keyboard.type(memberIdFor(customer.id));
    const locator = page.getByTestId('customer-title');
    await expect(locator).toHaveText(formatCustomer(customer));
  }
});
