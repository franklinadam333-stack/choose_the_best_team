import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Browser text shaping preserves Hebrew RTL correctly. No external assets or requests.
const font = await readFile(new URL('../public/fonts/hebrew-700.woff', import.meta.url));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
    @font-face {font-family:Hebrew;src:url(data:font/woff;base64,${font.toString('base64')}) format('woff');font-weight:700}
    *{box-sizing:border-box}body{margin:0;background:#183d4b;color:white;font-family:Hebrew,Arial,sans-serif}
    main{width:1200px;height:630px;padding:60px 80px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;position:relative}
    .line{position:absolute;top:40px;right:40px;bottom:40px;left:40px;border:1px solid #ffffff22;border-radius:20px}
    svg{width:68px;height:68px;color:#e6d9b5;margin-bottom:20px}h1{font-size:84px;line-height:1.2;margin:0;letter-spacing:-2px}
    h2{font-size:32px;color:#e6d9b5;margin:24px 0 0}p{font-family:Arial,sans-serif;font-size:21px;color:#b9cbd2;margin:42px 0 0}
    </style></head><body><main><div class="line"></div><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><path d="M16 46V25h32v21M12 47h40M16 20l16-8 16 8M24 27v16m8-16v16m8-16v16"/></svg><h1>פנים לכנסת</h1><h2>בוחרים אנשים, בוחנים רשימות</h2><p>סימולטור מנדטים · גרסת פיתוח · נתונים לא מאומתים</p></main></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL('../src/app/opengraph-image.png', import.meta.url).pathname });
  console.log('Generated RTL share image: 1200 × 630 PNG');
} finally { await browser.close(); }
