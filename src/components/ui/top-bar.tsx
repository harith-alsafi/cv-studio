"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Settings, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

function UserAvatar(){
  const { user } = useUser();

  if (!user) {
    return (
      <div className="h-full w-full rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500" />
    );
  }

  return (
    <img
      src={user.imageUrl}
      alt="User Avatar"
      className="h-full w-full rounded-full object-cover"
    />
  );
};

export function TopBar() {
  const { user } = useUser();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

  // After mounting, we have access to the theme
  useEffect(() => {
        if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.emailAddresses[0]?.emailAddress || "");    
    }
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
              <UserAvatar />
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
                    <p className="font-medium text-foreground">{`${firstName} ${lastName}`}</p>
                    <p className="text-muted-foreground">{email}</p>
                  </div>

                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-[#2a3042]"
                    role="menuitem"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    User Settings
                  </button>



                  <div className="px-4 py-2 text-sm border-t border-border dark:border-[#2a3042]">
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Generations Left</p>
                      <p className="font-medium text-foreground">10/10</p>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-[#2a3042] rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full w-full"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Usage resets in 1 day</p>
                  </div>

                  <div className="px-4 py-2 border-t border-border dark:border-[#2a3042]">
                    <button
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
                      role="menuitem"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
