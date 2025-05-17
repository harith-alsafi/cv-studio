'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

export function TopBar() {
    const { resolvedTheme } = useTheme()
    
    return (
        <header className="w-full border-b bg-card text-card-foreground dark:bg-[#1a1f2e] dark:border-[#2a3042]">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-6">
                    <Link href="/" className="mt-1 block">
                        <Image
                            src={resolvedTheme === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png"}
                            alt="CV Studio Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                </div>

                {/* Centered navigation links */}
                <nav className="flex-1 flex justify-center">
                    <ul className="flex gap-20 items-center">
                        <li>
                            <Link href="/" className="text-card-foreground hover:text-primary transition-colors font-medium">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="text-card-foreground hover:text-primary transition-colors font-medium">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link href="/pricing" className="text-card-foreground hover:text-primary transition-colors font-medium">
                                Pricing
                            </Link>
                        </li>
                    </ul>
                </nav>

                <ThemeToggle />
            </div>
        </header>
    )
}
