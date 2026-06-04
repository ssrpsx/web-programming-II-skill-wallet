"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signIn, verify2FAAction } from "@/lib/actions/auth"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Please wait..." : label}
    </Button>
  )
}

export default function SignInForm() {
  const [state, formAction] = useActionState(signIn, {})
  const [verifyState, verifyFormAction] = useActionState(verify2FAAction, {})

  if (state.requires2FA && state.tempToken) {
    return (
      <div>
        <FieldSet>
          <h3 className="p-4 text-center text-2xl font-medium">Two-Factor Authentication</h3>
          <p className="text-center text-sm text-gray-600 mb-4">
            An OTP has been sent to your email. Please enter it below.
          </p>
          <form action={verifyFormAction}>
            <input type="hidden" name="tempToken" value={state.tempToken} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="otp">6-Digit OTP</FieldLabel>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  required
                />
              </Field>
              {verifyState.error && (
                <FieldError className="text-red-600">{verifyState.error}</FieldError>
              )}
              <Field className="my-4">
                <SubmitButton label="Verify OTP" />
              </Field>
            </FieldGroup>
          </form>
        </FieldSet>
      </div>
    )
  }

  return (
    <div>
      <FieldSet>
        <h3 className="p-4 text-center text-2xl font-medium">Sign In</h3>
        <form action={formAction}>
          <FieldGroup>
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
                autoComplete="current-password"
                placeholder="password"
                required
              />
            </Field>
            {state.error && (
              <FieldError className="text-red-600">{state.error}</FieldError>
            )}
            <Field className="my-4">
              <SubmitButton label="Sign In" />
            </Field>
          </FieldGroup>
        </form>

        <div className="my-4 flex items-center justify-between">
          <span className="w-1/5 border-b lg:w-1/4"></span>
          <span className="text-xs text-center text-gray-500 uppercase">
            or login with
          </span>
          <span className="w-1/5 border-b lg:w-1/4"></span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Using a direct anchor link for OAuth to ensure it hits our Express backend properly */}
          <Link href="http://localhost:8080/api/auth/google" passHref>
            <Button variant="outline" className="w-full" asChild>
              <a>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Sign In with Google
              </a>
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-center text-sm">
          Don’t have an account? <Link href="/signup" className="underline">Sign up</Link>
        </div>
      </FieldSet>
    </div>
  )
}
