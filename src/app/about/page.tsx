import React from 'react'
import Layout from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutUs() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">About Us</h1>
            <Card>
                <CardHeader>
                    <CardTitle>CV Studio</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>CV Studio is an innovative platform designed to help job seekers create professional, tailored resumes quickly and easily. Our AI-powered tools analyze job descriptions and optimize your resume to increase your chances of landing your dream job.</p>
                </CardContent>
            </Card>
        </div>
    )
}

