import { apiFetch } from "@/lib/api/server"
import type { Verification } from "@/lib/api/types"
import { ChoiceQuiz } from "@/components/verify/choice-quiz"

interface ChoicePageProps {
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

export default async function ChoicePage({ params }: ChoicePageProps) {
  const { id } = await params
  const verification = await getVerification(id)

  if (!verification) {
    return <div className="text-center py-12">Verification not found</div>
  }

  const choiceLevel = verification.levelData.find((l) => l.level === "choice")
  const questions = choiceLevel?.choice?.questions ?? []

  if (questions.length === 0) {
    return <div className="text-center py-12">No questions available</div>
  }

  return <ChoiceQuiz verification={verification} questions={questions} />
}
