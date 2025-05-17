"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Download, Upload } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { PDFPreview } from "@/components/pdf-preview"
import Image from "next/image"
import { useTheme } from "next-themes"

export default function ResumeBuilder() {
  const [jobTitle, setJobTitle] = useState("Service Designer")
  const [language, setLanguage] = useState("English")
  const [fileName, setFileName] = useState("No file chosen")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const pdfUrl = "https://s29.q4cdn.com/175625835/files/doc_downloads/test.pdf"

  // Form state for additional info
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [website, setWebsite] = useState("")

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleAdditionalInfo = () => {
    setShowAdditionalInfo(!showAdditionalInfo)
  }

  return (
    <>
      <header className="w-full border-b bg-card text-card-foreground dark:bg-[#1a1f2e] dark:border-[#2a3042]">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {mounted && (
              <Image
                src={resolvedTheme === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png"}
                alt="CV Studio Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container py-6 flex-1 grid md:grid-cols-2 gap-6">
        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm dark:bg-[#1a1f2e] dark:border-[#2a3042]">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Resume Details</h2>
              <div className="flex justify-between items-center">
                <span>CV Language:</span>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px] dark:bg-[#2a3042] dark:border-[#3a4055]">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-muted dark:bg-[#3a4055] flex items-center justify-center text-xs">
                        us
                      </div>
                      <SelectValue placeholder="Select language" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#2a3042] dark:border-[#3a4055]">
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Upload Resume</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 dark:bg-[#2a3042] dark:border-[#3a4055] dark:hover:bg-[#3a4055]"
                >
                  <Upload className="h-4 w-4" />
                  Choose file
                </Button>
                <span className="text-sm text-muted-foreground">{fileName}</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Job Title</h2>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Job Description</h2>
              <Textarea
                placeholder="Paste the job description here"
                className="min-h-[120px] w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
              />
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={toggleAdditionalInfo}
                className="flex items-center gap-2 text-[hsl(var(--cv-accent))] p-0 h-auto"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${showAdditionalInfo ? "rotate-180" : ""}`}
                />
                Edit additional info
              </Button>

              {showAdditionalInfo && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-5 duration-300">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">First Name</h2>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Last Name</h2>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Email Address</h2>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Phone</h2>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      type="tel"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Address</h2>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Website</h2>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Enter your website or portfolio"
                      type="url"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full bg-[hsl(var(--cv-button))] hover:bg-[hsl(var(--cv-button-hover))] text-white"
              size="lg"
            >
              Generate Resume
            </Button>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm flex flex-col dark:bg-[#1a1f2e] dark:border-[#2a3042]">
          <div className="flex-1 overflow-hidden">
            <PDFPreview url={pdfUrl} className="min-h-[500px]" />
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="flex items-center gap-2 bg-[hsl(var(--cv-button))] hover:bg-[hsl(var(--cv-button-hover))] text-white">
              <Download className="h-4 w-4" />
              Download CV
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
