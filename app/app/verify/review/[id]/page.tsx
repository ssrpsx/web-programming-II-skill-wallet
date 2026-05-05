import { apiFetch } from "@/lib/api/server"
import type { Verification, User } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ExternalLink, User as UserIcon } from "lucide-react"
import { updateLevelStatus } from "@/lib/actions/verifications"
import { redirect } from "next/navigation"

interface ReviewPageProps {
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

async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me")
  } catch {
    return null
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const [verification, currentUser] = await Promise.all([
    getVerification(id),
    getCurrentUser(),
  ])

  if (!verification || !currentUser) {
    return <div className="text-center py-12">Unable to load data</div>
  }

  // Find the level that needs review by current user
  const levelToReview = verification.levelData.find(
    (l) => l.status === "pending" && l.verifiedBy === currentUser._id
  )

  if (!levelToReview) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
          <h2 className="text-xl font-bold text-yellow-900">No Pending Review</h2>
          <p className="text-yellow-700">You don't have any pending review tasks for this verification.</p>
        </div>
        <Button asChild variant="outline" className="w-full">
           <a href="/app">Go to Dashboard</a>
        </Button>
      </div>
    )
  }

  const userToReview = verification.userId as User
  const skill = verification.skillId as any

  async function handleApprove() {
    "use server"
    await updateLevelStatus(id, levelToReview!.level, "completed", currentUser!._id)
    redirect("/app")
  }

  async function handleDeny() {
    "use server"
    await updateLevelStatus(id, levelToReview!.level, "failed", currentUser!._id)
    redirect("/app")
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
        <div className="bg-primary p-8 text-primary-foreground">
          <Badge className="mb-4 bg-white/20 text-white border-none uppercase tracking-widest text-[10px]">
             Verification Request
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Review Skill</h1>
          <p className="opacity-80">Please evaluate the following skill verification request.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserIcon size={24} />
            </div>
            <div>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Candidate</p>
               <p className="text-lg font-bold text-gray-900">{userToReview.name}</p>
            </div>
          </div>

          {/* Skill Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Skill to Verify</h3>
               <Badge variant="outline" className="capitalize">
                 {levelToReview.level.replace("_", " ")}
               </Badge>
            </div>
            <div className="p-6 rounded-2xl border-2 border-primary/5 bg-primary/[0.02]">
               <h4 className="text-2xl font-bold text-gray-900">{skill.title}</h4>
               <p className="text-gray-600 mt-2">{skill.description}</p>
            </div>
          </div>

          {/* Discord Info */}
          {levelToReview.link && (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-3">
               <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                 <ExternalLink size={14} />
                 Discord Verification
               </h3>
               <p className="text-sm text-blue-800">
                 Please meet the candidate in the Discord room to conduct the {levelToReview.level.replace("_", " ")} review.
               </p>
               <a 
                 href={levelToReview.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-block text-sm font-bold text-blue-600 hover:underline"
               >
                 Go to Discord Room &rarr;
               </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <form action={handleDeny}>
               <Button type="submit" variant="outline" className="w-full h-14 text-red-600 border-red-200 hover:bg-red-50 text-lg font-bold">
                 <X size={20} className="mr-2" />
                 Deny
               </Button>
            </form>
            <form action={handleApprove}>
               <Button type="submit" className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold">
                 <Check size={20} className="mr-2" />
                 Approve
               </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
