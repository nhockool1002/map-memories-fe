import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Map Memories - Lưu giữ kỷ niệm trên bản đồ',
  description: 'Ứng dụng quản lý kỷ niệm và địa điểm trên bản đồ. Đánh dấu những nơi bạn đã đến và lưu giữ những kỷ niệm đẹp.',
  keywords: 'map, memories, địa điểm, kỷ niệm, bản đồ, travel, du lịch',
  authors: [{ name: 'Map Memories Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#16a34a',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Map Memories" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
          {children}
        </main>
        
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid #16a34a',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid #dc2626',
              },
            },
            loading: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}