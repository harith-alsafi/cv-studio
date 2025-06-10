'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import Link from 'next/link'

const pricingPlans = [
    {
        name: 'Free',
        price: '$0',
        features: [
            '1 Resume Project',
            'Basic Templates',
            'PDF Download',
            'AI Suggestions (Limited)',
        ],
        cta: 'Get Started',
        highlight: false,
        link: '/editor',
    },
    {
        name: 'Pro',
        price: '$9/mo',
        features: [
            'Unlimited Projects',
            'Premium Templates',
            'Advanced PDF Export',
            'Unlimited AI Suggestions',
            'Priority Support',
        ],
        cta: 'Upgrade Now',
        highlight: true,
        link: '/upgrade',
    },
]

export default function Pricing() {
    return (
        <main className="min-h-screen w-full bg-background dark:bg-[#111827] flex flex-col overflow-hidden">

            <div className="py-6 flex-1 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Pricing</h1>
                    <p className="text-lg mb-6 text-muted-foreground">Choose the plan that fits your needs. Upgrade anytime.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pricingPlans.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`transition-shadow bg-card text-card-foreground border shadow-sm dark:bg-[#1a1f2e] dark:border-[#2a3042] overflow-hidden ${plan.highlight ? 'ring-2 ring-primary scale-[1.03]' : ''}`}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2">
                                        {plan.name}
                                        {plan.highlight && (
                                            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-primary text-primary-foreground">Most Popular</span>
                                        )}
                                    </CardTitle>
                                    <div className="text-4xl font-bold mt-2">{plan.price}</div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="mb-6 space-y-2 text-muted-foreground">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={plan.link} className={`w-full block text-center px-4 py-2 rounded font-semibold transition-colors ${plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-foreground hover:bg-muted-foreground/80 border'} shadow-sm`}>
                                        {plan.cta}
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
