"use server"

import { apiFetch } from "@/lib/api/server"
import type { SubmitResponse, Verification } from "@/lib/api/types"
import { revalidatePath } from "next/cache"

export async function submitQuiz(
  verificationId: string,
  answers: string[]
): Promise<{ success: boolean, passed?: boolean, score?: number, error?: string }> {
  try {
    const response = await apiFetch<SubmitResponse>(
      `/verifications/${verificationId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      }
    )
    revalidatePath("/app")
    revalidatePath("/app/verify")
    return { success: true, passed: response.passed, score: response.score }
  } catch (e: unknown) {
    console.error("submitQuiz failed:", e)
    return { success: false, error: (e as Error).message }
  }
}

export async function retryQuiz(
  verificationId: string
): Promise<{ success: boolean, verification?: Verification, error?: string }> {
  try {
    const response = await apiFetch<Verification>(
      `/verifications/${verificationId}/retry`,
      {
        method: "POST",
        body: "{}",
      }
    )
    revalidatePath("/app")
    revalidatePath("/app/verify")
    return { success: true, verification: response }
  } catch (e: unknown) {
    console.error("retryQuiz failed:", e)
    return { success: false, error: (e as Error).message }
  }
}

export async function updateLevelStatus(
  verificationId: string,
  level: string,
  status: "completed" | "failed",
  verifiedBy?: string
): Promise<Verification> {
  try {
    const response = await apiFetch<Verification>(
      `/verifications/${verificationId}/levels/${level}/complete`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, verifiedBy }),
      }
    )
    revalidatePath("/app")
    revalidatePath("/app/verify")
    return response
  } catch (e: unknown) {
    throw e
  }
}

export async function createNewVerificationByTitle(
  userId: string,
  skillTitle: string
): Promise<Verification> {
  try {
    const response = await apiFetch<Verification>("/verifications", {
      method: "POST",
      body: JSON.stringify({ userId, skillTitle }),
    })
    revalidatePath("/app")
    revalidatePath("/app/verify")
    return response
  } catch (e: unknown) {
    throw e
  }
}

export async function initiateP2P(verificationId: string): Promise<{ success: boolean, peerName?: string, error?: string }> {
  try {
    const response = await apiFetch<{ peerName: string, verification: Verification }>(
      `/verifications/${verificationId}/p2p/initiate`,
      {
        method: "POST",
      }
    )
    revalidatePath("/app")
    revalidatePath("/app/verify")
    return { success: true, peerName: response.peerName }
  } catch (e: unknown) {
    console.error("initiateP2P failed:", e)
    return { success: false, error: (e as Error).message }
  }
}

export async function initiateInterview(verificationId: string): Promise<{ success: boolean, interviewerName?: string, interviewerRank?: string, error?: string }> {
  try {
    const response = await apiFetch<{ interviewerName: string, interviewerRank: string, verification: Verification }>(
      `/verifications/${verificationId}/interview/initiate`,
      {
        method: "POST",
      }
    )
    revalidatePath("/app")
    revalidatePath("/app/verify")
    return { success: true, interviewerName: response.interviewerName, interviewerRank: response.interviewerRank }
  } catch (e: unknown) {
    console.error("initiateInterview failed:", e)
    return { success: false, error: (e as Error).message }
  }
}

