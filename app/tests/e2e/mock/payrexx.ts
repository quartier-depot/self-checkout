import { Page } from '@playwright/test';

export async function mockPayrexx(page: Page) {
  await page.route('**/payrexx/v1.13/SignatureCheck**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success' }),
    });
  });
}