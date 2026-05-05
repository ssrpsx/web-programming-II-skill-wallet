export interface User {
  _id: string
  email: string
  name: string
  role: "user" | "interviewer"
  rank?: string
  photo?: string
  birthDate?: string
}

export interface Skill {
  _id: string
  title: string
  description?: string
  category: "technical" | "soft-skills" | "languages" | "certifications" | "other"
  level: "one" | "two" | "three"
}

export interface ChoiceQuestion {
  question: string
  options: string[]
  answer: string
}

export interface LevelData {
  _id?: string
  level: "choice" | "p2p_interview" | "interview"
  status: "pending" | "completed" | "failed"
  verifiedBy?: string
  verifiedAt?: string
  link?: string
  choice?: {
    questions: ChoiceQuestion[]
    userAnswers?: string[]
    score?: number
  }
}

export interface Verification {
  _id: string
  userId: User | string
  skillId: Skill | string
  levelData: LevelData[]
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface SubmitResponse {
  passed: boolean
  score: number
  message: string
  verification: Verification
}
