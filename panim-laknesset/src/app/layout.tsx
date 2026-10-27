import type { Metadata } from 'next';
import '@fontsource/noto-sans-hebrew/hebrew-400.css';
import '@fontsource/noto-sans-hebrew/hebrew-500.css';
import '@fontsource/noto-sans-hebrew/hebrew-600.css';
import '@fontsource/noto-sans-hebrew/hebrew-700.css';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` :
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'פנים לכנסת | את מי היית רוצה לראות בכנסת?',
  description: 'פנים לכנסת: בוחרים אנשים, בוחנים רשימות. סימולטור המציג כיצד חלוקת מנדטים משפיעה על האנשים שעשויים להיכנס לכנסת. כולל 72 שמות ומיקומים שנבדקו מול פרסומים המבוססים על רשימות ועדת הבחירות. תמונות המועמדים טרם הושלמו.',
  robots: { index: false, follow: false },
  openGraph: { title: 'פנים לכנסת', description: 'בוחרים אנשים, בוחנים רשימות. סימולטור חלוקת מנדטים — גרסת פיתוח.', locale: 'he_IL', type: 'website' },
  twitter: { card: 'summary_large_image' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="he" dir="rtl"><body>{children}</body></html>;
}
