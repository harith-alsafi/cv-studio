"use client"

import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { usePricingOverlay } from "@/context/pricing-overlay-context"

export function ToastWithAction() {
  const { toast } = useToast()
  const { openOverlay } = usePricingOverlay()

  return (
    <Button
      variant="outline"
      onClick={() => {
        toast({
          title: "Upgrade to Premium",
          description: "You've reached a limit. Please upgrade for full access.",
          action: (
            <ToastAction
              altText="Upgrade to Premium"
              onClick={openOverlay}
              className="py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade to Premium
            </ToastAction>
          ),
        })
      }}
    >
      Show Toast
    </Button>
  )
}
