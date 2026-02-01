import { Header } from '@/app/_components/header'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
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
        <html lang='ko' className='dark'>
            <body className='antialiased'>
                <Header />
                <div className='bg-background mx-auto flex min-h-svh max-w-6xl flex-col px-16'>
                    {children}
                </div>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
