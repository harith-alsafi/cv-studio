"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface PricingProps {
  onClose?: () => void;
}

export default function Pricing({ onClose }: PricingProps) {
  return (
    <div className="bg-background text-foreground p-6 rounded-lg max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upgrade your plan</h1>
          <p className="text-muted-foreground">Choose the perfect plan for your CV creation needs</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">£0</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <CardDescription>Get started with CV Studio and explore basic features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>10 CV generations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>1 edit per generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Single CV profile</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Basic templates</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>PDF export</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Your current plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-2 relative" style={{ borderColor: "hsl(var(--cv-accent))" }}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="text-white font-semibold px-3 py-1" style={{ backgroundColor: "hsl(var(--cv-accent))" }}>
              POPULAR
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">£9.99</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <CardDescription>Unlock more features and boost your job search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>20 CV generations per day</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Tracker enabled</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Multiple CV profiles</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Premium templates</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>PDF export</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full text-white font-semibold hover:opacity-90"
              style={{
                backgroundColor: "hsl(var(--cv-button))",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(var(--cv-button-hover))"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(var(--cv-button))"
              }}
            >
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>

        {/* Ultimate Plan */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Ultimate</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">£14.99</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <CardDescription>All features unlocked for power users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Unlimited CV generations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Unlimited edits</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Unlimited CV profiles</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Cover letter creation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Export to DOCX & PDF</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Premium templates</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Tracker enabled</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full text-white font-semibold hover:opacity-90"
              style={{
                backgroundColor: "hsl(var(--cv-button))",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(var(--cv-button-hover))"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(var(--cv-button))"
              }}
            >
              Upgrade to Ultimate
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-2">Need help choosing a plan?</p>
        <Button variant="link" className="p-0 h-auto" style={{ color: "hsl(var(--cv-accent))" }}>
          Contact our support team
        </Button>
      </div>
    </div>
  )
}
