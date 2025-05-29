"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";

interface ToastWithActionProps {
  onOpenPricingDialog: () => void;
}

export function ToastWithAction({ onOpenPricingDialog }: ToastWithActionProps) {
  const { toast } = useToast();

  return (
    <Button
      variant="outline"
      onClick={() => {
        toast({
          title: "You hit the free plan limit",
          description: "Upgrade to continue using premium features.",
          duration: Infinity, // Persistent toast
          action: (
            <ToastAction altText="Upgrade to Premium" onClick={onOpenPricingDialog} className="py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:opacity-90 transition-opacity">
              Upgrade to Premium
            </ToastAction>
          ),
        });
      }}
    >
      Show Toast
    </Button>
  );
}
