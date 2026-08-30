import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { AuthProvider } from '@/lib/authContext';
import { AppShell } from '@/components/common/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-fraunces', display: 'swap' });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-nastaliq', display: 'swap' });

export const metadata: Metadata = {
  title: 'Umeed',
  description: 'A supportive companion for mental wellbeing',
};

// `viewportFit: 'cover'` is what makes env(safe-area-inset-*) resolve to real
// values on notched iOS devices — without it the bottom tab bar sits under the
// home indicator. `maximumScale` is left at the default: capping zoom is an
// accessibility regression.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${nastaliq.variable}`}>
      <head>
        {/* Runs before paint to set the theme class and avoid a flash of the
            wrong theme. Touches only documentElement.classList, so it stays
            correct regardless of what the body renders below. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body style={{ backgroundColor: 'var(--umeed-beige-50)', color: 'var(--umeed-ink-900)' }}>
        <AuthProvider>
          <AppShell>
            <main className="flex-1">{children}</main>
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
