import { getAllSubjects } from "@/lib/questions"
import { TestQuiz } from "@/components/verify/test-quiz"
import { notFound } from "next/navigation"
import { apiFetch } from "@/lib/api/server"
import type { User, Verification } from "@/lib/api/types"

interface TestPageProps {
  params: Promise<{
    subjectId: string
  }>
}

export default async function TestPage({ params }: TestPageProps) {
  const { subjectId } = await params
  const decodedSubjectId = decodeURIComponent(subjectId)
  const subjects = getAllSubjects()
  
  const subject = subjects.find(s => s.SubjectName === decodedSubjectId)
  
  if (!subject) {
    return notFound()
  }

  // Get current user and ensure verification exists
  let user: User | null = null
  let verification: Verification | null = null
  
  try {
    user = await apiFetch<User>("/auth/me")
    if (!user) {
      throw new Error("User not authenticated")
    }
    
    // Check for existing verification for this subject
    const verifications = await apiFetch<Verification[]>("/verifications")
    verification = verifications.find(v => {
      const vUserId = typeof v.userId === "string" ? v.userId : v.userId._id;
      const vSkillTitle = typeof v.skillId === "string" ? "" : (v.skillId as any).title;
      return (
        vUserId === user?._id && 
        vSkillTitle === subject.SubjectName
      )
    }) || null

    // If no verification exists, create a new one
    if (!verification) {
      verification = await apiFetch<Verification>("/verifications", {
        method: "POST",
        body: JSON.stringify({
          userId: user._id,
          skillTitle: subject.SubjectName
        })
      })
    }
  } catch (error) {
    console.error("Failed to ensure verification:", error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-8">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        <a href="/app/verify" className="text-blue-600 hover:underline">Return to Verification</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TestQuiz subject={subject} verificationId={verification?._id} />
    </div>
  )
}
