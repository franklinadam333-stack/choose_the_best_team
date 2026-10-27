import { test, expect } from '@playwright/test';

test('five random candidates, carousel controls, fresh draw and no implicit preference', async ({ page }) => {
  await page.goto('/');
  const gallery = page.getByRole('region', { name: 'איזה ח"כ אתה מעדיף' });
  await expect(gallery.locator('.gallery-card')).toHaveCount(5);
  const before = await gallery.locator('.gallery-card>strong').allTextContents();
  expect(new Set(before).size).toBe(5);
  await expect(gallery).toContainText('מתוך 22');
  await expect(gallery.locator('.gallery-card.gallery-active')).toHaveCount(1);
  await gallery.getByRole('button', { name: 'המועמד הבא בגלריה' }).click();
  await expect(gallery.locator('.gallery-card').nth(1)).toHaveClass(/gallery-active/);
  await gallery.getByRole('button', { name: 'המועמד הקודם בגלריה' }).click();
  await expect(gallery.locator('.gallery-card').first()).toHaveClass(/gallery-active/);
  await gallery.locator('.gallery-options button').last().click();
  await expect(gallery.locator('.gallery-card').last()).toHaveClass(/gallery-active/);
  await gallery.getByRole('button', { name: 'הגרלת 5 אחרים' }).click();
  const after = await gallery.locator('.gallery-card>strong').allTextContents();
  expect(after).toHaveLength(5);
  expect(after.every(name => !before.includes(name))).toBe(true);
  await expect(gallery.locator('.gallery-card').first()).toHaveClass(/gallery-active/);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('panim-laknesset-session-v1')!));
  expect(stored.initialVote).toBeNull();
  expect(stored.selectedIds).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion disables autoplay, with working explicit play and pause', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  const gallery = page.getByRole('region', { name: 'איזה ח"כ אתה מעדיף' });
  await expect(gallery.locator('.gallery-card')).toHaveCount(5);
  await expect(gallery.getByRole('button', { name: 'הפעלת הגלריה' })).toBeVisible();
  await page.clock.fastForward(6000);
  await expect(gallery.locator('.gallery-card').first()).toHaveClass(/gallery-active/);
  await gallery.getByRole('button', { name: 'הפעלת הגלריה' }).click();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(5100);
  await expect(gallery.locator('.gallery-card').nth(1)).toHaveClass(/gallery-active/);
  await gallery.getByRole('button', { name: 'השהיית הגלריה' }).click();
  await page.clock.fastForward(6000);
  await expect(gallery.locator('.gallery-card').nth(1)).toHaveClass(/gallery-active/);
});
