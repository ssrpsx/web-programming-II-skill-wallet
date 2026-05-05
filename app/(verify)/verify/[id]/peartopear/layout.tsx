import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function PeerToPeerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b bg-white sticky top-0 z-10">
                <div className="mx-auto max-w-7xl w-full px-4 py-6 flex items-center justify-between">
                    <Link href="/app/verify" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ChevronLeft size={20} />
                        <span className="text-sm font-medium">Start Collection</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl w-full px-4 py-12">
                {children}
            </main>
        </div>
    )
}
