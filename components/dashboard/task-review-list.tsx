"use client"

import { useState } from "react"
import type { Verification, User } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ExternalLink } from "lucide-react"
import { updateLevelStatus } from "@/lib/actions/verifications"
import { useRouter } from "next/navigation"

interface TaskReviewListProps {
  verifications: Verification[]
  currentUser: User
}

export function TaskReviewList({ verifications, currentUser }: TaskReviewListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const pendingTasks = verifications.filter((v) => {
    const vUserId = typeof v.userId === "string" ? v.userId : v.userId._id
    return vUserId !== currentUser._id
  }).flatMap(v => 
    v.levelData
      .filter(l => {
        const isPending = l.status === "pending" && (l.level === "p2p_interview" || l.level === "interview")
        if (!isPending || !l.verifiedBy) return false
        const verifiedById = typeof l.verifiedBy === "string" ? l.verifiedBy : (l.verifiedBy as any)._id
        return verifiedById === currentUser._id
      })
      .map(l => ({ verification: v, level: l }))
  )

  const handleUpdateStatus = async (verificationId: string, level: string, status: "completed" | "failed") => {
    setLoadingId(`${verificationId}-${level}`)
    try {
      await updateLevelStatus(verificationId, level, status, currentUser._id)
      router.refresh()
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Failed to update status")
    } finally {
      setLoadingId(null)
    }
  }

  if (pendingTasks.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50 text-gray-500">
        No pending tasks to review.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingTasks.map(({ verification, level }) => {
        const user = verification.userId as User
        const skill = verification.skillId as any
        const id = `${verification._id}-${level.level}`
        
        return (
          <div key={id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{user.name}</span>
                <Badge variant="outline" className="capitalize">
                  {level.level.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-medium">{skill.title}</p>
              {level.link && (
                <a 
                  href={level.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <ExternalLink size={12} />
                  Discord Room
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={loadingId === id}
                onClick={() => handleUpdateStatus(verification._id, level.level, "failed")}
              >
                <X size={16} className="mr-1" />
                Deny
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loadingId === id}
                onClick={() => handleUpdateStatus(verification._id, level.level, "completed")}
              >
                <Check size={16} className="mr-1" />
                Approve
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
