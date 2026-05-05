"use server"

import { apiFetch } from "@/lib/api/server"
import type { SubmitResponse, Verification } from "@/lib/api/types"
import { revalidatePath } from "next/cache"

export async function submitQuiz(
  verificationId: string,
  answers: string[]
): Promise<SubmitResponse> {
  return apiFetch<SubmitResponse>(
    `/verifications/${verificationId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    }
  )
}

export async function retryQuiz(
  verificationId: string
): Promise<Verification> {
  return apiFetch<Verification>(
    `/verifications/${verificationId}/retry`,
    {
      method: "POST",
      body: "{}",
    }
  )
}

export async function createVerification(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const userId = formData.get("userId") as string
  const skillId = formData.get("skillId") as string

  try {
    await apiFetch<Verification>("/verifications", {
      method: "POST",
      body: JSON.stringify({ userId, skillId }),
    })
    revalidatePath("/app/verify")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function submitTestResult(
  verificationId: string,
  answers: string[]
): Promise<SubmitResponse> {
  try {
    const response = await apiFetch<SubmitResponse>(`/verifications/${verificationId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    revalidatePath("/app");
    revalidatePath("/app/verify");
    return response;
  } catch (e: unknown) {
    throw e;
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
    return { success: true, peerName: response.peerName }
  } catch (e: unknown) {
    console.error("initiateP2P failed:", e)
    return { success: false, error: (e as Error).message }
  }
}
