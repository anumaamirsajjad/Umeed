import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cultural Context-Aware Mental Health First Aid',
  description: 'A supportive companion for mental wellbeing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-primary-50 to-accent-50 text-gray-900">
        <div className="min-h-screen flex flex-col">
          {/* Header/Navigation will go here */}
          <main className="flex-1">
            {children}
          </main>
          {/* Footer will go here */}
        </div>
      </body>
    </html>
  );
}
