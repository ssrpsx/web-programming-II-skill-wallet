"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { apiFetch } from "@/lib/api/server"
import type { AuthResponse } from "@/lib/api/types"

export async function signIn(
  prevState: any,
  formData: FormData
): Promise<{ error?: string; requires2FA?: boolean; tempToken?: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const data = await apiFetch<any>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (data.requires2FA) {
      return { requires2FA: true, tempToken: data.tempToken }
    }

    const cookieStore = await cookies()
    cookieStore.set("token", data.token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }

  redirect("/app")
}

export async function verify2FAAction(
  prevState: any,
  formData: FormData
): Promise<{ error?: string }> {
  const otp = formData.get("otp") as string
  const tempToken = formData.get("tempToken") as string

  try {
    const data = await apiFetch<AuthResponse>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ otp, tempToken }),
    })

    const cookieStore = await cookies()
    cookieStore.set("token", data.token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }

  redirect("/app")
}

export async function signUp(
  prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const name = formData.get("name") as string

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  try {
    const data = await apiFetch<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })

    const cookieStore = await cookies()
    cookieStore.set("token", data.token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }

  redirect("/app")
}

export async function logOut() {
  const cookieStore = await cookies()
  cookieStore.delete("token")
  redirect("/signin")
}

export async function updateProfile(
  prevState: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const name = formData.get("name") as string
  const userId = formData.get("userId") as string
  const photo = formData.get("photo") as string
  const birthDate = formData.get("birthDate") as string

  try {
    await apiFetch(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ name, photo, birthDate }),
    })
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function enable2FAAction(): Promise<{ error?: string; success?: boolean; message?: string }> {
  try {
    const res = await apiFetch<{ message: string }>("/auth/2fa/enable", {
      method: "POST",
    })
    return { success: true, message: res.message }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function confirm2FAAction(
  prevState: any,
  formData: FormData
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const otp = formData.get("otp") as string
  try {
    const res = await apiFetch<{ message: string }>("/auth/2fa/confirm", {
      method: "POST",
      body: JSON.stringify({ otp }),
    })
    return { success: true, message: res.message }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
