"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/api/types"
import { Subject } from "@/lib/questions"
import { createNewVerificationByTitle } from "@/lib/actions/verifications"

interface CreateVerificationFormProps {
  user: User | null
  subjects: Subject[]
  onSuccess: () => void
}

export function CreateVerificationForm({
  user,
  subjects,
  onSuccess,
}: CreateVerificationFormProps) {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    return <p className="text-red-600">User not found</p>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject) {
      setError("Please select a subject")
      return
    }

    const lastFailed = localStorage.getItem(`test_fail_cooldown_${selectedSubject}`)
    if (lastFailed) {
      const failedTime = parseInt(lastFailed, 10)
      const oneDay = 24 * 60 * 60 * 1000
      if (Date.now() - failedTime < oneDay) {
        setError("You failed this test recently. Please wait 24 hours before trying again.")
        return
      }
    }

    setIsSubmitting(true)
    try {
      await createNewVerificationByTitle(user._id, selectedSubject)
      onSuccess()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create verification')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="subjectId">Select a Subject</FieldLabel>
          <select
            id="subjectId"
            name="subjectId"
            required
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value)
              setError("")
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="">-- Choose a subject --</option>
            {subjects.map((subject) => (
              <option key={subject.SubjectName} value={subject.SubjectName}>
                {subject.SubjectName}
              </option>
            ))}
          </select>
        </Field>

        {error && <FieldError className="text-red-600">{error}</FieldError>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Verification"}
        </Button>
      </FieldGroup>
    </form>
  )
}
