"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signUp } from "@/lib/actions/auth"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080"

function GoogleButton() {
  return (
    <>
      <div className="my-4 flex items-center justify-between">
        <span className="w-1/5 border-b lg:w-1/4"></span>
        <span className="text-xs text-center text-gray-500 uppercase">or sign up with</span>
        <span className="w-1/5 border-b lg:w-1/4"></span>
      </div>
      <a href={`${BACKEND_URL}/api/auth/google`} className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
        <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
        </svg>
        Sign Up with Google
      </a>
    </>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Signing up..." : "Sign Up"}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, {})

  return (
    <div>
      <FieldSet>
        <h3 className="text-2xl font-medium text-center p-4">Sign Up</h3>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                required
                minLength={2}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="password"
                required
                minLength={6}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="password"
                required
              />
            </Field>
            {state.error && (
              <FieldError className="text-red-600">{state.error}</FieldError>
            )}
            <Field className="my-4">
              <FieldDescription className="">
                Already have an account? <Link href="/signin">Sign in</Link>
              </FieldDescription>
              <SubmitButton />
            </Field>
          </FieldGroup>
        </form>
        <GoogleButton />
      </FieldSet>
    </div>
  )
}
