import type { Metadata, Viewport } from 'next';
import { Lilita_One, Nunito } from 'next/font/google';
import './globals.css';

const lilitaOne = Lilita_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-lilita',
  display: 'swap',
});

const nunito = Nunito({
  weight: ['500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BS Helper & Coach - Brawl Stars Stats & Stratégies',
  description:
    'Application web & PWA pour analyser vos statistiques Brawl Stars, repérer les trophées faciles et monter en trophées avec Coach Bitz.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BS Helper',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1552',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${lilitaOne.variable} ${nunito.variable} dark`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 font-sans selection:bg-[#ffc700] selection:text-[#070b16]">
        {children}
      </body>
    </html>
  );
}
