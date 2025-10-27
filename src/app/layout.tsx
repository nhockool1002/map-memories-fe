import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#16a34a" />
        <meta charSet="utf-8" />
        <title>Map Memories - Lưu giữ kỷ niệm trên bản đồ</title>
        <meta name="description" content="Ứng dụng quản lý kỷ niệm và địa điểm trên bản đồ. Đánh dấu những nơi bạn đã đến và lưu giữ những kỷ niệm đẹp." />
        <meta name="author" content="Map Memories Team" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="keywords" content="map, memories, địa điểm, kỷ niệm, bản đồ, travel, du lịch" />
        <meta name="next-size-adjust" />
      </head>
      <body className="antialiased bg-gray-900 text-gray-100" suppressHydrationWarning>
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}