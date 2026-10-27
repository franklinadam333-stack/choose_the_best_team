import { test, expect } from '@playwright/test';

test('complete RTL four-step journey, limits, tabs, persistence, alternative and clear', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await page.getByRole('radio', { name: 'ישר! איזנקוט', exact: true }).click();
  await page.getByRole('button', { name: 'המשך למפת הגוש' }).click();
  await expect(page.getByRole('status').filter({ hasText: '50 / 50' })).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'הפחת מנדט: ישר! איזנקוט', exact: true }).click();
  await expect(page.getByRole('button', { name: 'המשך לבחירת אנשים' })).toBeDisabled();
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'הוסף מנדט: הדמוקרטים, גולן', exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'הפחת מנדט: ישראל ביתנו, ליברמן', exact: true }).click();
  await page.getByRole('button', { name: 'המשך לבחירת אנשים' }).click();
  await expect(page.getByRole('heading', { name: 'ממתינים לנתונים שאפשר לסמוך עליהם' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'הפעלת מצב בדיקה עם מקומות לא מאומתים' }).check();
  await expect(page.locator('.candidate-card')).toHaveCount(6);
  await expect(page.locator('.candidate-grid')).not.toContainText('איזנקוט');
  for (let i = 0; i < 6; i++) await page.locator('.candidate-card').nth(i).click();
  await page.getByRole('button', { name: 'עמוד הבא' }).click();
  for (let i = 0; i < 4; i++) await page.locator('.candidate-card').nth(i).click();
  await expect(page.locator('.selection-count')).toHaveText('בחרת 10 מתוך 10');
  await expect(page.locator('.candidate-card').nth(4)).toBeDisabled();
  await page.locator('.candidate-card').nth(0).click();
  await expect(page.locator('.selection-count')).toHaveText('בחרת 9 מתוך 10');
  await page.locator('.candidate-card').nth(4).click();
  await page.getByRole('button', { name: 'הצג את התוצאות שלי' }).click();
  await expect(page.getByRole('heading', { name: 'אותן בחירות. שלושה תרחישים.' })).toBeVisible();
  await expect(page.locator('.demo-result-label')).toContainText('תוצאות בדיקה בלבד');
  await expect(page.locator('.original-intention strong')).toHaveText('ישר! איזנקוט');
  for (const n of [53, 56, 60]) {
    await page.getByRole('tab', { name: new RegExp(`^${n} מנדטים`) }).click();
    await expect(page.locator('.scenario-summary h3')).toHaveText(`בתרחיש ${n} המנדטים`);
  }
  await page.reload();
  await expect(page.getByRole('tab', { name: /^60 מנדטים/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByText('חלוקה חלופית בתוך תרחיש 60', { exact: true }).click();
  const advanced = page.locator('.advanced-panel');
  await advanced.getByRole('button', { name: 'הוסף מנדט: ישר! איזנקוט', exact: true }).click();
  await expect(advanced.getByRole('button', { name: 'אישור חלוקה חלופית' })).toBeDisabled();
  await advanced.getByRole('button', { name: 'הפחת מנדט: ביחד, בנט ולפיד', exact: true }).click();
  await advanced.getByRole('button', { name: 'אישור חלוקה חלופית' }).click();
  await expect(page.locator('.scenario-summary h3')).toHaveText('בחלוקה החלופית שבחרת');
  await expect(page.locator('body')).not.toHaveJSProperty('scrollWidth', 0);
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
  await page.screenshot({ path: `test-results/results-${test.info().project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'התחל מחדש', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'לאיזו מפלגה אתה מתכוון להצביע כרגע?' })).toBeVisible();
});

test('undecided, one selection, image fallback, and returning to baseline', async ({ page }) => {
  await page.route('**/silhouette.svg', route => route.abort());
  await page.goto('/');
  await page.getByRole('radio', { name: 'עדיין לא החלטתי', exact: true }).click();
  await page.getByRole('button', { name: 'המשך למפת הגוש' }).click();
  await page.getByRole('button', { name: 'המשך לבחירת אנשים' }).click();
  await page.getByRole('checkbox').check();
  await expect(page.locator('.portrait-fallback')).toHaveCount(6);
  await expect(page.locator('.candidate-card img')).toHaveCount(0);
  await page.locator('.candidate-card').first().click();
  await page.getByRole('button', { name: 'הצג את התוצאות שלי' }).click();
  await expect(page.locator('.comparison-panel')).toContainText('עדיין לא החלטת');
  await expect(page.locator('.original-intention strong')).toHaveText('עדיין לא החלטתי');
  await page.getByRole('button', { name: 'שינוי קו הבסיס', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'מפת הבסיס שלך' })).toBeVisible();
});

test('first page is responsive and keyboard usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('radio').first()).toBeVisible();
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('radio').first()).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('button', { name: 'המשך למפת הגוש' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/home-${test.info().project.name}.png`, fullPage: true });
});
