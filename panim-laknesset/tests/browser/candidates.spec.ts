import { test, expect } from '@playwright/test';

test('all 22 supplied names appear without test mode, and sources remain explicitly unverified', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'ישר! איזנקוט', exact: true }).click();
  await page.getByRole('button', { name: 'המשך למפת הגוש' }).click();
  await page.getByRole('button', { name: 'המשך לבחירת אנשים' }).click();
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await expect(page.locator('.selection-toolbar')).toContainText('22 מועמדים מנתוני הפיילוט');
  const names: string[] = [];
  for (let i = 0; i < 4; i++) {
    names.push(...await page.locator('.candidate-card .candidate-info>strong').allTextContents());
    await expect(page.locator('.candidate-grid')).not.toContainText('פרטים טרם אומתו');
    await expect(page.locator('.candidate-grid')).not.toContainText('איזנקוט');
    await expect(page.locator('.candidate-grid')).not.toContainText('ליברמן');
    const images = await page.locator('.candidate-card img').evaluateAll(nodes => nodes.map(img => img.getAttribute('src')));
    expect(images.every(path => path === '/silhouette.svg')).toBe(true);
    if (i === 0) await page.locator('.candidate-card').first().click();
    if (i < 3) await page.getByRole('button', { name: 'עמוד הבא' }).click();
  }
  expect(names).toHaveLength(22);
  expect(new Set(names).size).toBe(22);
  expect(names).toContain('ניר חג׳בי');
  expect(names).toContain('נאור שירי');
  expect(names).toContain('תומר אביטל');
  await page.getByRole('button', { name: 'הצג את התוצאות שלי' }).click();
  await expect(page.locator('.comparison-footnote')).toContainText('אינו המלצת הצבעה');
  await page.locator('.candidate-sources summary').click();
  await expect(page.locator('.candidate-sources li')).toHaveCount(22);
  await expect(page.locator('.candidate-sources')).toContainText('לא אימות עצמאי');
  await expect(page.locator('.candidate-sources a').first()).toHaveAttribute('href', 'https://www.knessetlens.com/members/142');
  await page.reload();
  await expect(page.locator('.alignment-summary')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
