"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";

export function ToastWithAction() {
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
            <ToastAction altText="Upgrade to Premium">
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
