import { test, expect } from '@playwright/test';

test('share metadata serves the correct image and sharing excludes preferences', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value: string) => { (window as unknown as { sharedText: string }).sharedText = value; } }, configurable: true });
  });
  await page.goto('/');
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'העתקת קישור' }).click();
  const shared = await page.evaluate(() => (window as unknown as { sharedText: string }).sharedText);
  expect(shared).toBe(new URL(page.url()).origin);
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toContain('/opengraph-image.png');
  const response = await page.request.get(new URL(image!).pathname);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  const body = await response.body();
  expect(body.readUInt32BE(16)).toBe(1200);
  expect(body.readUInt32BE(20)).toBe(630);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});
