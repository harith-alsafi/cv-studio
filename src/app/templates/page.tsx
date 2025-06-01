'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { TemplateType } from '../../types/templates'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { TopBar } from '@/components/ui/top-bar'

// const templates = [
//     { name: 'Modern', type: TemplateType.MODERN, image: '/images/modern.png' },
//     { name: 'Classic', type: TemplateType.CLASSIC, image: '/images/classic.png' },
// ]

// function TemplatesContent() {
//     const [mounted, setMounted] = useState(false)
//     const { resolvedTheme } = useTheme()
//     const router = useRouter()

//     useEffect(() => {
//         // Avoid hydration mismatch and ensure component is mounted
//         setMounted(true)
//     }, [])

//     const handleTemplateSelect = (type:string) => {
//         if (mounted) {
//             router.push(`/editor?template=${type}`)
//         }
//     }

//     // Don't render content until client-side hydration is complete
//     if (!mounted) {
//         return null
//     }

//     return (
//         <main className="min-h-screen w-full bg-background dark:bg-[#111827] flex flex-col overflow-hidden">
//             <TopBar />

//             <div className="py-6 flex-1 px-4 md:px-6">
//                 <div className="max-w-4xl mx-auto">
//                     <h1 className="text-3xl font-bold mb-2">Resume Templates</h1>
//                     <p className="text-lg mb-6 text-muted-foreground">Select a template to create your optimized resume</p>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {templates.map((template) => (
//                             <Card
//                                 key={template.type}
//                                 className="cursor-pointer hover:shadow-lg transition-shadow bg-card text-card-foreground border shadow-sm dark:bg-[#1a1f2e] dark:border-[#2a3042] overflow-hidden"
//                                 onClick={() => handleTemplateSelect(template.type)}
//                             >
//                                 <CardHeader className="pb-2">
//                                     <CardTitle>{template.name}</CardTitle>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="h-60 bg-muted dark:bg-[#2a3042] rounded-md flex items-center justify-center overflow-hidden">
//                                         <Image 
//                                             src={template.image} 
//                                             alt={`${template.name} Template Preview`} 
//                                             width={380} 
//                                             height={320} 
//                                             className="object-contain" 
//                                         />
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </main>
//     )
// }

export default function Templates() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {/* <TemplatesContent /> */}
        </Suspense>
    )
}