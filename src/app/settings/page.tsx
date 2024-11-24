import React from 'react'
// import Layout from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Settings() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Settings options will be added here in the future.</p>
                </CardContent>
            </Card>
        </div>
    )
}

