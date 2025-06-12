'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


export default function AboutUs() {
    return (
        <main className="min-h-screen w-full bg-background dark:bg-[#111827] flex flex-col overflow-hidden">

            <div className="py-6 flex-1 px-4 md:px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">About Us</h1>
                    <p className="text-lg mb-6 text-muted-foreground">Learn more about CV Studio and our mission.</p>
                    <Card className="bg-card text-card-foreground border shadow-sm dark:bg-[#1a1f2e] dark:border-[#2a3042]">
                        <CardHeader>
                            <CardTitle>CV Studio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>CV Studio is an innovative platform designed to help job seekers create professional, tailored resumes quickly and easily. Our AI-powered tools analyze job descriptions and optimize your resume to increase your chances of landing your dream job.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
