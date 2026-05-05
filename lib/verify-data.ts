export type VerifyStatus = 'available' | 'finished' | 'waiting' | 'failed' | 'pending'

export interface VerifyItem {
    id: string
    skill: string
    skillColor: 'green' | 'blue' | 'yellow'
    details: string
    status: VerifyStatus
}

export interface VerifyLevel {
    level: 1 | 2 | 3
    title: string
    description: string
    items: VerifyItem[]
}

export const verifyData: VerifyLevel[] = [
    {
        level: 1,
        title: 'Level 1: Test',
        description: 'Complete skill assessments',
        items: [
            {
                id: '1-1',
                skill: 'Frontend',
                skillColor: 'green',
                details: 'Pass 40 questions exam\nGet 70+ to pass\nExam in 30 minutes',
                status: 'available'
            },
            {
                id: '1-2',
                skill: 'ML',
                skillColor: 'blue',
                details: 'Pass 20 questions exam\nGet 60+ to pass',
                status: 'finished'
            }
        ]
    },
    {
        level: 2,
        title: 'Level 2: Peer to Peer',
        description: 'Get reviewed by peers',
        items: [
            {
                id: '2-1',
                skill: 'Frontend',
                skillColor: 'yellow',
                details: 'Submit 2 projects, get\nscored by 2 peers',
                status: 'waiting'
            },
            {
                id: '2-2',
                skill: 'ML',
                skillColor: 'blue',
                details: 'Submit 1 project, get\nscored by 3 peers',
                status: 'finished'
            }
        ]
    },
    {
        level: 3,
        title: 'Level 3: Interview',
        description: 'Interview with professionals',
        items: [
            {
                id: '3-1',
                skill: 'Frontend',
                skillColor: 'yellow',
                details: 'Get interviewed by 1-2\nreal expert',
                status: 'waiting'
            },
            {
                id: '3-2',
                skill: 'ML',
                skillColor: 'green',
                details: 'Get interviewed by 1-2\nprofessional!',
                status: 'available'
            }
        ]
    }
]
