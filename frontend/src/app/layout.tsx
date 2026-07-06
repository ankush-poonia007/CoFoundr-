import React from 'react';
import AuthProvider from '../providers/AuthProvider';
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
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
