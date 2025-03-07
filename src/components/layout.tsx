'use client'

import React from 'react'
import Link from 'next/link'
import { Home, Edit, FileText, Info, Settings, ChevronRight, ChevronLeft, FileIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

const sidebarItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Edit, label: 'Editor', href: '/editor' },
  { icon: FileText, label: 'Templates', href: '/templates' },
  { icon: Info, label: 'About Us', href: '/about' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="flex items-center justify-between p-4">
            <FileIcon className="h-6 w-6" />
            <SidebarTrigger>
              {/* {({ collapsed }) => (
                <Button variant="ghost" size="icon">
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              )} */}
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link href={item.href} className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

