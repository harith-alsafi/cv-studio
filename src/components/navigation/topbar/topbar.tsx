"use client";
import { SidebarMobile } from "@/components/navigation/sidebar/sidebar-mobile";
import { ThemeToggle } from "@/components/navigation/topbar/theme-toggle";
import { Button } from "@/components/ui/button";
import { bottomItems, topItems } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function TopBar() {
  const pathName = usePathname();
  let link = topItems.find((item) => item.link === pathName);
  if (!link) {
    link = bottomItems.find((item) => item.link === pathName);
  }
  return (
    <header className="sticky top-0 z-10 flex h-[53px] items-center  justify-between w-full gap-1 border-b bg-background px-4">
      <div className="flex max-sm:items-center max-sm:space-x-2">
        <SidebarMobile />
        {link && (
          <h1 className="text-xl font-semibold">
            {link.label}
          </h1>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button asChild variant="outline">
          <Link href="/evaluation">
            <p className="hidden lg:block">Evaluation</p>
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
