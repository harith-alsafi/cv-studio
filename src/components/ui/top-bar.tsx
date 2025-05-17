"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Settings, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full border-b bg-card text-card-foreground dark:bg-[#1a1f2e] dark:border-[#2a3042]">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="mt-1 block">
            {mounted ? (
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/images/logo-dark.png"
                    : "/images/logo-light.png"
                }
                alt="CV Studio Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            ) : (
              <div className="h-10 w-[120px]"></div> /* Placeholder with same dimensions */
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full ml-2 p-0 border-border bg-background hover:bg-accent dark:bg-[#1a1f2e] dark:border-[#2a3042] dark:hover:bg-[#2a3042]"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500" />
            </Button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border dark:bg-[#1a1f2e] dark:border-[#2a3042] z-50 animate-in slide-in-from-top-5 duration-300">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <div className="px-4 py-2 text-sm border-b border-border dark:border-[#2a3042]">
                    <p className="font-medium text-foreground">John Doe</p>
                    <p className="text-muted-foreground">john@example.com</p>
                  </div>

                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-[#2a3042]"
                    role="menuitem"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    User Settings
                  </button>

                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-[#2a3042]"
                    role="menuitem"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Credits: </span>
                    <span className="ml-1 font-medium text-[hsl(var(--cv-accent))]">
                      100
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
