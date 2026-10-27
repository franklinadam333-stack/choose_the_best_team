import { test, expect } from '@playwright/test';

test('progress, back and continue stay consistent and preserve selections', async ({ page }) => {
  await page.goto('/');
  const controls = page.getByRole('region', { name: 'התקדמות וניווט' });
  const progress = page.getByRole('progressbar', { name: 'התקדמות בתהליך' });
  await expect(progress).toHaveAttribute('value', '0');
  await expect(controls.getByRole('button', { name: 'לשלב הקודם' })).toBeDisabled();
  await expect(controls.getByRole('button', { name: 'לשלב הבא' })).toBeDisabled();
  await page.getByRole('radio', { name: 'ישר! איזנקוט', exact: true }).click();
  await controls.getByRole('button', { name: 'לשלב הבא' }).click();
  await expect(progress).toHaveAttribute('value', '33');
  await page.getByRole('button', { name: 'הוסף מנדט: ישר! איזנקוט', exact: true }).click();
  await expect(controls.getByRole('button', { name: 'לשלב הבא' })).toBeDisabled();
  await expect(page.getByRole('navigation', { name: 'שלבי הסימולטור' }).getByRole('button', { name: 'בוחרים אנשים' })).toBeDisabled();
  await page.getByRole('button', { name: 'שחזור חלוקת ברירת המחדל' }).click();
  await controls.getByRole('button', { name: 'לשלב הבא' }).click();
  await expect(progress).toHaveAttribute('value', '67');
  await expect(controls.getByRole('button', { name: 'לשלב הבא' })).toBeDisabled();
  await page.locator('.candidate-card').first().click();
  await controls.getByRole('button', { name: 'לשלב הבא' }).click();
  await expect(progress).toHaveAttribute('value', '100');
  await expect(controls).toContainText('הגעת לסיכום');
  await controls.getByRole('button', { name: 'לשלב הקודם' }).click();
  await expect(progress).toHaveAttribute('value', '67');
  await expect(page.locator('.selection-count')).toHaveText('בחרת 1 מתוך 10');
  await page.getByRole('navigation', { name: 'שלבי הסימולטור' }).getByRole('button', { name: 'הכוונה שלך' }).click();
  await expect(progress).toHaveAttribute('value', '0');
  await expect(page.getByRole('radio', { name: 'ישר! איזנקוט', exact: true })).toHaveAttribute('aria-checked', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('restart is available and clears preferences from every step', async ({ page }) => {
  await page.goto('/');
  for (const step of [1, 2, 3, 4]) {
    await page.evaluate((currentStep) => localStorage.setItem('panim-laknesset-session-v1', JSON.stringify({ version: 1, step: currentStep, initialVote: 'eisenkot', baseline: { eisenkot: 21, bennett: 13, golan: 8, lieberman: 8 }, selectedIds: ['eisenkot-22'], demo: false, scenario: 53 })), step);
    await page.reload();
    const reset = page.getByRole('button', { name: 'התחל מחדש', exact: true });
    await expect(reset).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    await reset.click();
    await expect(page.getByRole('progressbar', { name: 'התקדמות בתהליך' })).toHaveAttribute('value', '0');
    await expect(page.getByRole('button', { name: 'המשך למפת הגוש' })).toBeDisabled();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('panim-laknesset-session-v1')!));
    expect(saved.initialVote).toBeNull();
    expect(saved.selectedIds).toEqual([]);
  }
});
