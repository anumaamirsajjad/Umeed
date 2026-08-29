import type { Metadata } from 'next';
import { Inter, Fraunces, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { AuthProvider } from '@/lib/authContext';
import { MoonToggle } from '@/components/common/MoonToggle';
import { SidebarNav } from '@/components/common/SidebarNav';
import { AppShell } from '@/components/common/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-fraunces', display: 'swap' });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-nastaliq', display: 'swap' });

export const metadata: Metadata = {
  title: 'Umeed',
  description: 'A supportive companion for mental wellbeing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${nastaliq.variable}`}>
      <head>
        {/* Runs before paint to set the theme class and avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body style={{ backgroundColor: 'var(--umeed-beige-50)', color: 'var(--umeed-ink-900)' }}>
        <AuthProvider>
          <SidebarNav />
          <AppShell>
            <MoonToggle />
            <main className="flex-1">
              {children}
            </main>
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
