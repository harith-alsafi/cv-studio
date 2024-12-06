'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateType } from '../../types/templates'

const templates = [
    { name: 'Modern', type: TemplateType.MODERN },
    { name: 'Classic', type: TemplateType.CLASSIC },
]

export default function Templates() {
    const router = useRouter()


    const handleTemplateSelect = (type: TemplateType) => {
        router.push(`/editor?template=${type}`)
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Templates</h1>
            <p className="text-lg mb-6">Pick a resume template to get started</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                    <Card
                        key={template.type}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleTemplateSelect(template.type)}
                    >
                        <CardHeader>
                            <CardTitle>{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                Template Preview
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

