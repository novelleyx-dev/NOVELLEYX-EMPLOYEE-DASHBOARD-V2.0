import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NovelleyX | Employee Dashboard',
  description: 'NovelleyX Enterprise Employee Portal — Secure, Fast, and Modern.',
  keywords: 'NovelleyX, Employee Dashboard, Enterprise Portal, HR Management',
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
      </head>
      <body className="bg-black min-h-screen antialiased">
        {/* Global animated mesh background */}
        <div className="bg-mesh" />
        {/* Cyber grid overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-cyber-grid-overlay opacity-100" />
        {/* Page content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
