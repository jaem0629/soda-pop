import { Header } from '@/app/_components/header'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soda Pop - Real-time 2P Puzzle Battle',
  description: 'Real-time 2-player puzzle battle game',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='ko' className={GeistSans.className}>
      <body className='flex min-h-svh flex-col overflow-x-hidden antialiased'>
        <Header />
        <div className='mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
          {children}
        </div>
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
