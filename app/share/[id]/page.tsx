import { publicFetch } from "@/lib/api/server"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { notFound } from "next/navigation"

interface PublicVerification {
  _id: string
  skill: { _id: string; title: string; description?: string; category: string }
  user: { name: string }
  levels: { level: string; status: string; verifiedAt?: string }[]
  createdAt: string
}

async function getPublicVerification(id: string): Promise<PublicVerification | null> {
  try {
    return await publicFetch<PublicVerification>(`/verifications/${id}/public`)
  } catch {
    return null
  }
}

const levelTitles: Record<string, string> = {
  choice: "Level 1: Test",
  p2p_interview: "Level 2: Peer to Peer",
  interview: "Level 3: Interview",
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
  completed: {
    icon: <CheckCircle2 className="text-green-500" size={18} />,
    label: "Completed",
    badge: "bg-green-100 text-green-800 border-0",
  },
  pending: {
    icon: <Clock className="text-yellow-500" size={18} />,
    label: "In Progress",
    badge: "bg-yellow-100 text-yellow-800 border-0",
  },
  failed: {
    icon: <XCircle className="text-red-500" size={18} />,
    label: "Failed",
    badge: "bg-red-100 text-red-800 border-0",
  },
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const verification = await getPublicVerification(id)

  if (!verification) notFound()

  const completedCount = verification.levels.filter((l) => l.status === "completed").length
  const isFullyVerified =
    completedCount === verification.levels.length && verification.levels.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase">
          Skill Wallet
        </p>

        <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />

          <div className="p-8 space-y-6">
            {/* User */}
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Verified by</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{verification.user.name}</p>
            </div>

            {/* Skill */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Skill</p>
              <h2 className="text-3xl font-bold text-slate-900">{verification.skill.title}</h2>
              {verification.skill.description && (
                <p className="text-slate-500 text-sm mt-2">{verification.skill.description}</p>
              )}
            </div>

            {/* Verification Levels */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Verification Levels
              </p>
              {verification.levels.map((level) => {
                const config = statusConfig[level.status] ?? {
                  icon: <AlertCircle className="text-slate-400" size={18} />,
                  label: level.status,
                  badge: "bg-slate-100 text-slate-700 border-0",
                }
                return (
                  <div
                    key={level.level}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      {config.icon}
                      <span className="text-sm font-medium text-slate-700">
                        {levelTitles[level.level] ?? level.level}
                      </span>
                    </div>
                    <Badge className={config.badge}>{config.label}</Badge>
                  </div>
                )
              })}
            </div>

            {/* Fully verified banner */}
            {isFullyVerified && (
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
                <p className="text-green-800 font-bold">Fully Verified</p>
                <p className="text-green-600 text-sm mt-1">All verification levels completed</p>
              </div>
            )}
          </div>

          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-slate-300">
              Shared via Skill Wallet &middot;{" "}
              {new Date(verification.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
