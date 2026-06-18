import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'PawPass — Every Paw Deserves an Identity',
  description: 'Digital identities, QR smart tags, medical timelines, and recovery systems for pets. Apple x Notion designed security.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-black text-white antialiased">
      <body className="min-h-full bg-black flex flex-col font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
