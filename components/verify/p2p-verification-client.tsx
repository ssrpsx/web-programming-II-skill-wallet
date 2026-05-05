"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, UserCheck, Info, Check } from "lucide-react"
import { initiateP2P } from "@/lib/actions/verifications"
import type { Verification, User } from "@/lib/api/types"
import { Badge } from "@/components/ui/badge"

interface P2PVerificationClientProps {
  verification: Verification
  currentUser: User
  discordLink: string
}

export function P2PVerificationClient({
  verification,
  currentUser,
  discordLink,
}: P2PVerificationClientProps) {
  const [step, setStep] = useState(1) // 1: Join Discord, 2: Instructions & Randomize, 3: Success
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [peerName, setPeerName] = useState("")
  const [error, setError] = useState("")

  const skillTitle = typeof verification.skillId === "string" ? "Skill" : verification.skillId.title
  
  // Check if peer is already assigned
  const p2pLevel = verification.levelData.find(l => l.level === "p2p_interview")
  const isAlreadyInitiated = !!p2pLevel?.verifiedBy && p2pLevel.status === "pending"

  const handleNextStep = () => {
    setStep(2)
  }

  const handleInitiateP2P = async () => {
    setIsSubmitting(true)
    setError("")
    try {
      const result = await initiateP2P(verification._id)
      if (result.success && result.peerName) {
        setPeerName(result.peerName)
        setStep(3)
      } else {
        setError(result.error || "Failed to initiate P2P")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <Info className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Step 1: Join Discord</h2>
          <p className="text-blue-700 text-sm">
            To proceed with Peer-to-Peer verification, you must be a member of our Discord server.
          </p>
        </div>

        <div className="space-y-4">
          <a href={discordLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full h-12 text-lg bg-[#5865F2] hover:bg-[#4752C4]">
              <ExternalLink className="mr-2 h-5 w-5" />
              Join Discord Server
            </Button>
          </a>
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={handleNextStep}
          >
            I have already joined
          </Button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Step 2: P2P Instructions</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <p className="font-semibold text-gray-900">Set your Discord Name</p>
                <p className="text-sm text-gray-600">
                  Please change your nickname in the Discord server to:
                  <span className="block mt-1 font-mono bg-gray-100 p-2 rounded text-primary">
                    {currentUser.name}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
              <div>
                <p className="font-semibold text-gray-900">Randomize a Peer</p>
                <p className="text-sm text-gray-600">
                  The system will randomly select 1 verified user who has passed Level 1 in <span className="font-bold">{skillTitle}</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">3</div>
              <div>
                <p className="font-semibold text-gray-900">Coordinate & Verify</p>
                <p className="text-sm text-gray-600">
                  Tag the assigned peer in Discord to schedule your review. They can Approve/Deny your request on their dashboard.
                </p>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleInitiateP2P}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Randomizing..." : "Randomize Peer & Start"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-8">
      <div className="bg-green-50 p-8 rounded-2xl border border-green-100 animate-in zoom-in duration-300">
        <UserCheck className="mx-auto h-16 w-16 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-green-900 mb-2">Peer Assigned!</h2>
        <p className="text-green-700 mb-6">
          System has selected a peer for your <span className="font-bold">{skillTitle}</span> verification.
        </p>

        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm mb-6">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Your Peer</p>
          <p className="text-2xl font-bold text-gray-900">{peerName || "Loading..."}</p>
        </div>

        <div className="space-y-4 text-left bg-white/50 p-4 rounded-lg text-sm text-green-800">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Your request is now visible on <strong>{peerName}</strong>'s dashboard.</p>
          </div>
          <div className="flex items-start gap-2">
            <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Go to Discord and tag <strong>@{peerName}</strong> to coordinate the P2P session.</p>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => window.location.href = "/app"}>
        Back to Dashboard
      </Button>
    </div>
  )
}
