'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { useTemplateContext } from '@/context/template-context'
import { TemplateEntry } from '@/types/latex-template'

interface TemplatePopupProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: TemplateEntry) => void
}

export function TemplatePopup({ isOpen, onClose, onSelectTemplate }: TemplatePopupProps) {
  const [mounted, setMounted] = useState(false)
  const { templates } = useTemplateContext();
  
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background dark:bg-[#1a1f2e] rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b dark:border-[#2a3042] flex justify-between items-center">
          <h2 className="text-xl font-bold">Select Template</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card
                key={template.key}
                className="cursor-pointer hover:shadow-lg transition-shadow bg-card text-card-foreground border shadow-sm dark:bg-[#1a1f2e] dark:border-[#2a3042] overflow-hidden"
                onClick={() => {
                  onSelectTemplate(template)
                  onClose()
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60 bg-muted dark:bg-[#2a3042] rounded-md flex items-center justify-center overflow-hidden">
                    {mounted ? (
                      <Image 
                        src={template.image} 
                        alt={`${template.name} Template Preview`} 
                        width={380} 
                        height={320} 
                        className="object-contain" 
                      />
                    ) : (
                      <div className="w-[380px] h-[320px]"></div> /* Placeholder with same dimensions */
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
