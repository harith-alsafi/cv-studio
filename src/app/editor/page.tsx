'use client'

import React, {useEffect, useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import FileUpload from '@/components/file-upload'
import PDFViewer from '@/components/pdf-viewer'
import {TemplateType} from '../types/templates'

export default function CVEditor() {
    const [jobDescription, setJobDescription] = useState('')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [generatedPDF, setGeneratedPDF] = useState<string | null>(null)
    const [templateType, setTemplateType] = useState<TemplateType | null>(TemplateType.CLASSIC)

    const searchParams = useSearchParams()

    useEffect(() => {
        const template = searchParams.get('template') as TemplateType
        if (template) {
            setTemplateType(template)
        }
    }, [searchParams])

    const handleFileUpload = (file: File) => {
        setResumeFile(file)
    }

    const handleGenerate = () => {
        // TODO: Implement CV generation logic
        console.log('Generating CV with job description:', jobDescription)
        console.log('Using template:', templateType)
        // For now, we'll just set a dummy PDF URL
        setGeneratedPDF('/dummy.pdf')
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-theme(spacing.20))]">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">CV Studio</h1>
                    <p className="mb-4">Template: {templateType || 'None selected'}</p>
                    <FileUpload onFileUpload={handleFileUpload} />
                    <Textarea
                        className="mt-4 flex-grow"
                        placeholder="Paste the job description here"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                    <Button className="mt-4" onClick={handleGenerate}>
                        Generate
                    </Button>
                </div>
                <div className="h-full">
                    <PDFViewer pdfUrl={generatedPDF} />
                </div>
            </div>
        </div>
    )
}

