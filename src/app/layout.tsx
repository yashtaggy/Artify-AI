import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/ui/ThemeProvider'; // 1. IMPORT ThemeProvider

// 2. IMPORT and DEFINE the 'Syne' (sans) and 'Unica One' (display) fonts
import { Syne, Unica_One } from 'next/font/google';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-sans', // Maps to the 'sans' font family in tailwind.config.ts
});

const unicaOne = Unica_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display', // Maps to the 'display' font family in tailwind.config.ts
});


export const metadata: Metadata = {
  title: 'ArtifyAI',
  description: 'The AI business partner for artisans.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. Set font variables on <html> and allow dynamic class updates (e.g., 'dark')
    <html 
      lang="en" 
      className={`${syne.variable} ${unicaOne.variable}`} 
      suppressHydrationWarning // Prevents hydration mismatch when ThemeProvider modifies the class
    >
      {/* 4. Removed static font links from <head> */}
      <body className="font-sans antialiased">
        
        {/* 5. Wrap main content with ThemeProvider */}
        <ThemeProvider defaultTheme="system" storageKey="artifyai-theme">
          {children}
        </ThemeProvider>

        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}
