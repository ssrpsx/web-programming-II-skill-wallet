"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, UserCheck, Info, Check, ShieldCheck } from "lucide-react"
import { initiateInterview } from "@/lib/actions/verifications"
import type { Verification, User } from "@/lib/api/types"
import { Badge } from "@/components/ui/badge"

interface InterviewVerificationClientProps {
  verification: Verification
  currentUser: User
  discordLink: string
}

export function InterviewVerificationClient({
  verification,
  currentUser,
  discordLink,
}: InterviewVerificationClientProps) {
  const [step, setStep] = useState(1) // 1: Join Discord, 2: Instructions & Randomize, 3: Success
  const [isSubmitting, setIsSubmitting] = useState(false)
  const skillTitle = !verification.skillId || typeof verification.skillId === "string" ? "Skill" : verification.skillId.title
  
  // Check if interviewer is already assigned
  const interviewLevel = verification.levelData.find(l => l.level === "interview")
  const isAlreadyInitiated = !!interviewLevel?.verifiedBy && interviewLevel.status === "pending"
  
  // Initialize state from existing data if available
  const [interviewerInfo, setInterviewerInfo] = useState(() => {
    if (isAlreadyInitiated && typeof interviewLevel.verifiedBy !== "string") {
      const v = interviewLevel.verifiedBy as any;
      return { name: v.name || "", rank: v.rank || "" };
    }
    return { name: "", rank: "" };
  })
  const [error, setError] = useState(() => {
    if (interviewLevel?.status === "failed" && interviewLevel.verifiedAt) {
      const lastFailedAt = new Date(interviewLevel.verifiedAt).getTime();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      if (now - lastFailedAt < threeDays) {
        const remainingMs = threeDays - (now - lastFailedAt);
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return `Cooldown active. Please wait ${remainingHours} more hours before retrying Interview.`;
      }
    }
    return ""
  })

  const handleNextStep = () => {
    setStep(2)
  }

  const handleInitiateInterview = async () => {
    setIsSubmitting(true)
    setError("")
    try {
      const result = await initiateInterview(verification._id)
      if (result.success && result.interviewerName) {
        setInterviewerInfo({ 
          name: result.interviewerName, 
          rank: result.interviewerRank || "Ranked Interviewer" 
        })
        setStep(3)
      } else {
        setError(result.error || "Failed to initiate Interview")
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
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
          <ShieldCheck className="mx-auto h-12 w-12 text-purple-500 mb-4" />
          <h2 className="text-2xl font-bold text-purple-900 mb-2">Final Step: Interview</h2>
          <p className="text-purple-700 text-sm">
            To proceed with your final Interview, you must coordinate with a ranked interviewer in our Discord.
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
            I am ready for the Interview
          </Button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Final Interview Instructions</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <p className="font-semibold text-gray-900">Set your Discord Name</p>
                <p className="text-sm text-gray-600">
                  Ensure your nickname in the Discord server matches:
                  <span className="block mt-1 font-mono bg-gray-100 p-2 rounded text-primary">
                    {currentUser.name}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
              <div>
                <p className="font-semibold text-gray-900">Assign an Interviewer</p>
                <p className="text-sm text-gray-600">
                  The system will randomly select 1 ranked interviewer who is qualified to review <span className="font-bold">{skillTitle}</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">3</div>
              <div>
                <p className="font-semibold text-gray-900">1-on-1 Interview</p>
                <p className="text-sm text-gray-600">
                  Join the assigned voice channel in Discord and coordinate with your interviewer.
                </p>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleInitiateInterview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Assigning..." : "Assign Interviewer & Start"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-8">
      <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100 animate-in zoom-in duration-300">
        <UserCheck className="mx-auto h-16 w-16 text-purple-500 mb-6" />
        <h2 className="text-3xl font-bold text-purple-900 mb-2">Interviewer Assigned!</h2>
        <p className="text-purple-700 mb-6">
          A ranked professional has been selected for your <span className="font-bold">{skillTitle}</span> final interview.
        </p>

        <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm mb-6">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Your Interviewer</p>
          <p className="text-2xl font-bold text-gray-900">{interviewerInfo.name || "Loading..."}</p>
          <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
            {interviewerInfo.rank}
          </Badge>
        </div>

        <div className="space-y-4 text-left bg-white/50 p-4 rounded-lg text-sm text-purple-800">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Your interviewer <strong>{interviewerInfo.name}</strong> will see your request on their portal.</p>
          </div>
          <div className="flex items-start gap-2">
            <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Go to Discord and tag <strong>@{interviewerInfo.name}</strong> to schedule your 1-on-1 session.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <a href={interviewLevel?.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full h-12 text-lg bg-black hover:bg-gray-800">
            Join Interview Room
          </Button>
        </a>
        <Button variant="outline" className="w-full" onClick={() => window.location.href = "/app"}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
