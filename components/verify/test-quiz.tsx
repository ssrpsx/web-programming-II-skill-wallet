"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle } from "lucide-react"
import type { Subject, Question } from "@/lib/questions"
import { submitTestResult } from "@/lib/actions/verifications"

interface TestQuizProps {
  subject: Subject
  verificationId?: string
}

export function TestQuiz({ subject, verificationId }: TestQuizProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState<number>(subject.Time * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (isSubmitted) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isSubmitted])

  const handleSelectOption = (questionId: number, option: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    let correct = 0
    const answerArray: string[] = subject.question.map((q) => answers[q.id] || "")
    
    subject.question.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++
      }
    })
    const finalScore = (correct / subject.question.length) * 100
    setScore(finalScore)

    if (verificationId) {
      try {
        await submitTestResult(verificationId, answerArray)
      } catch (error) {
        console.error("Failed to submit test result to server:", error)
        alert(error instanceof Error ? error.message : "Failed to submit results")
      }
    }

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  if (isSubmitted) {
    const passed = score >= 80 // 80% is passing
    return (
      <div className="max-w-3xl mx-auto text-center py-12 px-6">
        <h1 className="text-3xl font-bold mb-2">Test Results</h1>
        <h2 className="text-xl text-gray-500 mb-8">{subject.SubjectName}</h2>
        <p className="text-gray-600 mb-4">Score: {Math.round(score)}%</p>
        {passed ? (
          <>
            <p className="text-gray-600 mb-8">
              Congratulations! You have successfully passed the test.
            </p>
            <div className="flex justify-center mb-8">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-8">
              Your score is below the passing threshold. Please try again later.
            </p>
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-500">
                  {Math.round(score)}%
                </span>
              </div>
            </div>
          </>
        )}
        <Button
          onClick={() => router.push("/app/verify")}
          className="bg-black text-white hover:bg-gray-800"
        >
          {passed ? "Return to Verification" : "Try again later"}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Header & Timer */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 pt-4 border-b mb-8 flex items-center justify-between shadow-sm px-4 -mx-4 rounded-b-xl">
        <div>
          <h1 className="text-2xl font-bold">{subject.SubjectName}</h1>
          <p className="text-gray-500 text-sm">20 Questions Assessment</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Remaining</span>
          <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-mono text-3xl font-black shadow-xl ring-4 ring-red-100">
            <span className={timeLeft < 60 ? "animate-pulse" : ""}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-blue-500" size={24} />
          <div>
            <p className="text-blue-800 font-bold">Total Time Allowed: {subject.Time} Minutes</p>
            <p className="text-blue-600 text-sm">The test will auto-submit when the timer reaches zero.</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-12 mb-12">
        {subject.question.map((q, index) => (
          <div key={q.id} className="border rounded-xl p-6 shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">
              <span className="text-gray-400 mr-2">{index + 1}.</span>
              {q.text}
            </h3>
            <div className="space-y-3">
              {q.options.map((option, optIndex) => {
                const isSelected = answers[q.id] === option
                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelectOption(q.id, option)}
                    className={`w-full py-3 px-4 border rounded-lg transition text-left font-medium ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-center border-t pt-8">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="bg-black text-white hover:bg-gray-800 px-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Answers"}
        </Button>
      </div>
    </div>
  )
}
