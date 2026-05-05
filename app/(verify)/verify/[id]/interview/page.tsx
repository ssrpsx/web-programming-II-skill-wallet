import { InterviewVerificationClient } from '@/components/verify/interview-verification-client'
import { apiFetch } from '@/lib/api/server'
import type { Verification, User } from '@/lib/api/types'

interface InterviewPageProps {
    params: Promise<{
        id: string
    }>
}

async function getVerification(id: string): Promise<Verification | null> {
    try {
        return await apiFetch<Verification>(`/verifications/${id}`)
    } catch {
        return null
    }
}

async function getCurrentUser(): Promise<User | null> {
    try {
        return await apiFetch<User>('/auth/me')
    } catch {
        return null
    }
}

export default async function InterviewPage({ params }: InterviewPageProps) {
    const { id } = await params
    const [verification, currentUser] = await Promise.all([
        getVerification(id),
        getCurrentUser()
    ])

    if (!verification || !currentUser) {
        return <div className="text-center py-12">Unable to load data</div>
    }

    const discordLink = process.env.DISCORD_JOIN_LINK || "https://discord.gg/skillcollection"

    return (
        <div className="py-8 px-4 sm:px-6">
            <InterviewVerificationClient 
                verification={verification} 
                currentUser={currentUser} 
                discordLink={discordLink} 
            />
        </div>
    )
}


