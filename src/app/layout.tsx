// import { Inter } from 'next/font/google'
import React from "react";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/context/user-context";
import { TemplateProvider } from "@/context/template-context";
import { UserCleanupHandler } from "@/hooks/use-logout-handler";
import { TopBar } from '@/components/ui/top-bar';
import { Suspense } from 'react';

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
  title: "CV Studio",
  description: "Create professional resumes with ease",
};

function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class">
          <TemplateProvider>
            <UserProvider>
              <UserCleanupHandler />
              <TopBar />
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </UserProvider>
          </TemplateProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NODE_ENV === "development") {
    return (
      <Layout>
        {children}
      </Layout>
    );
  }

  return (
    <ClerkProvider>
      <Layout>
        {children}
      </Layout>
    </ClerkProvider>
  );
}
