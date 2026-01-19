// Forum data types and mock data

export type ReactionType = "like" | "love" | "celebrate" | "insightful" | "support"
export type PostCategory = "announcement" | "update" | "discussion" | "event"

export interface ForumReaction {
    userId: string
    userName: string
    type: ReactionType
}

export interface ForumPost {
    id: string
    title: string
    content: string
    authorId: string
    authorName: string
    authorRole: string
    authorDepartment?: string
    category: PostCategory
    createdAt: string
    updatedAt: string
    isPinned: boolean
    reactions: ForumReaction[]
    commentCount: number
    images?: string[] // URLs to post images
}

export interface ForumComment {
    id: string
    postId: string
    authorId: string
    authorName: string
    authorRole: string
    content: string
    createdAt: string
    parentCommentId?: string // for threaded replies
    reactions: ForumReaction[]
}

// Mock forum posts
export const forumPosts: ForumPost[] = [
    {
        id: "post-001",
        title: "Welcome to the Company Forum!",
        content:
            "We're excited to launch our new company forum! This is a space for all employees to stay connected, share updates, and engage with company-wide announcements. Feel free to react to posts and leave comments. Let's build a stronger community together!",
        authorId: "P-001",
        authorName: "Sarah Johnson",
        authorRole: "HR Manager",
        authorDepartment: "Human Resources",
        category: "announcement",
        createdAt: "2026-01-10T09:00:00Z",
        updatedAt: "2026-01-10T09:00:00Z",
        isPinned: true,
        reactions: [
            { userId: "P-002", userName: "Michael Chen", type: "celebrate" },
            { userId: "P-003", userName: "Emily Rodriguez", type: "like" },
            { userId: "P-004", userName: "David Kim", type: "love" },
            { userId: "P-005", userName: "Jessica Martinez", type: "celebrate" },
        ],
        commentCount: 8,
        images: [
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
        ],
    },
    {
        id: "post-002",
        title: "Q1 2026 Company All-Hands Meeting - January 25th",
        content:
            "Mark your calendars! Our Q1 All-Hands meeting is scheduled for January 25th at 2:00 PM in the main auditorium. The leadership team will share updates on company performance, strategic initiatives, and answer your questions. Virtual attendance link will be shared closer to the date.",
        authorId: "P-010",
        authorName: "Lisa Anderson",
        authorRole: "Internal Communications Manager",
        authorDepartment: "Communications",
        category: "event",
        createdAt: "2026-01-12T14:30:00Z",
        updatedAt: "2026-01-12T14:30:00Z",
        isPinned: true,
        reactions: [
            { userId: "P-001", userName: "Sarah Johnson", type: "like" },
            { userId: "P-006", userName: "Robert Taylor", type: "insightful" },
            { userId: "P-007", userName: "Amanda White", type: "like" },
        ],
        commentCount: 5,
    },
    {
        id: "post-003",
        title: "New Employee Benefits Program Launching February 1st",
        content:
            "Great news! We're enhancing our employee benefits program starting February 1st. The new program includes expanded health coverage, wellness stipends, and professional development budgets. Detailed information sessions will be held next week. Check your email for the schedule!",
        authorId: "P-001",
        authorName: "Sarah Johnson",
        authorRole: "HR Manager",
        authorDepartment: "Human Resources",
        category: "announcement",
        createdAt: "2026-01-14T10:15:00Z",
        updatedAt: "2026-01-14T10:15:00Z",
        isPinned: false,
        reactions: [
            { userId: "P-002", userName: "Michael Chen", type: "celebrate" },
            { userId: "P-003", userName: "Emily Rodriguez", type: "love" },
            { userId: "P-008", userName: "James Brown", type: "celebrate" },
            { userId: "P-009", userName: "Maria Garcia", type: "love" },
            { userId: "P-011", userName: "Christopher Lee", type: "celebrate" },
        ],
        commentCount: 12,
    },
    {
        id: "post-004",
        title: "Office Closure - Lunar New Year Holiday",
        content:
            "Please note that our offices will be closed from January 28th to January 30th in observance of Lunar New Year. Regular operations will resume on January 31st. Wishing everyone a prosperous Year of the Snake!",
        authorId: "P-010",
        authorName: "Lisa Anderson",
        authorRole: "Internal Communications Manager",
        authorDepartment: "Communications",
        category: "update",
        createdAt: "2026-01-15T08:00:00Z",
        updatedAt: "2026-01-15T08:00:00Z",
        isPinned: false,
        reactions: [
            { userId: "P-004", userName: "David Kim", type: "celebrate" },
            { userId: "P-005", userName: "Jessica Martinez", type: "like" },
        ],
        commentCount: 3,
    },
    {
        id: "post-005",
        title: "Team Building Activity - Volunteer Day",
        content:
            "Join us for our quarterly volunteer day on February 15th! We'll be partnering with local community organizations for various service projects. This is a great opportunity to give back and bond with colleagues. Sign-up sheet will be available next week. Limited spots!",
        authorId: "P-001",
        authorName: "Sarah Johnson",
        authorRole: "HR Manager",
        authorDepartment: "Human Resources",
        category: "event",
        createdAt: "2026-01-13T16:45:00Z",
        updatedAt: "2026-01-13T16:45:00Z",
        isPinned: false,
        reactions: [
            { userId: "P-003", userName: "Emily Rodriguez", type: "support" },
            { userId: "P-006", userName: "Robert Taylor", type: "love" },
            { userId: "P-012", userName: "Patricia Wilson", type: "support" },
        ],
        commentCount: 7,
    },
    {
        id: "post-006",
        title: "Reminder: Performance Review Cycle Opens Next Week",
        content:
            "The annual performance review cycle will open on January 22nd. Please ensure you complete your self-assessments by February 5th. Managers will schedule 1-on-1 review meetings during the following two weeks. Resources and templates are available on the HR portal.",
        authorId: "P-001",
        authorName: "Sarah Johnson",
        authorRole: "HR Manager",
        authorDepartment: "Human Resources",
        category: "update",
        createdAt: "2026-01-11T11:20:00Z",
        updatedAt: "2026-01-11T11:20:00Z",
        isPinned: false,
        reactions: [
            { userId: "P-007", userName: "Amanda White", type: "insightful" },
            { userId: "P-008", userName: "James Brown", type: "like" },
        ],
        commentCount: 4,
    },
]

// Mock forum comments
export const forumComments: ForumComment[] = [
    {
        id: "comment-001",
        postId: "post-001",
        authorId: "P-002",
        authorName: "Michael Chen",
        authorRole: "Software Engineer",
        content: "This is fantastic! Looking forward to more engagement across teams.",
        createdAt: "2026-01-10T09:30:00Z",
        reactions: [
            { userId: "P-001", userName: "Sarah Johnson", type: "like" },
            { userId: "P-003", userName: "Emily Rodriguez", type: "like" },
        ],
    },
    {
        id: "comment-002",
        postId: "post-001",
        authorId: "P-003",
        authorName: "Emily Rodriguez",
        authorRole: "Product Manager",
        content: "Great initiative! Will there be categories for different topics?",
        createdAt: "2026-01-10T10:15:00Z",
        reactions: [{ userId: "P-001", userName: "Sarah Johnson", type: "insightful" }],
    },
    {
        id: "comment-003",
        postId: "post-001",
        authorId: "P-001",
        authorName: "Sarah Johnson",
        authorRole: "HR Manager",
        content: "Yes! Posts are categorized as announcements, updates, discussions, and events. You can filter by category.",
        createdAt: "2026-01-10T10:45:00Z",
        parentCommentId: "comment-002",
        reactions: [
            { userId: "P-003", userName: "Emily Rodriguez", type: "celebrate" },
            { userId: "P-002", userName: "Michael Chen", type: "like" },
        ],
    },
    {
        id: "comment-004",
        postId: "post-002",
        authorId: "P-006",
        authorName: "Robert Taylor",
        authorRole: "Finance Director",
        content: "Will the presentation slides be shared afterwards?",
        createdAt: "2026-01-12T15:00:00Z",
        reactions: [{ userId: "P-010", userName: "Lisa Anderson", type: "like" }],
    },
    {
        id: "comment-005",
        postId: "post-002",
        authorId: "P-010",
        authorName: "Lisa Anderson",
        authorRole: "Internal Communications Manager",
        content: "Absolutely! We'll share the deck and recording within 24 hours of the meeting.",
        createdAt: "2026-01-12T15:30:00Z",
        parentCommentId: "comment-004",
        reactions: [
            { userId: "P-006", userName: "Robert Taylor", type: "celebrate" },
            { userId: "P-004", userName: "David Kim", type: "like" },
        ],
    },
    {
        id: "comment-006",
        postId: "post-003",
        authorId: "P-008",
        authorName: "James Brown",
        authorRole: "Marketing Specialist",
        content: "This is amazing news! Can you share more details about the wellness stipend?",
        createdAt: "2026-01-14T11:00:00Z",
        reactions: [
            { userId: "P-001", userName: "Sarah Johnson", type: "like" },
            { userId: "P-009", userName: "Maria Garcia", type: "like" },
        ],
    },
    {
        id: "comment-007",
        postId: "post-003",
        authorId: "P-001",
        authorName: "Sarah Johnson",
        authorRole: "HR Manager",
        content:
            "The wellness stipend will be $500 per year, usable for gym memberships, fitness classes, mental health apps, or wellness equipment. Full details in the info sessions!",
        createdAt: "2026-01-14T11:30:00Z",
        parentCommentId: "comment-006",
        reactions: [
            { userId: "P-008", userName: "James Brown", type: "celebrate" },
            { userId: "P-002", userName: "Michael Chen", type: "love" },
            { userId: "P-003", userName: "Emily Rodriguez", type: "celebrate" },
        ],
    },
    {
        id: "comment-008",
        postId: "post-005",
        authorId: "P-003",
        authorName: "Emily Rodriguez",
        authorRole: "Product Manager",
        content: "Count me in! What kind of projects will be available?",
        createdAt: "2026-01-13T17:00:00Z",
        reactions: [{ userId: "P-001", userName: "Sarah Johnson", type: "support" }],
    },
    {
        id: "comment-009",
        postId: "post-005",
        authorId: "P-001",
        authorName: "Sarah Johnson",
        authorRole: "HR Manager",
        content:
            "We have options including food bank sorting, park cleanup, senior center activities, and tutoring programs. Something for everyone!",
        createdAt: "2026-01-13T17:30:00Z",
        parentCommentId: "comment-008",
        reactions: [
            { userId: "P-003", userName: "Emily Rodriguez", type: "love" },
            { userId: "P-012", userName: "Patricia Wilson", type: "celebrate" },
        ],
    },
]
