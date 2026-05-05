"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitQuiz, retryQuiz } from "@/lib/actions/verifications"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import type { ChoiceQuestion, Verification } from "@/lib/api/types"

interface ChoiceQuizProps {
  verification: Verification
  questions: ChoiceQuestion[]
}

export function ChoiceQuiz({ verification, questions }: ChoiceQuizProps) {
  const verificationId = verification._id
  const choiceLevel = verification.levelData.find(l => l.level === "choice")
  
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [submitResult, setSubmitResult] = useState<{
    passed: boolean
    score: number
  } | null>(null)

  const [error, setError] = useState<string | null>(() => {
    if (choiceLevel?.status === "failed" && choiceLevel.verifiedAt) {
      const lastFailedAt = new Date(choiceLevel.verifiedAt).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      if (now - lastFailedAt < oneDay) {
        const remainingMs = oneDay - (now - lastFailedAt);
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return `Cooldown active. Please wait ${remainingHours} more hours before retrying the test.`;
      }
    }
    return null
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setSelectedOption(null)
  }

  const handleSelectOption = (option: string) => {
    setSelectedOption(option)
  }

  const handleNext = () => {
    if (selectedOption === null) {
      setError("Please select an option")
      return
    }

    setError(null)
    const newAnswers = [...selectedAnswers, selectedOption]
    setSelectedAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
    } else {
      // Submit quiz
      startTransition(async () => {
        const result = await submitQuiz(verificationId, newAnswers)
        if (result.success) {
          setSubmitResult({
            passed: result.passed!,
            score: result.score!,
          })
        } else {
          setError(result.error || "Failed to submit quiz")
        }
      })
    }
  }

  const handleRetry = async () => {
    startTransition(async () => {
      const result = await retryQuiz(verificationId)
      if (result.success) {
        setQuizStarted(false)
        setCurrentQuestion(0)
        setSelectedOption(null)
        setSelectedAnswers([])
        setSubmitResult(null)
        setError(null)
        router.refresh()
      } else {
        setError(result.error || "Failed to retry quiz")
      }
    })
  }

  // Intro Screen
  if (!quizStarted) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-8 animate-in fade-in duration-700">
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Assessment</h1>
          <p className="text-gray-600">
            A series of questions will help you demonstrate your knowledge. Answer
            all questions to complete the assessment.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-800 text-sm font-medium animate-in slide-in-from-top duration-500">
              {error}
            </div>
          )}

          <Button
            onClick={handleStartQuiz}
            disabled={!!error}
            className="w-full h-12 text-lg bg-black text-white hover:bg-gray-800"
          >
            {error ? "Test Locked" : "Start Quiz"}
          </Button>
        </div>
      </div>
    )
  }

  // Result Screen
  if (submitResult !== null) {
    const passed = submitResult.passed
    const score = submitResult.score

    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className={`p-8 rounded-3xl border shadow-sm ${passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex justify-center mb-6">
            {passed ? (
              <div className="bg-green-500 p-4 rounded-full">
                <CheckCircle2 size={48} className="text-white" />
              </div>
            ) : (
              <div className="bg-red-500 p-4 rounded-full">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-900' : 'text-red-900'}`}>
            {passed ? 'Assessment Passed!' : 'Assessment Failed'}
          </h1>
          <p className={`${passed ? 'text-green-700' : 'text-red-700'} mb-6`}>
            Your score: <span className="font-bold text-2xl ml-1">{Math.round(score)}%</span>
          </p>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-inner mb-6 text-sm">
            {passed ? (
              <p className="text-green-800">
                Congratulations! You've demonstrated sufficient knowledge to proceed to the next level of verification.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-red-800">
                  Your score was below the passing threshold. Review the material and try again after the cooldown period.
                </p>
                {error && (
                  <div className="bg-red-100 p-3 rounded-lg border border-red-200 text-red-900 font-medium animate-pulse">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {passed ? (
              <Button
                onClick={() => {
                  window.location.href = "/app/verify"
                }}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                Continue to Next Level
              </Button>
            ) : (
              <Button
                onClick={handleRetry}
                disabled={isPending}
                className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 text-white"
              >
                {isPending ? "Resetting Test..." : "Try Again Now"}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = "/app"
              }}
              className="w-full h-12"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {!passed && !error && (
          <p className="text-gray-500 text-xs">
            * Note: Retrying will reset your current progress and generate new questions.
          </p>
        )}
      </div>
    )
  }

  // Question Screen
  const question = questions[currentQuestion]
  const progress = `${currentQuestion + 1} / ${questions.length}`

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="text-center mb-8">
        <p className="text-gray-500 text-sm font-medium">{progress}</p>
      </div>

      {/* Question */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectOption(option)}
            className={`w-full py-3 px-4 border rounded-lg transition text-left font-medium ${
              selectedOption === option
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

      {/* Next Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={isPending}
          className="bg-black text-white hover:bg-gray-800"
        >
          {isPending ? "Submitting..." : "Next"}
        </Button>
      </div>
    </div>
  )
}
