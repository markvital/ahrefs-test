import type { Metadata } from 'next';
import Link from 'next/link';
import { Typography } from '@mui/material';
import { Roboto } from 'next/font/google';

import { Providers } from '../components/Providers';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Food Additives Catalogue',
  description:
    'Browse essential information about food additives, including synonyms, functions, and links to additional resources.',
};

const currentYear = new Date().getFullYear();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Providers>
          <div className="layout">
            <header className="site-header">
              <div className="content-shell header-shell">
                <Link href="/">
                  <Typography
                    component="span"
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Additives
                  </Typography>
                </Link>
              </div>
            </header>
            <main className="main-content">
              <div className="content-shell">{children}</div>
            </main>
            <footer className="site-footer">
              <div className="content-shell">
                <Typography component="p" variant="body2">
                  Food Additives © {currentYear}. All rights reserved.
                </Typography>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
