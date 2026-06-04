"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SharePortfolioButton({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const url = `${window.location.origin}/share/portfolio/${userId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button onClick={handleShare} variant="outline" className="gap-2">
      {copied ? (
        <>
          <Check size={16} className="text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={16} />
          Share Portfolio
        </>
      )}
    </Button>
  )
}
