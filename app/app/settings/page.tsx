import { apiFetch } from "@/lib/api/server"
import type { User } from "@/lib/api/types"
import SettingsForm from "./settings-form"

async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me")
  } catch {
    return null
  }
}

export default async function SettingsPage() {
  const user = await getCurrentUser()
  const fullName = user?.name ?? ""
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ""
  const lastName = parts.slice(1).join(" ")
  
  // Format birthDate to YYYY-MM-DD for the date input
  let formattedBirthDate = ""
  if (user?.birthDate) {
    const date = new Date(user.birthDate)
    formattedBirthDate = date.toISOString().split('T')[0]
  }

  return (
    <SettingsForm 
      userId={user?._id ?? ""} 
      defaultFirstName={firstName} 
      defaultLastName={lastName} 
      defaultPhoto={user?.photo ?? null}
      defaultBirthDate={formattedBirthDate}
    />
  )
}
