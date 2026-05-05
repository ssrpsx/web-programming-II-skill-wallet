import { apiFetch } from "@/lib/api/server"
import type { Verification, User, Skill } from "@/lib/api/types"
import { VerifyLevelSection } from "@/components/verify/verify-level-section"
import type { VerifyLevel } from "@/lib/verify-data"
import { CreateVerificationDialog } from "@/components/verify/create-verification-dialog"
import { getAllSubjects } from "@/lib/questions"

function getColorFromString(str: string): "green" | "blue" | "yellow" {
  const hash = str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const colors: ("green" | "blue" | "yellow")[] = ["green", "blue", "yellow"]
  return colors[hash % colors.length]
}

async function getVerifications(): Promise<Verification[]> {
  try {
    return await apiFetch<Verification[]>("/verifications")
  } catch {
    return []
  }
}

async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me")
  } catch {
    return null
  }
}

async function getSkills(): Promise<Skill[]> {
  try {
    return await apiFetch<Skill[]>("/skills")
  } catch {
    return []
  }
}

export default async function VerifyPage() {
  const [verifications, currentUser] = await Promise.all([
    getVerifications(),
    getCurrentUser(),
  ])
  const subjects = getAllSubjects()

  if (!currentUser) {
    return <div>Unable to load user data</div>
  }

  // Filter to current user
  const userVerifications = verifications.filter((v) => {
    if (!currentUser || !v.userId) return false
    const userId = typeof v.userId === "string" ? v.userId : v.userId._id
    return userId === currentUser._id
  })

  // Transform verifications to VerifyLevel structure
  const verifyLevels: VerifyLevel[] = [
    {
      level: 1,
      title: "Level 1: Test",
      description: "Complete skill assessments",
      items: [],
    },
    {
      level: 2,
      title: "Level 2: Peer to Peer",
      description: "Get reviewed by peers",
      items: [],
    },
    {
      level: 3,
      title: "Level 3: Interview",
      description: "Interview with professionals",
      items: [],
    },
  ]

  // Populate items from verifications
  userVerifications.forEach((verification) => {
    const skillTitle =
      typeof verification.skillId === "string"
        ? "Unknown Skill"
        : verification.skillId.title

    verification.levelData.forEach((levelData) => {
      let levelIndex = 0
      let levelType: "choice" | "p2p_interview" | "interview" = "choice"
      let routePath = ""

      if (levelData.level === "choice") {
        levelIndex = 0
        levelType = "choice"
        routePath = `/verify/${verification._id}/choice`
      } else if (levelData.level === "p2p_interview") {
        levelIndex = 1
        levelType = "p2p_interview"
        routePath = `/verify/${verification._id}/peartopear`
      } else if (levelData.level === "interview") {
        levelIndex = 2
        levelType = "interview"
        routePath = `/verify/${verification._id}/interview`
      }

      // Map backend status to frontend status
      let status: "available" | "finished" | "waiting" | "failed" | "pending" = "waiting"
      
      if (levelData.status === "pending") {
        if (levelData.verifiedBy) {
          status = "pending" // Pending Review (Assigned)
        } else {
          status = "available" // Ready to start
        }
      } else if (levelData.status === "completed") {
        status = "finished"
      } else if (levelData.status === "failed") {
        status = "failed"
      }

      verifyLevels[levelIndex].items.push({
        id: verification._id,
        skill: skillTitle,
        skillColor: getColorFromString(skillTitle),
        details: `Skill verification level\n${levelType.replace(/_/g, " ")}`,
        status,
        routePath,
      } as any)
    })
  })

  return (
    <div className="space-y-12 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Verify</h1>
        <p className="text-gray-500 mt-2">
          Verify your skills by completing assessments.
        </p>
        <div className="mt-4">
          <CreateVerificationDialog user={currentUser} subjects={subjects} />
        </div>
      </div>

      {/* Levels */}
      {verifyLevels.map((level) => (
        <VerifyLevelSection key={level.level} level={level} />
      ))}

      {userVerifications.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p>No verifications yet. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}