import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sauna App',
  description: 'Plánování sauny pro skupiny',
  manifest: '/manifest.json',
  themeColor: '#0891b2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sauna App',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
