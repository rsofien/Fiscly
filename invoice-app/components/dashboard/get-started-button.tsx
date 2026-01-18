"use client"

import { Button } from "@/components/ui/button"

export function GetStartedButton() {
  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => window.open('https://docs.fiscly.com/getting-started', '_blank')}
    >
      Get Started Guide
    </Button>
  )
}
