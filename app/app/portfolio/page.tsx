import { apiFetch } from "@/lib/api/server"
import type { User, Verification } from "@/lib/api/types"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, User as UserIcon } from "lucide-react"
import { ShareButton } from "@/components/portfolio/share-button"
import { SharePortfolioButton } from "@/components/portfolio/share-portfolio-button"

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

const levelLabels: Record<string, string> = {
  choice: "Level 1: Test",
  p2p_interview: "Level 2: Peer to Peer",
  interview: "Level 3: Interview",
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-0",
    icon: <CheckCircle2 size={14} className="text-green-500" />,
  },
  pending: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800 border-0",
    icon: <Clock size={14} className="text-yellow-500" />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 border-0",
    icon: <XCircle size={14} className="text-red-500" />,
  },
}

export default async function PortfolioPage() {
  const [currentUser, allVerifications] = await Promise.all([
    getCurrentUser(),
    getVerifications(),
  ])

  if (!currentUser) {
    return <div className="text-center py-12">Unable to load user data</div>
  }

  const verifications = allVerifications.filter((v) => {
    const userId = typeof v.userId === "string" ? v.userId : v.userId._id
    return userId === currentUser._id
  })

  const completedCount = verifications.reduce(
    (acc, v) => acc + v.levelData.filter((l) => l.status === "completed").length,
    0
  )

  const fullyVerified = verifications.filter(
    (v) => v.levelData.length === 3 && v.levelData.every((l) => l.status === "completed")
  ).length

  return (
    <div className="space-y-8 p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-gray-500 mt-2">Your verified skills and achievements.</p>
        </div>
        <SharePortfolioButton userId={currentUser._id} />
      </div>

      {/* Profile card */}
      <div className="border rounded-2xl p-6 flex items-center gap-5 bg-muted/30">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <UserIcon size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold truncate">{currentUser.name}</p>
          <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
        </div>
        <div className="flex gap-4 text-center flex-shrink-0">
          <div>
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{fullyVerified}</p>
            <p className="text-xs text-muted-foreground">Fully Done</p>
          </div>
        </div>
      </div>

      {/* Skills list */}
      <div>
        <h2 className="text-lg font-bold mb-4">Skill Verifications</h2>
        {verifications.length === 0 ? (
          <div className="border rounded-xl p-8 text-center text-muted-foreground">
            No verifications yet. Go to Verify to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((v) => {
              const skillTitle =
                typeof v.skillId === "string" ? "Unknown Skill" : v.skillId.title
              const isFullyDone =
                v.levelData.length === 3 && v.levelData.every((l) => l.status === "completed")

              return (
                <div
                  key={v._id}
                  className="border rounded-2xl p-5 space-y-3 hover:border-primary/30 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{skillTitle}</h3>
                      {isFullyDone && (
                        <Badge className="bg-green-100 text-green-800 border-0">Fully Verified</Badge>
                      )}
                    </div>
                    <ShareButton verificationId={v._id} />
                  </div>

                  <div className="space-y-2">
                    {v.levelData.map((level) => {
                      const config = statusConfig[level.status] ?? {
                        label: level.status,
                        color: "bg-slate-100 text-slate-700 border-0",
                        icon: null,
                      }
                      return (
                        <div
                          key={level.level}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex items-center gap-2 text-muted-foreground">
                            {config.icon}
                            {levelLabels[level.level] ?? level.level}
                          </span>
                          <Badge className={config.color}>{config.label}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
