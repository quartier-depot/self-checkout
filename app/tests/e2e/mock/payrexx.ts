import { Page } from '@playwright/test';

export async function mockPayrexx(page: Page) {
  await page.route('**/payrexx/v1.13/SignatureCheck**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success' }),
    });
  });  
  
  await page.route('**/payrexx/v1.13/Gateway**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: "success",
        data: [
          {
            id: 1,
            referenceId: "#newTransactionId",
            link: `${process.env.BASE_URL}/mock-payment-gateway`,
          }
        ]
      }),
    });
  });

  await page.route('**/mock-payment-gateway', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
            <html lang="en-US">
              <body>
                <h1>Mock Payrexx Gateway</h1>
                <a id="simulate-success" href="/">Bezahlen</a>
              </body>
            </html>
          `,
    });
  });
}