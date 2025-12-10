import { Page } from '@playwright/test';

export async function mockRestart(page: Page) {
  await page.route('**/api/restart/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ restart: false }),
    });
  });
}

