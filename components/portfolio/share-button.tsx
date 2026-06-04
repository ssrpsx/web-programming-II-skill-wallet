"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShareButton({ verificationId }: { verificationId: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const url = `${window.location.origin}/share/${verificationId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2 text-xs"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={14} />
          Share
        </>
      )}
    </Button>
  )
}
