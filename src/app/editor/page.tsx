'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import FileUpload from '@/components/file-upload'
import PDFViewer from '@/components/pdf-viewer'
import { TemplateType } from '../../types/templates'
import { Resume, resumeSample } from '@/types/resume'
import { extractTextFromFile } from '@/lib/file-read-new'
import { generateResumePDF } from '@/lib/pdf-gen-basic'
import { Download, Loader2 } from 'lucide-react'
import { readYaml } from '@/lib/file-read'
import { parseYamlTemplate } from '@/lib/latex-template'

interface OpenAIResponse {
  role: string
  content: string
  refusal: null | string
}

function CVEditorContent() {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [generatedPDF, setGeneratedPDF] = useState<string | null>(null)
  const [templateType, setTemplateType] = useState<TemplateType | null>(
    TemplateType.CLASSIC
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<Resume | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const template = searchParams.get('template') as TemplateType
    if (template) {
      setTemplateType(template)
    }
  }, [searchParams])

  const handleFileUpload = (file: File) => {
    setResumeFile(file)
    setError(null)
    setGeneratedPDF(null)
  }

  const handleDownload = () => {
    if (!generatedPDF) return

    try {
      // Convert the data URL to a Blob
      const byteString = atob(generatedPDF.split(',')[1])
      const mimeString = generatedPDF.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      
      const blob = new Blob([ab], { type: mimeString })
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'generated-resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      setError('Failed to download PDF')
    }
  }

  const handleGenerate = async () => {
    if (!resumeFile) {
      setError('Please upload a resume file first')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedPDF(null)

    try {
      // Extract text from the uploaded file
      const text = await extractTextFromFile(resumeFile)

      // Send to parser API
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          jobDescription: jobDescription.trim(),
        }),
      })

      if (!response.ok) {
        console.error('Failed to parse resume:', response)
        throw new Error('Failed to parse resume')
      }

      const data: OpenAIResponse = await response.json()

      if (data.content) {
        const parsedContent = JSON.parse(data.content) as Resume
        setParsedData(parsedContent)

        const responseLlm = await fetch('/api/resume-gen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume: parsedContent,
            jobDescription,
          }),
        });

        if(!responseLlm.ok) {
        console.error('Failed to generate resume:', responseLlm)
          throw new Error('Failed to generate resume')
        }

        const dataLlm: OpenAIResponse = await responseLlm.json();
        const resumeDataLlm = JSON.parse(dataLlm.content) as Resume;

        const template = await readYaml('template-1/template1.yaml');
        const selectedTemplate = parseYamlTemplate(template);

        // Send data to the API for PDF generation
        const response = await fetch('/api/pdf-gen', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resume: resumeDataLlm, template: selectedTemplate }), // Ensure `selectedTemplate` is available
        });

        console.log(response);

        if (response.ok) {
          const blob = await response.blob();
          const pdfDataUrl = URL.createObjectURL(blob);
          setGeneratedPDF(pdfDataUrl);
        } else {
          console.error('Failed to generate PDF:', await response.text());
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-theme(spacing.20))]">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold mb-4">CV Studio</h1>
          <p className="mb-4">Template: {templateType || 'None selected'}</p>
          <FileUpload onFileUpload={handleFileUpload} />
          {error && (
            <div className="mt-4 text-red-600">Error: {error}</div>
          )}
          <Textarea
            className="mt-4 flex-grow"
            placeholder="Paste the job description here (optional)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="mt-4 flex gap-4">
            <Button
              onClick={handleGenerate}
              disabled={!resumeFile || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate'
              )}
            </Button>
            {generatedPDF && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
        <div className="h-full relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">
                  Generating your CV...
                </p>
              </div>
            </div>
          ) : generatedPDF ? (
            <PDFViewer pdfUrl={generatedPDF} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No PDF generated yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CVEditor() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CVEditorContent />
    </Suspense>
  );
}