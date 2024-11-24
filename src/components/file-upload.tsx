import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="resume-upload">Upload your resume (PDF)</Label>
      <Input
        id="resume-upload"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />
    </div>
  )
}

