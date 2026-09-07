import type {
  Metadata,
} from 'next';

import {
  Geist,
} from 'next/font/google';

import './globals.css';

import {
  AppProviders,
} from '@/components/providers/app-providers';

const geist =
  Geist({
    subsets: ['latin'],

    variable:
      '--font-geist',
  });

export const metadata:
  Metadata = {
  title: {
    default:
      'ClientFlow',

    template:
      '%s | ClientFlow',
  },

  description:
    'Turn opportunities into revenue with ClientFlow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={
          geist.className
        }
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}