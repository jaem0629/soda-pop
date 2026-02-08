import { Header } from '@/app/_components/header'
import { Separator } from '@/components/ui/separator'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Footer } from './_components/footer'
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
    <html lang='ko' className={`${GeistSans.className} dark`}>
      <body className='flex min-h-svh flex-col antialiased'>
        <Header />
        <div className='bg-background mx-auto flex w-full max-w-6xl flex-1 flex-col px-16 py-8'>
          {children}
        </div>
        <Separator />
        <Footer privacyPolicyUrl='#' termsOfServiceUrl='#' contactUrl='#' />
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
