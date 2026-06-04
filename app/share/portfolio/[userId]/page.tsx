import { publicFetch } from "@/lib/api/server"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle, User as UserIcon } from "lucide-react"
import { notFound } from "next/navigation"

interface PublicPortfolio {
  user: { name: string } | null
  verifications: {
    _id: string
    skill: { _id: string; title: string; description?: string }
    levels: { level: string; status: string; verifiedAt?: string }[]
    createdAt: string
  }[]
}

const levelLabels: Record<string, string> = {
  choice: "Level 1: Test",
  p2p_interview: "Level 2: Peer to Peer",
  interview: "Level 3: Interview",
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
  completed: {
    icon: <CheckCircle2 className="text-green-500" size={14} />,
    label: "Completed",
    badge: "bg-green-100 text-green-800 border-0",
  },
  pending: {
    icon: <Clock className="text-yellow-500" size={14} />,
    label: "In Progress",
    badge: "bg-yellow-100 text-yellow-800 border-0",
  },
  failed: {
    icon: <XCircle className="text-red-500" size={14} />,
    label: "Failed",
    badge: "bg-red-100 text-red-800 border-0",
  },
}

async function getPortfolio(userId: string): Promise<PublicPortfolio | null> {
  try {
    return await publicFetch<PublicPortfolio>(`/verifications/user/${userId}/public`)
  } catch {
    return null
  }
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const data = await getPortfolio(userId)

  if (!data || !data.user) notFound()

  const { user, verifications } = data

  const completedCount = verifications.reduce(
    (acc, v) => acc + v.levels.filter((l) => l.status === "completed").length,
    0
  )
  const fullyVerified = verifications.filter(
    (v) => v.levels.length === 3 && v.levels.every((l) => l.status === "completed")
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase">
          Skill Wallet
        </p>

        {/* Profile header */}
        <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-8 flex items-center gap-5">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <UserIcon size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Portfolio</p>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{user.name}</h1>
            </div>
            <div className="flex gap-6 text-center flex-shrink-0">
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                <p className="text-xs text-slate-400">Verified</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{fullyVerified}</p>
                <p className="text-xs text-slate-400">Fully Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {verifications.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-slate-400">
            No verified skills yet.
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((v) => {
              const isFullyDone =
                v.levels.length === 3 && v.levels.every((l) => l.status === "completed")

              return (
                <div key={v._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-slate-900">
                        {(v.skill as any).title ?? "Unknown Skill"}
                      </h2>
                      {isFullyDone && (
                        <Badge className="bg-green-100 text-green-800 border-0">
                          Fully Verified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {v.levels.map((level) => {
                        const config = statusConfig[level.status] ?? {
                          icon: <AlertCircle className="text-slate-400" size={14} />,
                          label: level.status,
                          badge: "bg-slate-100 text-slate-700 border-0",
                        }
                        return (
                          <div
                            key={level.level}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="flex items-center gap-2 text-slate-500">
                              {config.icon}
                              {levelLabels[level.level] ?? level.level}
                            </span>
                            <Badge className={config.badge}>{config.label}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-slate-300">Shared via Skill Wallet</p>
      </div>
    </div>
  )
}
