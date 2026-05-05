import { apiFetch } from "@/lib/api/server"
import type { Verification } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface InterviewLinkPageProps {
  params: Promise<{
    id: string
  }>
}

async function getVerification(id: string): Promise<Verification | null> {
  try {
    return await apiFetch<Verification>(`/verifications/${id}`)
  } catch {
    return null
  }
}

export default async function InterviewLinkPage({
  params,
}: InterviewLinkPageProps) {
  const { id } = await params
  const verification = await getVerification(id)

  if (!verification) {
    return <div className="text-center py-12">Verification not found</div>
  }

  const interviewLevel = verification.levelData.find(
    (l) => l.level === "interview"
  )
  const interviewer = interviewLevel?.verifiedBy as any
  const meetLink = interviewLevel?.link || "https://meet.google.com"

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h1 className="text-3xl font-bold mb-4">Interview</h1>
      <p className="text-gray-600 mb-8">
        Join your scheduled video interview with our industry experts.
      </p>

      {interviewer ? (
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mb-8">
          <p className="text-sm text-purple-600 uppercase tracking-wider font-bold mb-1">Your Interviewer</p>
          <p className="text-xl font-bold text-gray-900">{interviewer.name}</p>
          <p className="text-sm text-purple-700 font-medium">{interviewer.rank}</p>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
          <p className="text-gray-500">No interviewer assigned yet.</p>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <ExternalLink size={48} className="text-gray-400" />
      </div>

      <a href={meetLink} target="_blank" rel="noopener noreferrer">
        <Button className="bg-black text-white w-full h-12 text-lg">Join Interview Room</Button>
      </a>
      
      <p className="mt-6 text-sm text-gray-500">
        If you have trouble joining, please contact your interviewer via Discord.
      </p>
    </div>
  )
}

