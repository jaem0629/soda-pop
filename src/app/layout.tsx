import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Soda Pop - Real-time 2P Puzzle Battle',
    description: 'Real-time 2-player puzzle battle game',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='ko' className='dark'>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
