import { apiFetch } from "@/lib/api/server"
import type { User, Verification } from "@/lib/api/types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TaskReviewList } from "@/components/dashboard/task-review-list"

async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me")
  } catch {
    return null
  }
}

async function getVerifications(): Promise<Verification[]> {
  try {
    return await apiFetch<Verification[]>("/verifications")
  } catch {
    return []
  }
}

export default async function AppPage() {
  const [currentUser, allVerifications] = await Promise.all([
    getCurrentUser(),
    getVerifications(),
  ])

  if (!currentUser) {
    return <div className="text-center py-12">Unable to load user data</div>
  }

  // Filter to current user
  const verifications = allVerifications.filter((v) => {
    if (!currentUser || !v.userId) return false
    const userId = typeof v.userId === "string" ? v.userId : v.userId._id
    return userId === currentUser._id
  })

  // Calculate stats
  const verifiedSkillsCount = verifications.reduce((count, v) => 
    count + v.levelData.filter((l) => l.status === "completed").length, 0)

  const fullyVerifiedSkillsCount = verifications.filter((v) =>
    v.levelData.length === 3 && v.levelData.every((l) => l.status === "completed")
  ).length

  const pendingTasks = allVerifications.filter((v) => {
    const vUserId = typeof v.userId === "string" ? v.userId : v.userId._id
    return vUserId !== currentUser._id
  }).reduce((count, v) => {
    return count + v.levelData.filter((l) => l.status === "pending" && (l.level === "p2p_interview" || l.level === "interview")).length
  }, 0)

  // Build skill progress map
  const skillProgress = new Map<
    string,
    {
      name: string
      maxLevel: number
      completedLevel: number
    }
  >()

  verifications.forEach((v) => {
    const skillTitle =
      typeof v.skillId === "string" ? "Unknown" : v.skillId.title
    const existing = skillProgress.get(skillTitle)

    const levels = { choice: 1, p2p_interview: 2, interview: 3 }
    const maxLevelData = v.levelData[v.levelData.length - 1]
    const maxLevel = maxLevelData
      ? levels[maxLevelData.level as keyof typeof levels] || 0
      : 0

    const completedLevel = Math.max(
      ...v.levelData
        .filter((l) => l.status === "completed")
        .map((l) => levels[l.level as keyof typeof levels] || 0)
    )

    if (!existing) {
      skillProgress.set(skillTitle, {
        name: skillTitle,
        maxLevel,
        completedLevel: completedLevel || 0,
      })
    } else if (maxLevel > existing.maxLevel) {
      existing.maxLevel = maxLevel
      existing.completedLevel = Math.max(
        existing.completedLevel,
        completedLevel || 0
      )
    }
  })

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, {currentUser.name}. Track your skills and verified
          profile.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <div className="border border-green-200 rounded-lg p-6 bg-green-50">
          <h2 className="text-green-600 text-sm font-medium">Verified Skills</h2>
          <p className="text-4xl font-bold mt-2 text-green-900">
            {verifiedSkillsCount}
          </p>
          <p className="text-green-600 text-sm mt-2">
            Total completed assessments
          </p>
        </div>
        <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
          <h2 className="text-purple-600 text-sm font-medium">Highest Level</h2>
          <p className="text-4xl font-bold mt-2 text-purple-900">
            {fullyVerifiedSkillsCount}
          </p>
          <p className="text-purple-600 text-sm mt-2">
            Skills fully verified (all 3 levels)
          </p>
        </div>
        <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
          <h2 className="text-orange-600 text-sm font-medium">Pending Tasks</h2>
          <p className="text-4xl font-bold mt-2 text-orange-900">
            {pendingTasks}
          </p>
          <p className="text-orange-600 text-sm mt-2">Tasks to review for others</p>
        </div>
      </div>

      {/* Skill Progress & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Skill Progress</h2>
          <p className="text-gray-500 text-xs mb-6">Your verification journey</p>
          <div className="space-y-6">
            {skillProgress.size === 0 ? (
              <p className="text-gray-500 text-sm">No skills tracked yet</p>
            ) : (
              Array.from(skillProgress.values())
                .slice(0, 5)
                .map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-2">
                      <p className="font-semibold">{skill.name}</p>
                      <p className="text-gray-500 text-sm">
                        Level {skill.completedLevel}/{skill.maxLevel}
                      </p>
                    </div>
                    <Progress
                      value={
                        skill.maxLevel > 0
                          ? (skill.completedLevel / skill.maxLevel) * 100
                          : 0
                      }
                    />
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Pending Tasks</h2>
          <p className="text-gray-500 text-xs mb-6">Review requests from others</p>
          <TaskReviewList verifications={allVerifications} currentUser={currentUser} />
        </div>
      </div>
    </div>
  )
}