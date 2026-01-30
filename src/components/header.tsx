'use client'

import { cn } from '@/lib/utils'
import { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface NavItem {
    href: Route
    label: string
}
interface HeaderProps {
    navItems: NavItem[]
}

export function Header({ navItems }: HeaderProps) {
    const pathname = usePathname()

    return (
        <header className='relative z-50 flex items-center justify-between px-16 py-4 backdrop-blur-md'>
            <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-full'>
                    <svg
                        className='size-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}>
                        <circle cx='12' cy='12' r='3' />
                        <circle cx='6' cy='6' r='2' />
                        <circle cx='18' cy='8' r='2' />
                        <circle cx='8' cy='18' r='2' />
                        <circle cx='17' cy='17' r='2' />
                    </svg>
                </div>
                <h1 className='text-xl'>Soda Pop</h1>
            </div>

            <nav className='hidden items-center gap-9 md:flex'>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'text-sm font-medium transition-colors',
                            pathname === item.href
                                ? 'text-primary font-bold'
                                : 'text-muted-foreground'
                        )}>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </header>
    )
}
