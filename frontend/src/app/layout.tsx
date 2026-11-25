import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'AutoRent SaaS | Enterprise Multi-Tenant Vehicle Rental Platform',
  description: 'Next-generation cloud vehicle rental management, digital bluebook, and smart QR telemetry platform for Nepal & beyond.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-[#f8fafc] transition-colors">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
