import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PrivyProvider } from '@privy-io/react-auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CreatorChain - Transparent Revenue Sharing',
  description: 'Transparent revenue sharing for collaborative creators on Base',
  keywords: ['creator', 'revenue sharing', 'blockchain', 'base', 'farcaster'],
  authors: [{ name: 'CreatorChain Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  openGraph: {
    title: 'CreatorChain - Transparent Revenue Sharing',
    description: 'Transparent revenue sharing for collaborative creators on Base',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatorChain - Transparent Revenue Sharing',
    description: 'Transparent revenue sharing for collaborative creators on Base',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not configured');
  }

  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        <PrivyProvider
          appId={privyAppId || 'dummy-app-id'}
          config={{
            loginMethods: ['wallet', 'farcaster'],
            appearance: {
              theme: 'light',
              accentColor: '#2563eb',
              logo: undefined,
            },
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },
            farcaster: {
              enabled: true,
            },
          }}
        >
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </PrivyProvider>
      </body>
    </html>
  );
}
