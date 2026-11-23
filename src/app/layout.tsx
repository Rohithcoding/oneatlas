import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { CompareProvider } from '@/hooks/use-compare';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CompareTray } from '@/components/layout/compare-tray';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'OneAtlas — Every AI model, compared', template: '%s · OneAtlas' },
  description:
    'Discover, filter, compare and evaluate AI models across labs and providers. Pricing, context windows, capabilities and benchmarks in one place.',
  openGraph: {
    title: 'OneAtlas — Every AI model, compared',
    description: 'Specs, pricing, capabilities and providers for every AI model.',
    type: 'website',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <Providers>
          <CompareProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CompareTray />
          </CompareProvider>
        </Providers>
      </body>
    </html>
  );
}
