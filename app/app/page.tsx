import { apiFetch } from "@/lib/api/server"
import type { User, Verification } from "@/lib/api/types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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
  const verifiedSkills = verifications.filter((v) =>
    v.levelData.every((l) => l.status === "completed")
  )

  const pendingTasks = verifications.reduce((count, v) => {
    return count + v.levelData.filter((l) => l.status === "pending").length
  }, 0)

  const highestLevel = Math.max(
    ...verifications.map((v) => {
      const levels = { choice: 1, p2p_interview: 2, interview: 3 }
      return Math.max(
        ...v.levelData
          .filter((l) => l.status === "completed")
          .map((l) => levels[l.level as keyof typeof levels] || 0)
      )
    }),
    0
  )

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
          <h2 className="text-blue-600 text-sm font-medium">Total Collections</h2>
          <p className="text-4xl font-bold mt-2 text-blue-900">-</p>
          <p className="text-blue-600 text-sm mt-2">Coming soon</p>
        </div>
        <div className="border border-green-200 rounded-lg p-6 bg-green-50">
          <h2 className="text-green-600 text-sm font-medium">Verified Skills</h2>
          <p className="text-4xl font-bold mt-2 text-green-900">
            {verifiedSkills.length}
          </p>
          <p className="text-green-600 text-sm mt-2">
            {verifiedSkills
              .map((v) => (typeof v.skillId === "string" ? "Unknown" : v.skillId.title))
              .join(", ") || "None yet"}
          </p>
        </div>
        <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
          <h2 className="text-purple-600 text-sm font-medium">Highest Level</h2>
          <p className="text-4xl font-bold mt-2 text-purple-900">
            {highestLevel === 0 ? "-" : `Level ${highestLevel}`}
          </p>
          <p className="text-purple-600 text-sm mt-2">
            {highestLevel === 0 ? "Not started" : "Keep it up"}
          </p>
        </div>
        <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
          <h2 className="text-orange-600 text-sm font-medium">Pending Tasks</h2>
          <p className="text-4xl font-bold mt-2 text-orange-900">
            {pendingTasks}
          </p>
          <p className="text-orange-600 text-sm mt-2">Assessments to complete</p>
        </div>
      </div>

      {/* Recent Activity & Skill Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-xs mb-4">
            Your latest skill verification updates
          </p>
          <div className="space-y-4">
            {verifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No verifications yet</p>
            ) : (
              verifications.slice(0, 3).map((v) => {
                const skillTitle =
                  typeof v.skillId === "string" ? "Unknown" : v.skillId.title
                const latestLevel = v.levelData[v.levelData.length - 1]
                const statusLabel =
                  latestLevel?.status === "completed"
                    ? "Finished"
                    : latestLevel?.status === "pending"
                      ? "Available"
                      : "Failed"
                const statusColor =
                  latestLevel?.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : latestLevel?.status === "pending"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"

                return (
                  <div key={v._id} className="pb-4 border-b">
                    <p className="font-semibold">{skillTitle}</p>
                    <p className="text-gray-500 text-sm">
                      Level {v.levelData.length} - Current status
                    </p>
                    <Badge className={`mt-2 ${statusColor} border-0`}>
                      {statusLabel}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Skill Progress */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Skill Progress</h2>
          <p className="text-gray-500 text-xs mb-6">Your verification journey</p>
          <div className="space-y-6">
            {skillProgress.size === 0 ? (
              <p className="text-gray-500 text-sm">No skills tracked yet</p>
            ) : (
              Array.from(skillProgress.values())
                .slice(0, 3)
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
      </div>
    </div>
  )
}