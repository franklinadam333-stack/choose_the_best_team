import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
export const alt = 'פנים לכנסת — בוחרים אנשים, בוחנים רשימות';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function Image() {
  const font = await readFile(join(process.cwd(), 'public/fonts/hebrew-700.woff'));
  const latin = await readFile(join(process.cwd(), 'public/fonts/latin-700.woff'));
  return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', background: '#183d4b', color: '#fff', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: 'Hebrew, Latin' }}><div style={{ display: 'flex', fontSize: 90 }}>פנים לכנסת</div><div style={{ display: 'flex', fontSize: 38, marginTop: 28, color: '#e6d9b5' }}>בוחרים אנשים, בוחנים רשימות</div><div style={{ display: 'flex', fontSize: 24, marginTop: 50 }}>סימולטור מנדטים • גרסת פיתוח • נתונים לא מאומתים</div></div>, { ...size, fonts: [{ name: 'Hebrew', data: font, weight: 700, style: 'normal' }, { name: 'Latin', data: latin, weight: 700, style: 'normal' }] });
}
