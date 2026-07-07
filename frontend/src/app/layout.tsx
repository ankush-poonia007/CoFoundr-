import React from 'react';
import AuthProvider from '../providers/AuthProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import './globals.css';

export const metadata = {
  title: 'CoFoundr',
  description: 'The AI co-founder you always needed.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-indigo-500/30 transition-colors duration-350">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
