
import Link from "next/link"
import { Book } from "lucide-react"
import SignUpForm from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-svh lg:h-svh lg:grid lg:grid-cols-2">
      <div className="flex min-h-svh flex-col p-6 lg:min-h-0">
        <Link href="/">
          <h1 className="text-md mb-8 flex items-center gap-2 font-semibold">
            <Book /> Skill Collection
          </h1>
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="hidden p-6 lg:flex lg:items-center lg:justify-center lg:overflow-hidden">
        <img
          src="/wallpaperNoodle.png"
          alt="Sign Up"
          className="h-full w-full object-cover dark:invert rounded-xl"
        />
      </div>
    </div>
  )
}
