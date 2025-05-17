import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={handleButtonClick}
        className="flex items-center gap-2 dark:bg-[#2a3042] dark:border-[#3a4055] dark:hover:bg-[#3a4055]"
      >
        <Upload className="h-4 w-4" />
        Choose file
      </Button>
    </>
  )
}

