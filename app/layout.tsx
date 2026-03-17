import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/header'
import LanguageProvider from '@/components/language-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Mosque Finder - কাছাকাছি মসজিদ ও জামাতের সময় খুঁজুন',
  description: 'Mosque Finder এ কাছাকাছি মসজিদ, জামাতের সময়, সুবিধাসমূহ ও কমিউনিটি যাচাইকরণ তথ্য সহজে দেখুন।',
  keywords: ['mosque', 'masjid', 'prayer times', 'jamat times', 'salah', 'muslim', 'islamic'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#166534',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </LanguageProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
