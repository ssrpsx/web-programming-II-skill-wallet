import { apiFetch } from "@/lib/api/server"
import type { Verification } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface P2PLinkPageProps {
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

export default async function P2PLinkPage({ params }: P2PLinkPageProps) {
  const { id } = await params
  const verification = await getVerification(id)

  if (!verification) {
    return <div className="text-center py-12">Verification not found</div>
  }

  const p2pLevel = verification.levelData.find(
    (l) => l.level === "p2p_interview"
  )
  const discordLink = p2pLevel?.link || process.env.DISCORD_JOIN_LINK || "https://discord.gg/skillcollection"

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h1 className="text-3xl font-bold mb-4">P2P Test</h1>
      <p className="text-gray-600 mb-12">
        Join our Discord community to submit your projects for peer review.
      </p>

      <div className="flex justify-center mb-8">
        <ExternalLink size={48} className="text-gray-400" />
      </div>

      <a href={discordLink} target="_blank" rel="noopener noreferrer">
        <Button className="bg-black text-white w-full">Join Discord</Button>
      </a>
    </div>
  )
}
