import { Inter, Bitcount_Prop_Single } from 'next/font/google';
import './globals.css';
import WalletProvider from './components/WalletProvider';

const bitcountGrid = Bitcount_Prop_Single({
  variable: '--font-bitcount',
  display: 'swap',
  fallback: ['monospace'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata = {
  title: 'NEPHARA - Autonomous AI agent for x402 payments',
  description:
    'Autonomous AI agent that makes payments on your behalf using the x402 protocol. Access paid APIs and services without manual intervention.',
  keywords: [
    'x402',
    'ai agent',
    'autonomous payments',
    'http 402',
    'blockchain payments',
    'crypto',
    'web3',
  ],
  icons: {
    icon: '/logo_black.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/bitcount-grid-single"
        />
      </head>
      <body className={`${bitcountGrid.variable} ${inter.variable} antialiased`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}

