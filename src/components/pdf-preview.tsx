"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PDFPreviewProps {
  url: string
  className?: string
}

export function PDFPreview({ url, className = "" }: PDFPreviewProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reset loading state when URL changes
    setLoading(true)
  }, [url])

  return (
    <div className={`relative flex flex-col w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <iframe
        src={url}
        className="w-full h-full rounded-lg border border-border"
        onLoad={() => setLoading(false)}
        title="PDF Preview"
      />
    </div>
  )
}
