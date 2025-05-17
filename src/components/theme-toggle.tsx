"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border bg-background dark:bg-[#1a1f2e] dark:border-[#2a3042]">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="h-10 w-10 rounded-full relative border-border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-[#1a1f2e] dark:border-[#2a3042] dark:hover:bg-[#2a3042]"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          resolvedTheme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
          resolvedTheme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
