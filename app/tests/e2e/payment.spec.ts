import { test, expect, Page } from '@playwright/test';
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
    await expect(page).toHaveScreenshot('cart.png');
    
    await page.getByRole('button', { name: /Guthaben/i }).click();
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/3001/);
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/#walletTransactionId/);
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/Vielen Dank/);
    await expect(page).toHaveScreenshot('confirmation-wallet.png');
  });

  test('with payrexx', async ({ page }) => {
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
    await expect(page).toHaveScreenshot('cart.png'); 

    await page.getByRole('button', { name: /Twint/i }).click();

    await expect(page.getByText('Mock Payrexx Gateway')).toHaveCount(1);
    await page.getByText("Bezahlen").click();
    await expect(page.getByText(/Bezahlung/)).toHaveCount(1);
    await expect(page).toHaveScreenshot('progress-payrexx.png');
    
    await untilPayrexxWebhookSesOrderStatusToCompleted(page);
    
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/3001/);
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/#payrexxTransactionId/);
    await expect(page.getByTestId('confirmation-dialog')).toHaveText(/Vielen Dank/);
    await expect(page).toHaveScreenshot('confirmation-payrexx.png');
  });

  test('with payrexx failure', async ({ page }) => {
    await mockWoocommerce(page);
    await mockPayrexx(page);
    await mockRestart(page);

    await page.goto('/');
    await expect(page).toHaveScreenshot('start.png');

    await page.keyboard.type(memberIdFor(customer.id));
    await page.getByRole('button', { name: /kein Barcode/i }).click();
    await page.getByRole('button', { name: /softdrinks/i }).click();
    await page.getByRole('button', { name: /cola/i }).click();

    await page.getByRole('button', { name: /Twint/i }).click();

    await expect(page.getByText('Mock Payrexx Gateway')).toHaveCount(1);
    await page.getByText("Bezahlen").click();
    await expect(page.getByText(/Bezahlung/)).toHaveCount(1);

    await untilPayrexxWebhookSesOrderStatusToCancelled(page);
    
    await expect(page.getByTestId('failure-dialog')).toHaveText(/3001/);
    await expect(page.getByTestId('failure-dialog')).toHaveText(/#payrexxTransactionId/);
    await expect(page.getByTestId('failure-dialog')).toHaveText(/Es ist ein Fehler aufgetreten/);
    await expect(page).toHaveScreenshot('failure-payrexx.png');
  });
});

async function untilPayrexxWebhookSesOrderStatusToCompleted(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await fetch(`/wp-json/wc/v3/orders/3001`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'completed' }),
    });
  });
}

async function untilPayrexxWebhookSesOrderStatusToCancelled(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await fetch(`/wp-json/wc/v3/orders/3001`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
  });
}