'use client'

import { useState, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Item, ItemContent, ItemTitle, ItemActions } from '@/components/ui/item'
import { ChevronRight, User, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { updateProfile } from '@/lib/actions/auth'
import { useFormStatus } from 'react-dom'

interface SettingsFormProps {
    userId: string
    defaultFirstName: string
    defaultLastName: string
    defaultPhoto: string | null
    defaultBirthDate: string
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Saving..." : "Save Changes"}
        </Button>
    )
}

export default function SettingsForm({ 
    userId, 
    defaultFirstName, 
    defaultLastName,
    defaultPhoto,
    defaultBirthDate
}: SettingsFormProps) {
    const [firstName, setFirstName] = useState(defaultFirstName)
    const [lastName, setLastName] = useState(defaultLastName)
    const [birthDate, setBirthDate] = useState(defaultBirthDate)
    const [photo, setPhoto] = useState<string | null>(defaultPhoto)
    const [state, formAction] = useActionState(updateProfile, {})

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhoto(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your account, preferences, and security settings.</p>
                </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-6">
                {/* Photo Upload */}
                <div className="flex items-start gap-6">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={photo || undefined} alt="Profile" />
                        <AvatarFallback className="text-4xl"><User /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <label htmlFor="photo-input" className="cursor-pointer">
                            <Button variant="outline" asChild>
                                <span>Choose Photo</span>
                            </Button>
                        </label>
                        <input
                            id="photo-input"
                            type="file"
                            accept="image/jpg,image/jpeg,image/png,image/gif"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        <p className="text-gray-500 text-sm mt-2">Support JPG, PNG, GIF.</p>
                    </div>
                </div>

                <Separator />

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="userId" value={userId} />
                    <input type="hidden" name="name" value={`${firstName} ${lastName}`.trim()} />
                    <input type="hidden" name="photo" value={photo || ""} />

                    {/* Feedback Messages */}
                    {state.success && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="h-4 w-4" />
                            Profile updated successfully!
                        </div>
                    )}
                    {state.error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {state.error}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-gray-700 font-medium">First name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="border-gray-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-gray-700 font-medium">Last name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="border-gray-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-gray-700 font-medium">Birth date</Label>
                        <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="border-gray-300 max-w-sm"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <SubmitButton />
                    </div>
                </form>

                <Separator />
            </div>

            {/* Settings Information */}
            <Link href="#" className="no-underline">
                <Item variant="outline" className="cursor-pointer">
                    <ItemContent className="flex-row items-center">
                        <span className="text-lg">⚙️</span>
                        <ItemTitle className="ml-3">Settings Your Information</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                        <ChevronRight size={20} className="text-gray-400" />
                    </ItemActions>
                </Item>
            </Link>
        </div>
    )
}
