import { Providers } from './providers'
// import { Inter } from 'next/font/google'
import React from "react";
import Layout from '@/components/layout'
import localFont from "next/font/local";
import "./globals.css";

// const inter = Inter({ subsets: ['latin'] })
const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata = {
    title: 'CV Studio',
    description: 'Create professional resumes with ease',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased p-8`}
        >
        {/*<Layout><Providers>{children}</Providers></Layout>*/}
        <Providers>{children}</Providers>
        </body>
        </html>
    )
}

