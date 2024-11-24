import Layout from '@/components/layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
    return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.20))]">
                <h1 className="text-4xl font-bold mb-6">Welcome to CV Studio</h1>
                <p className="text-xl mb-8">Create professional resumes with ease</p>
                <Link href="/templates">
                    <Button size="lg">Get Started</Button>
                </Link>
            </div>
    )
}

