import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';

import { AppProviders } from '@/components/providers/app-providers';
import { ThemeProvider } from '@/components/providers/theme-provider';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: 'ClientFlow',
  description:
    'AI-powered client acquisition platform for freelancers and small agencies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={geist.className}
      >
        <ThemeProvider>
          <AppProviders>
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}