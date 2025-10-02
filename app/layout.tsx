import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import Navigation from '@/components/Navigation';
import FloatingElements from '@/components/FloatingElements';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrandPari - Esports Betting Platform',
  description: 'The ultimate esports betting experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={inter.className}>
          <FloatingElements />
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
