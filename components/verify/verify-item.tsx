"use client"

import { Badge } from '@/components/ui/badge'
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemActions,
} from '@/components/ui/item'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { retryQuiz } from '@/lib/actions/verifications'
import { VerifyItem, VerifyStatus } from '@/lib/verify-data'

interface VerifyItemComponentProps {
    item: VerifyItem
    routePath?: string
}

const skillColorMap = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800'
}

const statusColorMap: Record<VerifyStatus, string> = {
    available: 'bg-blue-100 text-blue-800',
    finished: 'bg-green-100 text-green-800',
    waiting: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
}

const statusLabelMap: Record<VerifyStatus, string> = {
    available: 'Available',
    finished: 'Finished',
    waiting: 'Waiting',
    failed: 'Failed'
}

export function VerifyItemComponent({ item, routePath: propRoutePath }: VerifyItemComponentProps) {
    const router = useRouter()
    const [isRetrying, setIsRetrying] = useState(false)

    // For failed status, call retry API then navigate to choice
    const handleFailedClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsRetrying(true)
        try {
            await retryQuiz(item.id)
            router.push(`/verify/${item.id}/choice`)
        } catch (error) {
            console.error('Retry failed:', error)
            alert(error instanceof Error ? error.message : 'Failed to retry. Please wait for the cooldown.')
            setIsRetrying(false)
        }
    }

    // For non-failed status, determine route path
    let routePath = propRoutePath

    if (!routePath) {
        const level = item.id.charAt(0)
        routePath = `/verify/${item.id}/choice`

        if (level === '2') {
            routePath = `/verify/${item.id}/peartopear`
        } else if (level === '3') {
            routePath = `/verify/${item.id}/interview`
        }
    }

    // Render failed item with onClick handler instead of Link
    if (item.status === 'failed') {
        return (
            <button
                onClick={handleFailedClick}
                disabled={isRetrying}
                className="w-full no-underline"
            >
                <Item variant="outline" className="cursor-pointer hover:bg-gray-50 transition">
                    <ItemContent className="flex-row items-start flex-1">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        {/* Skills Column */}
                        <div className="min-w-[140px] flex-shrink-0">
                            <Badge className={`${skillColorMap[item.skillColor]} border-0 whitespace-normal break-words py-1`}>
                                {item.skill}
                            </Badge>
                        </div>

                        {/* Details Column */}
                        <div className="flex-1 min-w-0">
                            <ItemDescription className="m-0 whitespace-pre-wrap text-xs truncate sm:whitespace-normal sm:overflow-visible">
                                {item.details}
                            </ItemDescription>
                        </div>

                        {/* Status Column */}
                        <div className="min-w-[100px] flex-shrink-0 text-right">
                            <Badge className={`${statusColorMap[item.status]} border-0`}>
                                {isRetrying ? 'Retrying...' : statusLabelMap[item.status]}
                            </Badge>
                        </div>
                    </div>
                </ItemContent>

                {/* Action */}
                <ItemActions className="ml-4 flex-shrink-0">
                    <div className="p-2 hover:bg-gray-100 rounded transition">
                        <ChevronRight size={18} className="text-gray-400" />
                    </div>
                </ItemActions>
            </Item>
        </button>
    )
}

// For non-failed status, use Link
return (
    <Link href={routePath} className="no-underline">
        <Item variant="outline" className="cursor-pointer hover:bg-gray-50 transition">
            <ItemContent className="flex-row items-start flex-1 overflow-hidden">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    {/* Skills Column */}
                    <div className="min-w-[140px] flex-shrink-0">
                        <Badge className={`${skillColorMap[item.skillColor]} border-0 whitespace-normal break-words py-1`}>
                            {item.skill}
                        </Badge>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 min-w-0">
                        <ItemDescription className="m-0 whitespace-pre-wrap text-xs truncate sm:whitespace-normal sm:overflow-visible">
                            {item.details}
                        </ItemDescription>
                    </div>

                    {/* Status Column */}
                    <div className="min-w-[100px] flex-shrink-0 text-right">
                        <Badge className={`${statusColorMap[item.status]} border-0`}>
                            {statusLabelMap[item.status]}
                        </Badge>
                    </div>
                </div>
                </ItemContent>

                {/* Action */}
                <ItemActions className="ml-4">
                    <button className="p-2 hover:bg-gray-100 rounded transition">
                        <ChevronRight size={18} className="text-gray-400" />
                    </button>
                </ItemActions>
            </Item>
        </Link>
    )
}
