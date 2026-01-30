// Mock data for the 8People CMS - O-S-C-P Model
// O = Organizational Unit, S = Position, C = Job Classification, P = Person (Employee)

export interface OrganizationalUnit {
  id: string
  code: string
  name: string
  abbreviation?: string
  parentId?: string
  costCenter?: string
  managerPositionId?: string
  validFrom: string
  validTo?: string
  status: "active" | "inactive"
  description?: string
  level: number // 1=Company, 2=Division, 3=Department, 4=Team
  unitType: "company" | "division" | "department" | "team"
}

export interface JobClassification {
  id: string
  code: string
  title: string
  jobFamily: string
  jobLevel: string
  payGradeGroup: string
  standardHours: number
  flsaStatus: "exempt" | "non-exempt"
  description?: string
  requirements: string[]
  responsibilities: string[]
  competencies: string[]
  status: "active" | "inactive"
}

export interface Position {
  id: string
  code: string
  title: string
  jobClassificationId: string
  jobClassificationTitle: string
  organizationalUnitId: string
  organizationalUnitName: string
  parentPositionId?: string
  parentPositionTitle?: string
  costCenter?: string
  fte: number
  validFrom: string
  validTo?: string
  status: "active" | "inactive"
  hiringStatus: "filled" | "vacant" | "hiring"
  incumbentId?: string
  incumbentName?: string
  focusArea?: string
  workMode?: "onsite" | "hybrid" | "remote"
  officeLocation?: string
}

export interface EmployeeAddress {
  fullAddress: string
}

export interface EmployeeTaxInfo {
  personalTaxCode: string
  taxDependents: number
  socialInsuranceBookNumber: string
  initialRegistrationHospitalCode: string
}

export interface EmployeeBankInfo {
  bankName: string
  branch: string
  accountNumber: string
  accountHolderName: string
}

export interface EmployeeEmergencyContact {
  contactPersonName: string
  relationship: string
  phone: string
  email: string
}

export interface EmployeeEducation {
  degree: string
  fieldOfStudy: string
  institution: string
  graduationYear: string
}

export interface EmployeeContract {
  id: string // Added id field for linking with transactions
  contractNumber: string
  contractType: string
  startDate: string
  endDate: string
  signDate?: string
  fileUrl?: string
  fileName?: string
  notes?: string
  attachmentFile?: string // Deprecated, use fileUrl/fileName instead
  status: "active" | "terminated"
}

export const contractTypeOptions = ["Internship", "Probation", "Service Contract", "Full-time"] as const

export type TransactionAction =
  | "hiring"
  | "extension_of_probation"
  | "probation_confirmation"
  | "transfer"
  | "contract_renewal"
  | "promotion"
  | "salary_change"
  | "demotion"
  | "job_rotation"
  | "temporary_assignment"
  | "disciplinary_action"
  | "resignation"
  | "rehire"

export const transactionReasons: Record<TransactionAction, string[]> = {
  hiring: ["New Position", "Replacement", "Project Based"],
  extension_of_probation: ["Unsatisfactory Performance"],
  probation_confirmation: ["Probation Completion"],
  transfer: ["Restructuring", "Internal Recruitment", "New Acquired Skills", "Employee Request"],
  contract_renewal: ["New Contract"],
  promotion: ["Organizational Requirement", "Performance"],
  salary_change: ["Annual Appraisal", "Restructuring"],
  demotion: ["Performance", "Restructuring", "Disciplinary Action"],
  job_rotation: ["Performance", "Restructuring", "Disciplinary Action", "Skill Enhancement"],
  temporary_assignment: ["Acting New Role"],
  disciplinary_action: ["Misconduct", "Theft", "Fraud", "Criminal Offense"],
  resignation: ["Voluntary", "Involuntary"],
  rehire: ["New Position", "Replacement", "Project Based"],
}

export const resignationSubReasons: Record<string, string[]> = {
  Voluntary: ["Personal Matter", "Culture", "Career Development", "Salary and Benefits"],
  Involuntary: ["Contract End", "Disciplinary"],
}

export interface EmployeeTransaction {
  id: string
  action: TransactionAction
  reason: string
  subReason?: string // For resignation sub-reasons
  text: string // Auto-generated label based on Action & Reason
  effectiveDate: string
  createdAt: string
  createdBy: string
  notes?: string

  linkedContractId?: string

  // Contract info snapshot (only for transactions that involve contracts)
  contractNumber?: string
  contractType?: string
  contractStartDate?: string
  contractEndDate?: string
  signDate?: string

  // Personal info snapshot (optional, for tracking changes)
  positionId?: string
  positionTitle?: string
  organizationalUnitId?: string
  organizationalUnitName?: string
  jobClassificationId?: string
  jobClassificationTitle?: string

  // Transfer specific fields
  fromTeamId?: string
  fromTeamName?: string
  toTeamId?: string
  toTeamName?: string

  // Salary change specific
  salaryChange?: {
    oldSalary?: number
    newSalary?: number
    currency?: string
  }
}

export interface EmployeeDependent {
  id: string
  fullName: string
  relationship: string
  dateOfBirth?: string
  effectiveDate: string // Used for VAT reduction & payroll calculation
  nationalIdNumber?: string
  notes?: string
}

export interface ResignationInfo {
  resignationAction: "Voluntary" | "Involuntary"
  resignationReason: string
  lastWorkingDate: string
  exitInterviewCompleted: boolean
  assetsReturned: boolean
  rehireEligible: boolean // If false, employee is blacklisted
  blacklistReason?: string
}

export type LeaveRequestStatus = "draft" | "pending" | "approved" | "rejected" | "cancelled"

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  leaveTypeId: string
  leaveTypeName: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveRequestStatus
  approvers: {
    employeeId: string
    employeeName: string
    status: "pending" | "approved" | "rejected"
    comment?: string
    respondedAt?: string
  }[]
  ccRecipients?: {
    employeeId: string
    employeeName: string
  }[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LeavePolicyRule {
  id: string
  name: string
  description: string
  jobLevels: string[] // Job levels this policy applies to (from JobClassification.jobLevel)
  annualLeaveDays: number
  maxCarryForwardDays: number
  carryForwardExpiryMonth: number // Month when carry forward expires (1-12, e.g., 6 = June)
  carryForwardExpiryDay: number // Day of the month when carry forward expires
  effectiveFrom: string
  effectiveTo?: string
  status: "active" | "inactive"
}

export interface PublicHoliday {
  id: string
  name: string
  date: string
  year: number
  isRecurring: boolean // If true, recurs every year
  description?: string
  status: "active" | "inactive"
}

export interface LeaveBalance {
  employeeId: string
  employeeName?: string
  department?: string
  leaveTypeId: string
  // Policy-based fields
  leavePolicyId?: string
  leavePolicyName?: string
  jobLevel?: string
  // Breakdown fields
  carryForwardFromPrevYear: number // Leave carried from previous year (max 5 days)
  carryForwardExpiryDate?: string // Date when carry forward expires (e.g., "2026-06-30")
  carryForwardExpired: number // Days already expired from carry forward
  annualEntitlement: number // Current year entitlement based on policy
  totalEntitlement: number // carryForward + annualEntitlement
  used: number
  pending: number
  carryForward: number // For backward compatibility
  available: number
  year: number
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  department?: string // Added department field
  organizationalUnitId?: string // Added org unit ID
  date: string
  clockIn?: string
  clockOut?: string
  status: "present" | "late" | "early_leave" | "absent" | "on_leave" | "weekend" | "holiday" | "not_checked_in"
  totalHours?: number
  overtime?: number
  lateMinutes?: number
  earlyMinutes?: number
  source: "web" | "mobile" | "fingerprint"
  notes?: string
}

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  breakDuration: number
  gracePeriod: number
  isDefault: boolean
}

export type CandidateStage = "new" | "screening" | "interviewing" | "testing" | "offering" | "hired" | "rejected"

export interface JobRequisition {
  id: string
  title: string
  positionId?: string
  positionCode?: string
  organizationalUnitId: string
  organizationalUnitName: string
  jobClassificationId?: string
  jobClassificationTitle: string // Added jobClassificationTitle (already present in updates, but good to have)
  description: string
  requirements: string[]
  salaryRange?: { min: number; max: number; currency: string }
  salaryHidden?: boolean // Added salary hidden option (deal)
  employmentType: "full-time" | "part-time" | "contract" | "intern"
  status: "draft" | "open" | "closed" | "on_hold"
  openings: number
  hired: number
  createdBy: string
  createdAt: string
  closingDate?: string
  publishPlatforms?: string[] // Added publish platforms
  jdFile?: string // Added JD file
}

export interface Candidate {
  id: string
  jobRequisitionId: string
  fullName: string
  email: string
  phone?: string
  resumeFile?: string
  linkedinUrl?: string
  portfolioUrl?: string
  stage: CandidateStage
  source: "career_page" | "linkedin" | "referral" | "agency" | "topcv" | "vietnamworks" | "other"
  referredBy?: string
  appliedAt: string
  updatedAt: string
  notes?: string
  rating?: number
  rejectionReason?: string
  interviews?: Interview[]
  aiCvScore?: number // AI CV score (0-100)
  aiCvAnalysis?: string // AI analysis summary
  offerAccepted?: boolean // Track if offer was accepted
  offerAcceptedAt?: string
  expectedSalary?: number
  yearsOfExperience?: number
  skills?: string[]
}

export interface Interview {
  id: string
  candidateId: string
  scheduledAt: string
  duration: number
  interviewers: string[]
  interviewerNames?: string[] // Added interviewer names
  type: "phone" | "video" | "onsite" | "technical" | "hr"
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  meetingLink?: string // Added meeting link
  location?: string // Added location for onsite
  feedback?: {
    interviewerId: string
    rating: number
    strengths?: string
    weaknesses?: string
    recommendation: "strong_hire" | "hire" | "maybe" | "no_hire"
  }[]
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "leave_request" | "leave_approved" | "leave_rejected" | "interview" | "onboarding" | "announcement" | "system" | "contract_warning" | "birthday"
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  employeeId: string
  employeeName: string
  fieldChanged: string
  oldValue: string
  newValue: string
  changedBy: string
  changedByName: string
  changedAt: string
  changeType: "self" | "hr" | "admin" | "system"
}

export interface Employee {
  id: string
  code: string // P-001, EMP-001
  fullName: string
  firstName: string
  lastName: string
  personalEmail: string
  companyEmail: string

  // O-S-C-P relationships
  positionId: string
  positionCode: string
  positionTitle: string
  jobClassificationId: string
  jobClassificationTitle: string
  organizationalUnitId: string
  organizationalUnitName: string
  costCenter?: string

  // Derived from position hierarchy
  lineManagerId?: string
  lineManagerName?: string

  // Matrix management (optional secondary reporting)
  matrixManagerId?: string
  matrixManagerName?: string

  directReportIds?: string[]

  status: "pending" | "active" | "future" | "resigned"
  onboardingStatus: {
    emailSent: boolean
    accountActivated: boolean
    profileCompleted: boolean
  }

  employeeId?: string
  jobTitle?: string
  client?: string
  startDate?: string
  fte: number

  companyJoinDate?: string // Ngày vào công ty (first day at company, e.g., as intern)
  officialStartDate?: string // Ngày chính thức làm việc (official employment start date)

  cellphone?: string
  dateOfBirth?: string
  workingDays?: number[] // Array of days of week (0=Sun, 6=Sat) considered working days
  gender?: "male" | "female" | "other"
  nationality?: string
  maritalStatus?: string
  address?: string
  nationalIdNumber?: string
  nationalIdIssueDate?: string
  nationalIdIssuePlace?: string
  passportNumber?: string
  passportIssueDate?: string
  passportExpiryDate?: string

  // Contract Information
  contractNumber?: string
  contractType?: "full-time" | "part-time" | "contract" | "internship"
  contractStartDate?: string
  contractEndDate?: string
  contractFileUrl?: string
  contractFileName?: string

  // Onboarding tracking
  onboardingDate?: string | null // Populated when employee first logs in and completes profile

  // Compensation
  baseSalary?: number

  birthRegisterAddress?: EmployeeAddress
  permanentAddress?: EmployeeAddress
  currentAddress?: EmployeeAddress
  taxInfo?: EmployeeTaxInfo
  bankInfo?: EmployeeBankInfo
  emergencyContact?: EmployeeEmergencyContact
  education?: EmployeeEducation[]
  contracts?: EmployeeContract[]
  auditLog?: AuditLogEntry[]

  transactions?: EmployeeTransaction[]
  dependents?: EmployeeDependent[]
  resignationInfo?: ResignationInfo
}

export interface LeaveType {
  id: string
  name: string
  description: string
  defaultDays: number
  carryForward: boolean
  maxCarryForwardDays: number
  color: string
}

export const organizationalUnits: OrganizationalUnit[] = [
  // Level 1 - Company
  {
    id: "O-001",
    code: "O-001",
    name: "8sPeople Company",
    abbreviation: "8SP",
    costCenter: "CC-ROOT",
    validFrom: "2024-01-01",
    status: "active",
    description: "Root organization - 8sPeople Software Company",
    level: 1,
    unitType: "company",
  },
  // Level 2 - Divisions
  {
    id: "O-010",
    code: "O-010",
    name: "Operations Division",
    abbreviation: "OPS",
    parentId: "O-001",
    costCenter: "CC-OPS",
    validFrom: "2024-01-01",
    status: "active",
    description: "HR, Finance, and administrative functions",
    level: 2,
    unitType: "division",
  },
  {
    id: "O-020",
    code: "O-020",
    name: "Commercial Division",
    abbreviation: "COM",
    parentId: "O-001",
    costCenter: "CC-COM",
    validFrom: "2024-01-01",
    status: "active",
    description: "Sales, Marketing, and Business Development",
    level: 2,
    unitType: "division",
  },
  {
    id: "O-030",
    code: "O-030",
    name: "Technology Division",
    abbreviation: "TECH",
    parentId: "O-001",
    costCenter: "CC-TECH",
    validFrom: "2024-01-01",
    status: "active",
    description: "Software Development and IT Operations",
    level: 2,
    unitType: "division",
  },
  // Level 3 - Departments
  {
    id: "O-011",
    code: "O-011",
    name: "HR Department",
    abbreviation: "HR",
    parentId: "O-010",
    costCenter: "CC-HR",
    validFrom: "2024-01-01",
    status: "active",
    description: "Human Resources Management",
    level: 3,
    unitType: "department",
  },
  {
    id: "O-012",
    code: "O-012",
    name: "Finance Department",
    abbreviation: "FIN",
    parentId: "O-010",
    costCenter: "CC-FIN",
    validFrom: "2024-01-01",
    status: "active",
    description: "Financial Planning and Accounting",
    level: 3,
    unitType: "department",
  },
  {
    id: "O-021",
    code: "O-021",
    name: "Marketing Department",
    abbreviation: "MKT",
    parentId: "O-020",
    costCenter: "CC-MKT",
    validFrom: "2024-01-01",
    status: "active",
    description: "Brand Management and Digital Marketing",
    level: 3,
    unitType: "department",
  },
  {
    id: "O-031",
    code: "O-031",
    name: "JavaScript Department",
    abbreviation: "JS-DEPT",
    parentId: "O-030",
    costCenter: "CC-JS",
    validFrom: "2024-01-01",
    status: "active",
    description: "Frontend & Backend JavaScript Development",
    level: 3,
    unitType: "department",
  },
  {
    id: "O-032",
    code: "O-032",
    name: "AI Department",
    abbreviation: "AI-DEPT",
    parentId: "O-030",
    costCenter: "CC-AI",
    validFrom: "2024-01-01",
    status: "active",
    description: "Machine Learning and AI Solutions",
    level: 3,
    unitType: "department",
  },
  {
    id: "O-033",
    code: "O-033",
    name: "Java Department",
    abbreviation: "JAVA-DEPT",
    parentId: "O-030",
    costCenter: "CC-JAVA",
    validFrom: "2024-01-01",
    status: "active",
    description: "Java Backend Development",
    level: 3,
    unitType: "department",
  },
  // Level 4 - Teams
  {
    id: "O-031-T1",
    code: "O-031-T1",
    name: "Frontend Team",
    abbreviation: "FE",
    parentId: "O-031",
    costCenter: "CC-JS-FE",
    validFrom: "2024-01-01",
    status: "active",
    description: "React/Vue.js Frontend Development",
    level: 4,
    unitType: "team",
  },
  {
    id: "O-031-T2",
    code: "O-031-T2",
    name: "Backend Team",
    abbreviation: "BE",
    parentId: "O-031",
    costCenter: "CC-JS-BE",
    validFrom: "2024-01-01",
    status: "active",
    description: "Node.js Backend Development",
    level: 4,
    unitType: "team",
  },
  // AI Department Teams
  {
    id: "O-032-T1",
    code: "O-032-T1",
    name: "ML Team",
    abbreviation: "ML",
    parentId: "O-032",
    costCenter: "CC-AI-ML",
    validFrom: "2024-01-01",
    status: "active",
    description: "Machine Learning and Deep Learning",
    level: 4,
    unitType: "team",
  },
  {
    id: "O-032-T2",
    code: "O-032-T2",
    name: "NLP Team",
    abbreviation: "NLP",
    parentId: "O-032",
    costCenter: "CC-AI-NLP",
    validFrom: "2024-01-01",
    status: "active",
    description: "Natural Language Processing",
    level: 4,
    unitType: "team",
  },
  // Java Department Teams
  {
    id: "O-033-T1",
    code: "O-033-T1",
    name: "Spring Team",
    abbreviation: "SPRING",
    parentId: "O-033",
    costCenter: "CC-JAVA-SPRING",
    validFrom: "2024-01-01",
    status: "active",
    description: "Spring Boot Development",
    level: 4,
    unitType: "team",
  },
  {
    id: "O-033-T2",
    code: "O-033-T2",
    name: "Microservices Team",
    abbreviation: "MICRO",
    parentId: "O-033",
    costCenter: "CC-JAVA-MICRO",
    validFrom: "2024-01-01",
    status: "active",
    description: "Microservices Architecture",
    level: 4,
    unitType: "team",
  },
]

export const jobClassifications: JobClassification[] = [
  {
    id: "C-001",
    code: "C-001",
    title: "Chief Executive Officer",
    jobFamily: "Executive",
    jobLevel: "Executive",
    payGradeGroup: "E1",
    standardHours: 40,
    flsaStatus: "exempt",
    description: "Lead the company's strategic direction and operations",
    requirements: ["MBA or equivalent", "15+ years executive experience", "Strategic leadership"],
    responsibilities: ["Set company vision and strategy", "Lead executive team", "Stakeholder management"],
    competencies: ["Strategic Thinking", "Leadership", "Business Acumen"],
    status: "active",
  },
  {
    id: "C-002",
    code: "C-002",
    title: "Chief Technology Officer",
    jobFamily: "Executive",
    jobLevel: "Executive",
    payGradeGroup: "E2",
    standardHours: 40,
    flsaStatus: "exempt",
    description: "Lead technology strategy and engineering teams",
    requirements: ["CS degree or equivalent", "10+ years tech leadership", "Architecture expertise"],
    responsibilities: ["Technology roadmap", "Engineering culture", "Technical decisions"],
    competencies: ["Technical Leadership", "Innovation", "Team Building"],
    status: "active",
  },
  {
    id: "C-003",
    code: "C-003",
    title: "HR Manager",
    jobFamily: "Human Resources",
    jobLevel: "Manager",
    payGradeGroup: "M1",
    standardHours: 40,
    flsaStatus: "exempt",
    description: "Manage HR operations and employee relations",
    requirements: ["HR degree or certification", "5+ years HR experience", "Employment law knowledge"],
    responsibilities: ["HR policy development", "Employee relations", "Recruitment oversight"],
    competencies: ["People Management", "Communication", "Problem Solving"],
    status: "active",
  },
  {
    id: "C-004",
    code: "C-004",
    title: "HR Specialist",
    jobFamily: "Human Resources",
    jobLevel: "Professional",
    payGradeGroup: "P2",
    standardHours: 40,
    flsaStatus: "non-exempt",
    description: "Support HR operations and employee services",
    requirements: ["HR degree or equivalent", "2+ years HR experience"],
    responsibilities: ["Recruitment support", "Onboarding", "HR administration"],
    competencies: ["Organization", "Communication", "Attention to Detail"],
    status: "active",
  },
  {
    id: "C-010",
    code: "C-010",
    title: "Team Lead (Software)",
    jobFamily: "Engineering Management",
    jobLevel: "Lead",
    payGradeGroup: "M2",
    standardHours: 40,
    flsaStatus: "exempt",
    description: "Lead a software development team",
    requirements: ["5+ years development", "Leadership experience", "Technical expertise"],
    responsibilities: ["Team leadership", "Code review", "Technical guidance", "Sprint planning"],
    competencies: ["Technical Leadership", "Mentoring", "Agile"],
    status: "active",
  },
  {
    id: "C-011",
    code: "C-011",
    title: "Senior Software Engineer",
    jobFamily: "Engineering",
    jobLevel: "Senior",
    payGradeGroup: "S1",
    standardHours: 40,
    flsaStatus: "exempt",
    description: "Design and develop complex software systems",
    requirements: ["5+ years software development", "System design", "Mentoring ability"],
    responsibilities: ["System design", "Code development", "Code review", "Mentor juniors"],
    competencies: ["Technical Excellence", "Problem Solving", "Communication"],
    status: "active",
  },
  {
    id: "C-012",
    code: "C-012",
    title: "Software Engineer",
    jobFamily: "Engineering",
    jobLevel: "Mid-level",
    payGradeGroup: "P3",
    standardHours: 40,
    flsaStatus: "non-exempt",
    description: "Develop and maintain software applications",
    requirements: ["3+ years software development", "Programming proficiency"],
    responsibilities: ["Feature development", "Bug fixes", "Unit testing", "Documentation"],
    competencies: ["Coding Skills", "Problem Solving", "Teamwork"],
    status: "active",
  },
  {
    id: "C-013",
    code: "C-013",
    title: "Junior Software Engineer",
    jobFamily: "Engineering",
    jobLevel: "Junior",
    payGradeGroup: "P4",
    standardHours: 40,
    flsaStatus: "non-exempt",
    description: "Learn and contribute to software development",
    requirements: ["CS degree or bootcamp", "Basic programming knowledge"],
    responsibilities: ["Implement features", "Learn codebase", "Write tests"],
    competencies: ["Learning Agility", "Coding Basics", "Teamwork"],
    status: "active",
  },
  {
    id: "C-014",
    code: "C-014",
    title: "Software Intern",
    jobFamily: "Engineering",
    jobLevel: "Intern",
    payGradeGroup: "I1",
    standardHours: 40,
    flsaStatus: "non-exempt",
    description: "Internship program for software development",
    requirements: ["Currently enrolled in CS program", "Basic programming"],
    responsibilities: ["Assist with development", "Learning projects"],
    competencies: ["Eagerness to Learn", "Basic Programming"],
    status: "active",
  },
  {
    id: "C-020",
    code: "C-020",
    title: "Marketing Specialist",
    jobFamily: "Marketing",
    jobLevel: "Professional",
    payGradeGroup: "P2",
    standardHours: 40,
    flsaStatus: "non-exempt",
    description: "Execute marketing campaigns and brand initiatives",
    requirements: ["Marketing degree", "2+ years marketing experience", "Digital marketing"],
    responsibilities: ["Campaign management", "Content creation", "Analytics"],
    competencies: ["Creativity", "Communication", "Analytics"],
    status: "active",
  },
  {
    id: "C-021",
    code: "C-021",
    title: "Finance Specialist",
    jobFamily: "Finance",
    jobLevel: "Professional",
    payGradeGroup: "P2",
    standardHours: 40,
    flsaStatus: "non-exempt",
    description: "Support financial operations and reporting",
    requirements: ["Finance/Accounting degree", "2+ years experience"],
    responsibilities: ["Financial reporting", "Budget support", "Compliance"],
    competencies: ["Analytical Skills", "Attention to Detail", "Excel"],
    status: "active",
  },
]

export const positions: Position[] = [
  // CEO
  {
    id: "S-001",
    code: "S-001",
    title: "Chief Executive Officer",
    jobClassificationId: "C-001",
    jobClassificationTitle: "Chief Executive Officer",
    organizationalUnitId: "O-001",
    organizationalUnitName: "8sPeople Company",
    costCenter: "CC-ROOT",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-001",
    incumbentName: "Nguyen Van An",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // General Manager
  {
    id: "S-002",
    code: "S-002",
    title: "General Manager",
    jobClassificationId: "C-003",
    jobClassificationTitle: "HR Manager",
    organizationalUnitId: "O-001",
    organizationalUnitName: "8sPeople Company",
    parentPositionId: "S-001",
    parentPositionTitle: "Chief Executive Officer",
    costCenter: "CC-ROOT",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-005",
    incumbentName: "Nguyen Thi Bao",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // CTO
  {
    id: "S-030",
    code: "S-030",
    title: "Chief Technology Officer",
    jobClassificationId: "C-002",
    jobClassificationTitle: "Chief Technology Officer",
    organizationalUnitId: "O-030",
    organizationalUnitName: "Technology Division",
    parentPositionId: "S-001",
    parentPositionTitle: "Chief Executive Officer",
    costCenter: "CC-TECH",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-002",
    incumbentName: "Tran Thi Binh",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Head of HR Department
  {
    id: "S-011",
    code: "S-011",
    title: "Head of HR Department",
    jobClassificationId: "C-003",
    jobClassificationTitle: "HR Manager",
    organizationalUnitId: "O-011",
    organizationalUnitName: "HR Department",
    parentPositionId: "S-002",
    parentPositionTitle: "General Manager",
    costCenter: "CC-HR",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-003",
    incumbentName: "Le Van Cuong",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // HR Specialist
  {
    id: "S-011-01",
    code: "S-011-01",
    title: "HR Specialist #1",
    jobClassificationId: "C-004",
    jobClassificationTitle: "HR Specialist",
    organizationalUnitId: "O-011",
    organizationalUnitName: "HR Department",
    parentPositionId: "S-011",
    parentPositionTitle: "HR Manager",
    costCenter: "CC-HR",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-004",
    incumbentName: "Pham Thi Dung",
    workMode: "onsite",
    officeLocation: "Hanoi HQ",
  },
  // JavaScript Team Lead
  {
    id: "S-031-LEAD",
    code: "S-031-LEAD",
    title: "JavaScript Team Lead",
    jobClassificationId: "C-010",
    jobClassificationTitle: "Team Lead (Software)",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    parentPositionId: "S-030",
    parentPositionTitle: "Chief Technology Officer",
    costCenter: "CC-JS",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-010",
    incumbentName: "Hoang Van Em",
    focusArea: "Full Stack JavaScript",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Senior JS Developers
  {
    id: "S-031-SR-001",
    code: "S-031-SR-001",
    title: "Senior JavaScript Developer #1",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-011",
    incumbentName: "Nguyen Van Phuc",
    focusArea: "React/Next.js",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  {
    id: "S-031-SR-002",
    code: "S-031-SR-002",
    title: "Senior JavaScript Developer #2",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-012",
    incumbentName: "Tran Thi Giang",
    focusArea: "Node.js/Backend",
    workMode: "remote",
    officeLocation: "HCMC Office",
  },
  // Mid-level JS Developer
  {
    id: "S-031-MID-001",
    code: "S-031-MID-001",
    title: "JavaScript Developer #1",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-013",
    incumbentName: "Le Van Hung",
    focusArea: "Full Stack",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Junior JS Developer
  {
    id: "S-031-JR-001",
    code: "S-031-JR-001",
    title: "Junior JavaScript Developer #1",
    jobClassificationId: "C-013",
    jobClassificationTitle: "Junior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-014",
    incumbentName: "Pham Van Khanh",
    focusArea: "Frontend",
    workMode: "onsite",
    officeLocation: "Hanoi HQ",
  },
  // Vacant Position
  {
    id: "S-031-MID-002",
    code: "S-031-MID-002",
    title: "JavaScript Developer #2",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "hiring",
    focusArea: "Backend",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // AI Team Lead
  {
    id: "S-032-LEAD",
    code: "S-032-LEAD",
    title: "AI Team Lead",
    jobClassificationId: "C-010",
    jobClassificationTitle: "Team Lead (Software)",
    organizationalUnitId: "O-032",
    organizationalUnitName: "AI Department",
    parentPositionId: "S-030",
    parentPositionTitle: "Chief Technology Officer",
    costCenter: "CC-AI",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-020",
    incumbentName: "Vo Thi Lan",
    focusArea: "Machine Learning",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Java Team Lead
  {
    id: "S-033-LEAD",
    code: "S-033-LEAD",
    title: "Java Team Lead",
    jobClassificationId: "C-010",
    jobClassificationTitle: "Team Lead (Software)",
    organizationalUnitId: "O-033",
    organizationalUnitName: "Java Department",
    parentPositionId: "S-030",
    parentPositionTitle: "Chief Technology Officer",
    costCenter: "CC-JAVA",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "vacant",
    focusArea: "Enterprise Java",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Frontend Team Positions
  {
    id: "S-031-T1-001",
    code: "S-031-T1-001",
    title: "Senior Frontend Developer",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-031-T1",
    organizationalUnitName: "Frontend Team",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS-FE",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-040",
    incumbentName: "Nguyen Van Quang",
    focusArea: "React/TypeScript",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  {
    id: "S-031-T1-002",
    code: "S-031-T1-002",
    title: "Frontend Developer",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031-T1",
    organizationalUnitName: "Frontend Team",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS-FE",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "vacant",
    focusArea: "Vue.js",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Backend Team Positions
  {
    id: "S-031-T2-001",
    code: "S-031-T2-001",
    title: "Senior Backend Developer",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-031-T2",
    organizationalUnitName: "Backend Team",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS-BE",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-041",
    incumbentName: "Tran Thi Rong",
    focusArea: "Node.js/Express",
    workMode: "remote",
    officeLocation: "HCMC Office",
  },
  {
    id: "S-031-T2-002",
    code: "S-031-T2-002",
    title: "Backend Developer",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031-T2",
    organizationalUnitName: "Backend Team",
    parentPositionId: "S-031-LEAD",
    parentPositionTitle: "JavaScript Team Lead",
    costCenter: "CC-JS-BE",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "hiring",
    focusArea: "NestJS/GraphQL",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // ML Team Positions
  {
    id: "S-032-T1-001",
    code: "S-032-T1-001",
    title: "Senior ML Engineer",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-032-T1",
    organizationalUnitName: "ML Team",
    parentPositionId: "S-032-LEAD",
    parentPositionTitle: "AI Team Lead",
    costCenter: "CC-AI-ML",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-050",
    incumbentName: "Le Van Son",
    focusArea: "Deep Learning",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  {
    id: "S-032-T1-002",
    code: "S-032-T1-002",
    title: "ML Engineer",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-032-T1",
    organizationalUnitName: "ML Team",
    parentPositionId: "S-032-LEAD",
    parentPositionTitle: "AI Team Lead",
    costCenter: "CC-AI-ML",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "vacant",
    focusArea: "Computer Vision",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // NLP Team Positions
  {
    id: "S-032-T2-001",
    code: "S-032-T2-001",
    title: "Senior NLP Engineer",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-032-T2",
    organizationalUnitName: "NLP Team",
    parentPositionId: "S-032-LEAD",
    parentPositionTitle: "AI Team Lead",
    costCenter: "CC-AI-NLP",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-051",
    incumbentName: "Pham Thi Thao",
    focusArea: "Transformers/LLMs",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Spring Team Positions
  {
    id: "S-033-T1-001",
    code: "S-033-T1-001",
    title: "Senior Java Developer",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-033-T1",
    organizationalUnitName: "Spring Team",
    parentPositionId: "S-033-LEAD",
    parentPositionTitle: "Java Team Lead",
    costCenter: "CC-JAVA-SPRING",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "vacant",
    focusArea: "Spring Boot",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  {
    id: "S-033-T1-002",
    code: "S-033-T1-002",
    title: "Java Developer",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-033-T1",
    organizationalUnitName: "Spring Team",
    parentPositionId: "S-033-LEAD",
    parentPositionTitle: "Java Team Lead",
    costCenter: "CC-JAVA-SPRING",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "hiring",
    focusArea: "Spring Cloud",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Microservices Team Positions
  {
    id: "S-033-T2-001",
    code: "S-033-T2-001",
    title: "Senior Microservices Architect",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-033-T2",
    organizationalUnitName: "Microservices Team",
    parentPositionId: "S-033-LEAD",
    parentPositionTitle: "Java Team Lead",
    costCenter: "CC-JAVA-MICRO",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "vacant",
    focusArea: "Microservices/Kubernetes",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Marketing Specialist
  {
    id: "S-021-01",
    code: "S-021-01",
    title: "Marketing Specialist #1",
    jobClassificationId: "C-020",
    jobClassificationTitle: "Marketing Specialist",
    organizationalUnitId: "O-021",
    organizationalUnitName: "Marketing Department",
    parentPositionId: "S-001",
    parentPositionTitle: "Chief Executive Officer",
    costCenter: "CC-MKT",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-030",
    incumbentName: "Nguyen Thi Mai",
    workMode: "hybrid",
    officeLocation: "Hanoi HQ",
  },
  // Finance Specialist
  {
    id: "S-012-01",
    code: "S-012-01",
    title: "Finance Specialist #1",
    jobClassificationId: "C-021",
    jobClassificationTitle: "Finance Specialist",
    organizationalUnitId: "O-012",
    organizationalUnitName: "Finance Department",
    parentPositionId: "S-001",
    parentPositionTitle: "Chief Executive Officer",
    costCenter: "CC-FIN",
    fte: 1.0,
    validFrom: "2024-01-01",
    status: "active",
    hiringStatus: "filled",
    incumbentId: "P-031",
    incumbentName: "Tran Van Nam",
    workMode: "onsite",
    officeLocation: "Hanoi HQ",
  },
]

export const employees: Employee[] = [
  {
    id: "P-001",
    code: "P-001",
    fullName: "Nguyen Van An",
    firstName: "An",
    lastName: "Nguyen Van",
    personalEmail: "an.nguyen@gmail.com",
    companyEmail: "an.nguyen@8speople.com",
    positionId: "S-001",
    positionCode: "S-001",
    positionTitle: "Chief Executive Officer",
    jobClassificationId: "C-001",
    jobClassificationTitle: "Chief Executive Officer",
    organizationalUnitId: "O-001",
    organizationalUnitName: "8sPeople Company",
    costCenter: "CC-ROOT",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2020-01-01",
    companyJoinDate: "2020-01-01",
    officialStartDate: "2020-01-01",
    fte: 1.0,
    cellphone: "+84 901 234 001",
    dateOfBirth: "1975-03-15",
    gender: "male",
    directReportIds: ["P-002", "P-003", "P-030", "P-031"],
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    contracts: [
      {
        id: "ct-001-1", // Added id
        contractNumber: "CT-2020-001",
        contractType: "Official",
        startDate: "2020-01-01",
        endDate: "2025-12-31",
        status: "active",
        signDate: "2020-01-01",
        status: "active",
        status: "terminated",
      },
      {
        id: "ct-001-2", // Added id
        contractNumber: "CT-2025-002",
        contractType: "Contract Extension",
        startDate: "2026-01-01",
        endDate: "2029-12-31",
        status: "active",
        signDate: "2025-12-15",
        status: "active",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-001-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2020-01-01",
        createdAt: "2020-01-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-001-1", // Linked to the contract
        contractNumber: "CT-2020-001",
        contractType: "Official",
        contractStartDate: "2020-01-01",
        contractEndDate: "2025-12-31",
        signDate: "2020-01-01",
        positionId: "S-001",
        positionTitle: "Chief Executive Officer",
        organizationalUnitId: "O-001",
        organizationalUnitName: "8sPeople Company",
        jobClassificationId: "C-001",
        jobClassificationTitle: "Chief Executive Officer",
      },
      {
        id: "tx-001-2",
        action: "contract_renewal",
        reason: "New Contract",
        text: "Contract Renewal: New Contract",
        effectiveDate: "2026-01-01",
        createdAt: "2025-12-15T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-001-2", // Linked to the new contract
        contractNumber: "CT-2025-002",
        contractType: "Contract Extension",
        contractStartDate: "2026-01-01",
        contractEndDate: "2029-12-31",
        signDate: "2025-12-15",
        positionId: "S-001",
        positionTitle: "Chief Executive Officer",
        organizationalUnitId: "O-001",
        organizationalUnitName: "8sPeople Company",
        jobClassificationId: "C-001",
        jobClassificationTitle: "Chief Executive Officer",
      },
    ],
    dependents: [
      {
        id: "dep-001-1",
        fullName: "Nguyen Thi Lan",
        relationship: "Spouse",
        dateOfBirth: "1977-05-20",
        effectiveDate: "2020-01-01",
        nationalIdNumber: "012345678901",
        notes: "Wife, benefits since official employment",
      },
      {
        id: "dep-001-2",
        fullName: "Nguyen Minh Duc",
        relationship: "Child",
        dateOfBirth: "2010-08-10",
        effectiveDate: "2010-08-10",
        nationalIdNumber: "012345678902",
        notes: "Son, dependent for tax purposes",
      },
      {
        id: "dep-001-3",
        fullName: "Nguyen Minh Hoa",
        relationship: "Child",
        dateOfBirth: "2013-12-05",
        effectiveDate: "2013-12-05",
        nationalIdNumber: "012345678903",
        notes: "Daughter, dependent for tax purposes",
      },
    ],
  },
  {
    id: "P-002",
    code: "P-002",
    fullName: "Tran Thi Binh",
    firstName: "Binh",
    lastName: "Tran Thi",
    personalEmail: "binh.tran@gmail.com",
    companyEmail: "binh.tran@8speople.com",
    positionId: "S-030",
    positionCode: "S-030",
    positionTitle: "Chief Technology Officer",
    jobClassificationId: "C-002",
    jobClassificationTitle: "Chief Technology Officer",
    organizationalUnitId: "O-030",
    organizationalUnitName: "Technology Division",
    lineManagerId: "P-001",
    lineManagerName: "Nguyen Van An",
    costCenter: "CC-TECH",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2021-01-15",
    companyJoinDate: "2021-01-15",
    officialStartDate: "2021-01-15",
    fte: 1.0,
    cellphone: "+84 901 234 002",
    dateOfBirth: "1980-06-20",
    gender: "female",
    directReportIds: ["P-010", "P-011", "P-012", "P-013", "P-014", "P-020", "P-033-LEAD"],
    workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    contracts: [
      {
        id: "ct-002-1", // Added id
        contractNumber: "CT-2021-001",
        contractType: "Official",
        startDate: "2021-01-15",
        endDate: "2024-01-14",
        status: "active",
        signDate: "2021-01-15",
        status: "active",
        status: "terminated",
      },
      {
        id: "ct-002-2", // Added id
        contractNumber: "CT-2024-002",
        contractType: "Contract Renewal",
        startDate: "2024-01-15",
        endDate: "2027-01-14",
        status: "active",
        signDate: "2024-01-01",
        status: "active",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-002-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2021-01-15",
        createdAt: "2021-01-15T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-002-1", // Linked to the contract
        contractNumber: "CT-2021-001",
        contractType: "Official",
        contractStartDate: "2021-01-15",
        contractEndDate: "2024-01-14",
        signDate: "2021-01-15",
        positionId: "S-030",
        positionTitle: "Chief Technology Officer",
        organizationalUnitId: "O-030",
        organizationalUnitName: "Technology Division",
        jobClassificationId: "C-002",
        jobClassificationTitle: "Chief Technology Officer",
      },
      {
        id: "tx-002-2",
        action: "contract_renewal",
        reason: "New Contract",
        text: "Contract Renewal: New Contract",
        effectiveDate: "2024-01-15",
        createdAt: "2024-01-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-002-2", // Linked to the new contract
        contractNumber: "CT-2024-002",
        contractType: "Contract Renewal",
        contractStartDate: "2024-01-15",
        contractEndDate: "2027-01-14",
        signDate: "2024-01-01",
        positionId: "S-030",
        positionTitle: "Chief Technology Officer",
        organizationalUnitId: "O-030",
        organizationalUnitName: "Technology Division",
        jobClassificationId: "C-002",
        jobClassificationTitle: "Chief Technology Officer",
      },
    ],
    dependents: [
      {
        id: "dep-002-1",
        fullName: "Tran Thanh Tung",
        relationship: "Spouse",
        dateOfBirth: "1982-09-15",
        effectiveDate: "2021-01-15",
        nationalIdNumber: "123456789012",
        notes: "Husband, benefits since 2021",
      },
      {
        id: "dep-002-2",
        fullName: "Tran Minh Khoa",
        relationship: "Child",
        dateOfBirth: "2012-03-22",
        effectiveDate: "2012-03-22",
        nationalIdNumber: "123456789013",
        notes: "Son, dependent for tax purposes",
      },
    ],
  },
  {
    id: "P-003",
    code: "P-003",
    fullName: "Le Van Cuong",
    firstName: "Cuong",
    lastName: "Le Van",
    personalEmail: "cuong.le@gmail.com",
    companyEmail: "cuong.le@8speople.com",
    positionId: "S-011",
    positionCode: "S-011",
    positionTitle: "HR Manager",
    jobClassificationId: "C-003",
    jobClassificationTitle: "HR Manager",
    organizationalUnitId: "O-011",
    organizationalUnitName: "HR Department",
    lineManagerId: "P-001",
    lineManagerName: "Nguyen Van An",
    costCenter: "CC-HR",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2021-03-01",
    companyJoinDate: "2021-03-01",
    officialStartDate: "2021-03-01",
    fte: 1.0,
    cellphone: "+84 901 234 003",
    dateOfBirth: "1985-09-10",
    gender: "male",
    directReportIds: ["P-004", "P-005"],
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    contracts: [
      {
        id: "ct-003-1", // Added id
        contractNumber: "CT-2021-002",
        contractType: "Official",
        startDate: "2021-03-01",
        endDate: "2024-02-29",
        status: "active",
        signDate: "2021-03-01",
        status: "active",
      },
      {
        id: "ct-003-2", // Added id
        contractNumber: "CT-2024-003",
        contractType: "Contract Extension",
        startDate: "2024-03-01",
        endDate: "2027-02-28",
        status: "active",
        signDate: "2024-02-20",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-003-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2021-03-01",
        createdAt: "2021-03-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-003-1", // Linked to the contract
        contractNumber: "CT-2021-002",
        contractType: "Official",
        contractStartDate: "2021-03-01",
        contractEndDate: "2024-02-29",
        signDate: "2021-03-01",
        positionId: "S-011",
        positionTitle: "HR Manager",
        organizationalUnitId: "O-011",
        organizationalUnitName: "HR Department",
        jobClassificationId: "C-003",
        jobClassificationTitle: "HR Manager",
      },
      {
        id: "tx-003-2",
        action: "contract_renewal",
        reason: "New Contract",
        text: "Contract Renewal: New Contract",
        effectiveDate: "2024-03-01",
        createdAt: "2024-02-20T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-003-2", // Linked to the new contract
        contractNumber: "CT-2024-003",
        contractType: "Contract Extension",
        contractStartDate: "2024-03-01",
        contractEndDate: "2027-02-28",
        signDate: "2024-02-20",
        positionId: "S-011",
        positionTitle: "HR Manager",
        organizationalUnitId: "O-011",
        organizationalUnitName: "HR Department",
        jobClassificationId: "C-003",
        jobClassificationTitle: "HR Manager",
      },
    ],
  },
  {
    id: "P-004",
    code: "P-004",
    fullName: "Pham Thi Dung",
    firstName: "Dung",
    lastName: "Pham Thi",
    personalEmail: "dung.pham@gmail.com",
    companyEmail: "dung.pham@8speople.com",
    positionId: "S-011-01",
    positionCode: "S-011-01",
    positionTitle: "HR Specialist #1",
    jobClassificationId: "C-004",
    jobClassificationTitle: "HR Specialist",
    organizationalUnitId: "O-011",
    organizationalUnitName: "HR Department",
    lineManagerId: "P-003",
    lineManagerName: "Le Van Cuong",
    costCenter: "CC-HR",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2022-01-10",
    companyJoinDate: "2022-01-10",
    officialStartDate: "2022-04-10",
    fte: 1.0,
    cellphone: "+84 901 234 004",
    dateOfBirth: "1990-12-05",
    gender: "female",
    contracts: [
      {
        id: "ct-004-1", // Added id
        contractNumber: "CT-2022-005",
        contractType: "Probation",
        startDate: "2022-01-10",
        endDate: "2022-04-09",
        status: "active",
        signDate: "2022-01-10",
        status: "active",
      },
      {
        id: "ct-004-2", // Added id
        contractNumber: "CT-2022-006",
        contractType: "Official",
        startDate: "2022-04-10",
        endDate: "2025-04-09",
        status: "active",
        signDate: "2022-04-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-004-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2022-01-10",
        createdAt: "2022-01-10T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-004-1", // Linked to the contract
        contractNumber: "CT-2022-005",
        contractType: "Probation",
        contractStartDate: "2022-01-10",
        contractEndDate: "2022-04-09",
        signDate: "2022-01-10",
        positionId: "S-011-01",
        positionTitle: "HR Specialist #1",
        organizationalUnitId: "O-011",
        organizationalUnitName: "HR Department",
        jobClassificationId: "C-004",
        jobClassificationTitle: "HR Specialist",
      },
      {
        id: "tx-004-2",
        action: "probation_confirmation",
        reason: "Probation Completion",
        text: "Probation Confirmation: Probation Completion",
        effectiveDate: "2022-04-10",
        createdAt: "2022-04-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-004-2", // Linked to the contract
        contractNumber: "CT-2022-006",
        contractType: "Official",
        contractStartDate: "2022-04-10",
        contractEndDate: "2025-04-09",
        signDate: "2022-04-01",
        positionId: "S-011-01",
        positionTitle: "HR Specialist #1",
        organizationalUnitId: "O-011",
        organizationalUnitName: "HR Department",
        jobClassificationId: "C-004",
        jobClassificationTitle: "HR Specialist",
      },
    ],
  },
  {
    id: "P-010",
    code: "P-010",
    fullName: "Hoang Van Em",
    firstName: "Em",
    lastName: "Hoang Van",
    personalEmail: "em.hoang@gmail.com",
    companyEmail: "em.hoang@8speople.com",
    positionId: "S-031-LEAD",
    positionCode: "S-031-LEAD",
    positionTitle: "JavaScript Team Lead",
    jobClassificationId: "C-010",
    jobClassificationTitle: "Team Lead (Software)",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-002",
    lineManagerName: "Tran Thi Binh",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2022-02-01",
    companyJoinDate: "2021-06-01",
    officialStartDate: "2022-02-01",
    fte: 1.0,
    cellphone: "+84 901 234 010",
    dateOfBirth: "1988-04-15",
    gender: "male",
    directReportIds: ["P-011", "P-012", "P-013", "P-014"],
    contracts: [
      {
        id: "ct-010-1", // Added id
        contractNumber: "CT-2021-003",
        contractType: "Junior Engineer",
        startDate: "2021-06-01",
        endDate: "2022-01-31",
        status: "active",
        signDate: "2021-06-01",
        status: "active",
      },
      {
        id: "ct-010-2", // Added id
        contractNumber: "CT-2022-007",
        contractType: "Mid-Level Engineer",
        startDate: "2022-02-01",
        endDate: "2023-12-31",
        status: "active",
        signDate: "2022-02-01",
        status: "active",
      },
      {
        id: "ct-010-3", // Added id
        contractNumber: "CT-2024-004",
        contractType: "Promotion to Team Lead",
        startDate: "2024-01-01",
        endDate: "2027-01-01",
        status: "active",
        signDate: "2024-01-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-010-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2021-06-01",
        createdAt: "2021-06-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-010-1", // Linked to the contract
        contractNumber: "CT-2021-003",
        contractType: "Junior Engineer",
        contractStartDate: "2021-06-01",
        contractEndDate: "2022-01-31",
        signDate: "2021-06-01",
        positionId: "S-031-MID-001",
        positionTitle: "JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-012",
        jobClassificationTitle: "Software Engineer",
      },
      {
        id: "tx-010-2",
        action: "promotion",
        reason: "Organizational Requirement",
        text: "Promotion: Organizational Requirement",
        effectiveDate: "2024-01-01",
        createdAt: "2024-01-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-010-3", // Linked to the contract
        contractNumber: "CT-2024-004",
        contractType: "Promotion to Team Lead",
        contractStartDate: "2024-01-01",
        contractEndDate: "2027-01-01",
        signDate: "2024-01-01",
        positionId: "S-031-LEAD",
        positionTitle: "JavaScript Team Lead",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-010",
        jobClassificationTitle: "Team Lead (Software)",
      },
    ],
  },
  {
    id: "P-011",
    code: "P-011",
    fullName: "Nguyen Van Phuc",
    firstName: "Phuc",
    lastName: "Nguyen Van",
    personalEmail: "phuc.nguyen@gmail.com",
    companyEmail: "phuc.nguyen@8speople.com",
    positionId: "S-031-SR-001",
    positionCode: "S-031-SR-001",
    positionTitle: "Senior JavaScript Developer #1",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2022-03-15",
    companyJoinDate: "2022-01-15",
    officialStartDate: "2022-06-15",
    fte: 1.0,
    cellphone: "+84 901 234 011",
    dateOfBirth: "1990-07-20",
    gender: "male",
    contracts: [
      {
        id: "ct-011-1", // Added id
        contractNumber: "CT-2022-001",
        contractType: "Intern",
        startDate: "2022-01-15",
        endDate: "2022-03-14",
        status: "active",
        signDate: "2022-01-15",
        status: "active",
      },
      {
        id: "ct-011-2", // Added id
        contractNumber: "CT-2022-002",
        contractType: "Probation",
        startDate: "2022-03-15",
        endDate: "2022-06-14",
        status: "active",
        signDate: "2022-03-15",
        status: "active",
      },
      {
        id: "ct-011-3", // Added id
        contractNumber: "CT-2022-003",
        contractType: "Official",
        startDate: "2022-06-15",
        endDate: "2025-06-14",
        status: "active",
        signDate: "2022-06-10",
        status: "active",
      },
      {
        id: "ct-011-4", // Added id
        contractNumber: "CT-2025-001",
        contractType: "Salary Increase",
        startDate: "2025-01-01",
        endDate: "2028-01-01",
        status: "active",
        signDate: "2024-12-20",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-011-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2022-01-15",
        createdAt: "2022-01-15T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-011-1", // Linked to the contract
        contractNumber: "CT-2022-001",
        contractType: "Intern",
        contractStartDate: "2022-01-15",
        contractEndDate: "2022-03-14",
        signDate: "2022-01-15",
        positionId: "S-031-JR-001",
        positionTitle: "Junior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-013",
        jobClassificationTitle: "Junior Software Engineer",
      },
      {
        id: "tx-011-2",
        action: "probation_confirmation",
        reason: "Probation Completion",
        text: "Probation Confirmation: Probation Completion",
        effectiveDate: "2022-06-15",
        createdAt: "2022-06-10T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-011-3", // Linked to the contract
        contractNumber: "CT-2022-003",
        contractType: "Official",
        contractStartDate: "2022-06-15",
        contractEndDate: "2025-06-14",
        signDate: "2022-06-10",
        positionId: "S-031-SR-001",
        positionTitle: "Senior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-011",
        jobClassificationTitle: "Senior Software Engineer",
      },
      {
        id: "tx-011-3",
        action: "salary_change",
        reason: "Annual Appraisal",
        text: "Salary Change: Annual Appraisal",
        effectiveDate: "2025-01-01",
        createdAt: "2024-12-20T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-011-4", // Linked to the contract
        salaryChange: { oldSalary: 32000000, newSalary: 35000000, currency: "VND" },
        positionId: "S-031-SR-001",
        positionTitle: "Senior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-011",
        jobClassificationTitle: "Senior Software Engineer",
      },
    ],
  },
  {
    id: "P-012",
    code: "P-012",
    fullName: "Tran Thi Giang",
    firstName: "Giang",
    lastName: "Tran Thi",
    personalEmail: "giang.tran@gmail.com",
    companyEmail: "giang.tran@8speople.com",
    positionId: "S-031-SR-002",
    positionCode: "S-031-SR-002",
    positionTitle: "Senior JavaScript Developer #2",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2022-04-01",
    companyJoinDate: "2022-04-01",
    officialStartDate: "2022-04-01",
    fte: 1.0,
    cellphone: "+84 901 234 012",
    dateOfBirth: "1991-11-30",
    gender: "female",
    contracts: [
      {
        id: "ct-012-1", // Added id
        contractNumber: "CT-2022-004",
        contractType: "Official",
        startDate: "2022-04-01",
        endDate: "2025-03-31",
        status: "active",
        signDate: "2022-04-01",
        status: "active",
      },
      {
        id: "ct-012-2", // Added id
        contractNumber: "CT-2024-001",
        contractType: "Promotion",
        startDate: "2024-06-01",
        endDate: "2027-06-01",
        status: "active",
        signDate: "2024-05-25",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-012-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2022-04-01",
        createdAt: "2022-04-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-012-1", // Linked to the contract
        contractNumber: "CT-2022-004",
        contractType: "Official",
        contractStartDate: "2022-04-01",
        contractEndDate: "2025-03-31",
        signDate: "2022-04-01",
        positionId: "S-031-SR-002",
        positionTitle: "Senior JavaScript Developer #2",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-011",
        jobClassificationTitle: "Senior Software Engineer",
      },
      {
        id: "tx-012-2",
        action: "promotion",
        reason: "Performance",
        text: "Promotion: Performance",
        effectiveDate: "2024-06-01",
        createdAt: "2024-05-25T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-012-2", // Linked to the contract
        contractNumber: "CT-2024-001",
        contractType: "Promotion",
        contractStartDate: "2024-06-01",
        contractEndDate: "2027-06-01",
        signDate: "2024-05-25",
        positionId: "S-031-SR-002",
        positionTitle: "Senior JavaScript Developer #2",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-011",
        jobClassificationTitle: "Senior Software Engineer",
      },
    ],
  },
  {
    id: "P-013",
    code: "P-013",
    fullName: "Le Van Hung",
    firstName: "Hung",
    lastName: "Le Van",
    personalEmail: "hung.le@gmail.com",
    companyEmail: "hung.le@8speople.com",
    positionId: "S-031-MID-001",
    positionCode: "S-031-MID-001",
    positionTitle: "JavaScript Developer #1",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2023-01-10",
    companyJoinDate: "2023-01-10",
    officialStartDate: "2024-01-01",
    fte: 1.0,
    cellphone: "+84 901 234 013",
    dateOfBirth: "1993-02-14",
    gender: "male",
    contracts: [
      {
        id: "ct-013-1", // Added id
        contractNumber: "CT-2023-001",
        contractType: "Junior Engineer",
        startDate: "2023-01-20",
        endDate: "2023-12-31",
        status: "active",
        signDate: "2023-01-20",
        status: "active",
      },
      {
        id: "ct-013-2", // Added id
        contractNumber: "CT-2024-005",
        contractType: "Mid-Level Engineer",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        status: "active",
        signDate: "2024-01-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-013-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2023-01-20",
        createdAt: "2023-01-20T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-013-1", // Linked to the contract
        contractNumber: "CT-2023-001",
        contractType: "Junior Engineer",
        contractStartDate: "2023-01-20",
        contractEndDate: "2023-12-31",
        signDate: "2023-01-20",
        positionId: "S-031-MID-001",
        positionTitle: "JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-012",
        jobClassificationTitle: "Software Engineer",
      },
      {
        id: "tx-013-2",
        action: "promotion",
        reason: "Performance",
        text: "Promotion: Performance",
        effectiveDate: "2024-01-01",
        createdAt: "2024-01-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-013-2", // Linked to the contract
        contractNumber: "CT-2024-005",
        contractType: "Mid-Level Engineer",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-12-31",
        signDate: "2024-01-01",
        positionId: "S-031-MID-001",
        positionTitle: "JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-012",
        jobClassificationTitle: "Software Engineer",
      },
    ],
  },
  {
    id: "P-014",
    code: "P-014",
    fullName: "Pham Van Khanh",
    firstName: "Khanh",
    lastName: "Pham Van",
    personalEmail: "khanh.pham@gmail.com",
    companyEmail: "khanh.pham@8speople.com",
    positionId: "S-031-JR-001",
    positionCode: "S-031-JR-001",
    positionTitle: "Junior JavaScript Developer #1",
    jobClassificationId: "C-013",
    jobClassificationTitle: "Junior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2024-01-02",
    companyJoinDate: "2023-07-01",
    officialStartDate: "2024-01-02",
    fte: 1.0,
    cellphone: "+84 901 234 014",
    dateOfBirth: "1998-08-25",
    gender: "male",
    contracts: [
      {
        id: "ct-014-1", // Added id
        contractNumber: "CT-2024-006",
        contractType: "Intern",
        startDate: "2023-07-01",
        endDate: "2023-12-31",
        status: "active",
        signDate: "2023-07-01",
        status: "active",
      },
      {
        id: "ct-014-2", // Added id
        contractNumber: "CT-2024-007",
        contractType: "Junior Engineer",
        startDate: "2024-01-02",
        endDate: "2025-01-01",
        status: "active",
        signDate: "2024-01-02",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-014-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2023-07-01",
        createdAt: "2023-07-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-014-1", // Linked to the contract
        contractNumber: "CT-2024-006",
        contractType: "Intern",
        contractStartDate: "2023-07-01",
        contractEndDate: "2023-12-31",
        signDate: "2023-07-01",
        positionId: "S-031-JR-001",
        positionTitle: "Junior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-013",
        jobClassificationTitle: "Junior Software Engineer",
      },
      {
        id: "tx-014-2",
        action: "probation_confirmation", // This should likely be "contract_update" or similar if it's not a promotion
        reason: "Probation Completion",
        text: "Probation Confirmation: Probation Completion",
        effectiveDate: "2024-01-02",
        createdAt: "2024-01-02T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-014-2", // Linked to the contract
        contractNumber: "CT-2024-007",
        contractType: "Junior Engineer",
        contractStartDate: "2024-01-02",
        contractEndDate: "2025-01-01",
        signDate: "2024-01-02",
        positionId: "S-031-JR-001",
        positionTitle: "Junior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-013",
        jobClassificationTitle: "Junior Software Engineer",
      },
    ],
  },
  {
    id: "P-020",
    code: "P-020",
    fullName: "Vo Thi Lan",
    firstName: "Lan",
    lastName: "Vo Thi",
    personalEmail: "lan.vo@gmail.com",
    companyEmail: "lan.vo@8speople.com",
    positionId: "S-032-LEAD",
    positionCode: "S-032-LEAD",
    positionTitle: "AI Team Lead",
    jobClassificationId: "C-010",
    jobClassificationTitle: "Team Lead (Software)",
    organizationalUnitId: "O-032",
    organizationalUnitName: "AI Department",
    lineManagerId: "P-002",
    lineManagerName: "Tran Thi Binh",
    costCenter: "CC-AI",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2022-06-01",
    companyJoinDate: "2022-06-01",
    officialStartDate: "2022-06-01",
    fte: 1.0,
    cellphone: "+84 901 234 020",
    dateOfBirth: "1987-05-18",
    gender: "female",
    directReportIds: [],
    contracts: [
      {
        id: "ct-020-1", // Added id
        contractNumber: "CT-2022-008",
        contractType: "Official",
        startDate: "2022-06-01",
        endDate: "2025-05-31",
        status: "active",
        signDate: "2022-06-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-020-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2022-06-01",
        createdAt: "2022-06-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-020-1", // Linked to the contract
        contractNumber: "CT-2022-008",
        contractType: "Official",
        contractStartDate: "2022-06-01",
        contractEndDate: "2025-05-31",
        signDate: "2022-06-01",
        positionId: "S-032-LEAD",
        positionTitle: "AI Team Lead",
        organizationalUnitId: "O-032",
        organizationalUnitName: "AI Department",
        jobClassificationId: "C-010",
        jobClassificationTitle: "Team Lead (Software)",
      },
    ],
  },
  {
    id: "P-030",
    code: "P-030",
    fullName: "Nguyen Thi Mai",
    firstName: "Mai",
    lastName: "Nguyen Thi",
    personalEmail: "mai.nguyen@gmail.com",
    companyEmail: "mai.nguyen@8speople.com",
    positionId: "S-021-01",
    positionCode: "S-021-01",
    positionTitle: "Marketing Specialist #1",
    jobClassificationId: "C-020",
    jobClassificationTitle: "Marketing Specialist",
    organizationalUnitId: "O-021",
    organizationalUnitName: "Marketing Department",
    lineManagerId: "P-001",
    lineManagerName: "Nguyen Van An",
    costCenter: "CC-MKT",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2023-03-01",
    companyJoinDate: "2023-03-01",
    officialStartDate: "2023-03-01",
    fte: 1.0,
    cellphone: "+84 901 234 030",
    dateOfBirth: "1992-10-12",
    gender: "female",
    contracts: [
      {
        id: "ct-030-1", // Added id
        contractNumber: "CT-2023-002",
        contractType: "Official",
        startDate: "2023-03-01",
        endDate: "2026-02-28",
        status: "active",
        signDate: "2023-03-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-030-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2023-03-01",
        createdAt: "2023-03-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-030-1", // Linked to the contract
        contractNumber: "CT-2023-002",
        contractType: "Official",
        contractStartDate: "2023-03-01",
        contractEndDate: "2026-02-28",
        signDate: "2023-03-01",
        positionId: "S-021-01",
        positionTitle: "Marketing Specialist #1",
        organizationalUnitId: "O-021",
        organizationalUnitName: "Marketing Department",
        jobClassificationId: "C-020",
        jobClassificationTitle: "Marketing Specialist",
      },
    ],
  },
  {
    id: "P-031",
    code: "P-031",
    fullName: "Tran Van Nam",
    firstName: "Nam",
    lastName: "Tran Van",
    personalEmail: "nam.tran@gmail.com",
    companyEmail: "nam.tran@8speople.com",
    positionId: "S-012-01",
    positionCode: "S-012-01",
    positionTitle: "Finance Specialist #1",
    jobClassificationId: "C-021",
    jobClassificationTitle: "Finance Specialist",
    organizationalUnitId: "O-012",
    organizationalUnitName: "Finance Department",
    lineManagerId: "P-001",
    lineManagerName: "Nguyen Van An",
    costCenter: "CC-FIN",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2023-04-15",
    companyJoinDate: "2023-04-15",
    officialStartDate: "2023-04-15",
    fte: 1.0,
    cellphone: "+84 901 234 031",
    dateOfBirth: "1989-01-28",
    gender: "male",
    contracts: [
      {
        id: "ct-031-1", // Added id
        contractNumber: "CT-2023-003",
        contractType: "Official",
        startDate: "2023-04-15",
        endDate: "2026-04-14",
        status: "active",
        signDate: "2023-04-15",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-031-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2023-04-15",
        createdAt: "2023-04-15T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-031-1", // Linked to the contract
        contractNumber: "CT-2023-003",
        contractType: "Official",
        contractStartDate: "2023-04-15",
        contractEndDate: "2026-04-14",
        signDate: "2023-04-15",
        positionId: "S-012-01",
        positionTitle: "Finance Specialist #1",
        organizationalUnitId: "O-012",
        organizationalUnitName: "Finance Department",
        jobClassificationId: "C-021",
        jobClassificationTitle: "Finance Specialist",
      },
    ],
  },
  {
    id: "P-050",
    code: "P-050",
    fullName: "Tran Van Minh",
    firstName: "Minh",
    lastName: "Tran Van",
    personalEmail: "minh.tran@gmail.com",
    companyEmail: "minh.tran@8speople.com",
    positionId: "",
    positionCode: "",
    positionTitle: "Former Software Engineer",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    costCenter: "CC-JS",
    status: "resigned",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2021-06-01",
    companyJoinDate: "2021-06-01",
    officialStartDate: "2021-09-01",
    fte: 0,
    cellphone: "+84 901 234 050",
    dateOfBirth: "1992-03-20",
    gender: "male",
    contracts: [
      {
        id: "ct-050-1", // Added id
        contractNumber: "CT-2021-050",
        contractType: "Probation",
        startDate: "2021-06-01",
        endDate: "2021-08-31",
        status: "active",
        signDate: "2021-06-01",
        status: "active",
      },
      {
        id: "ct-050-2", // Added id
        contractNumber: "CT-2021-051",
        contractType: "Official",
        startDate: "2021-09-01",
        endDate: "2024-08-31",
        status: "active",
        signDate: "2021-09-01",
        status: "active",
      },
      {
        id: "ct-term-2025-001", // Added id
        contractNumber: "CT-TERM-2025-001",
        contractType: "Termination",
        startDate: "2025-01-15",
        endDate: "2025-01-15",
        status: "active",
        signDate: "2025-01-10",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-050-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2021-06-01",
        createdAt: "2021-06-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-050-1", // Linked to the contract
        contractNumber: "CT-2021-050",
        contractType: "Probation",
        contractStartDate: "2021-06-01",
        contractEndDate: "2021-08-31",
        signDate: "2021-06-01",
        positionId: "S-031-MID-001",
        positionTitle: "JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-012",
        jobClassificationTitle: "Software Engineer",
      },
      {
        id: "tx-050-2",
        action: "resignation",
        reason: "Voluntary",
        subReason: "Career Development",
        text: "Resignation: Voluntary - Career Development",
        effectiveDate: "2025-01-15",
        createdAt: "2025-01-10T09:00:00Z",
        createdBy: "admin",
        notes: "Employee is leaving to pursue new career opportunities.",
      },
    ],
    resignationInfo: {
      resignationAction: "Voluntary",
      resignationReason: "Career Development",
      lastWorkingDate: "2025-01-15",
      exitInterviewCompleted: true,
      assetsReturned: true,
      rehireEligible: true,
    },
  },
  {
    id: "P-051",
    code: "P-051",
    fullName: "Le Thi Hoa",
    firstName: "Hoa",
    lastName: "Le Thi",
    personalEmail: "hoa.le@gmail.com",
    companyEmail: "hoa.le@8speople.com",
    positionId: "S-031-MID-002",
    positionCode: "S-031-MID-002",
    positionTitle: "JavaScript Developer #2",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "future",
    onboardingStatus: { emailSent: true, accountActivated: false, profileCompleted: false },
    startDate: "2026-02-01",
    companyJoinDate: "2026-02-01",
    officialStartDate: "2026-02-01",
    fte: 1.0,
    cellphone: "+84 901 234 051",
    dateOfBirth: "1995-07-10",
    gender: "female",
    contracts: [
      {
        id: "ct-051-1", // Added id
        contractNumber: "CT-2026-001",
        contractType: "Official",
        startDate: "2026-02-01",
        endDate: "2029-01-31",
        status: "active",
        signDate: "2026-01-20",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-051-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2026-02-01",
        createdAt: "2026-01-20T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-051-1", // Linked to the contract
        contractNumber: "CT-2026-001",
        contractType: "Official",
        contractStartDate: "2026-02-01",
        contractEndDate: "2029-01-31",
        signDate: "2026-01-20",
        positionId: "S-031-MID-002",
        positionTitle: "JavaScript Developer #2",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-012",
        jobClassificationTitle: "Software Engineer",
      },
    ],
  },
  // Added employees for new leave requests
  {
    id: "P-005",
    code: "P-005",
    fullName: "Nguyen Thi Anh", // Original P-005 was Nguyen Thi Anh
    firstName: "Anh",
    lastName: "Nguyen Thi",
    personalEmail: "anh.nguyen@gmail.com",
    companyEmail: "anh.nguyen@8speople.com",
    positionId: "S-011-01", // Assuming HR Specialist role
    positionCode: "S-011-01",
    positionTitle: "HR Specialist #1",
    jobClassificationId: "C-004",
    jobClassificationTitle: "HR Specialist",
    organizationalUnitId: "O-011",
    organizationalUnitName: "HR Department",
    lineManagerId: "P-003",
    lineManagerName: "Le Van Cuong",
    costCenter: "CC-HR",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2022-01-10",
    companyJoinDate: "2022-01-10",
    officialStartDate: "2022-04-10",
    fte: 1.0,
    cellphone: "+84 901 234 005",
    dateOfBirth: "1991-05-20",
    gender: "female",
    contracts: [
      {
        id: "ct-005-1", // Added id
        contractNumber: "CT-2022-005-anh",
        contractType: "Probation",
        startDate: "2022-01-10",
        endDate: "2022-04-09",
        status: "active",
        signDate: "2022-01-10",
        status: "active",
      },
      {
        id: "ct-005-2", // Added id
        contractNumber: "CT-2022-006-anh",
        contractType: "Official",
        startDate: "2022-04-10",
        endDate: "2025-04-09",
        status: "active",
        signDate: "2022-04-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-005-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2022-01-10",
        createdAt: "2022-01-10T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-005-1", // Linked to the contract
        contractNumber: "CT-2022-005-anh",
        contractType: "Probation",
        contractStartDate: "2022-01-10",
        contractEndDate: "2022-04-09",
        signDate: "2022-01-10",
        positionId: "S-011-01",
        positionTitle: "HR Specialist #1",
        organizationalUnitId: "O-011",
        organizationalUnitName: "HR Department",
        jobClassificationId: "C-004",
        jobClassificationTitle: "HR Specialist",
      },
      {
        id: "tx-005-2",
        action: "probation_confirmation",
        reason: "Probation Completion",
        text: "Probation Confirmation: Probation Completion",
        effectiveDate: "2022-04-10",
        createdAt: "2022-04-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-005-2", // Linked to the contract
        contractNumber: "CT-2022-006-anh",
        contractType: "Official",
        contractStartDate: "2022-04-10",
        contractEndDate: "2025-04-09",
        signDate: "2022-04-01",
        positionId: "S-011-01",
        positionTitle: "HR Specialist #1",
        organizationalUnitId: "O-011",
        organizationalUnitName: "HR Department",
        jobClassificationId: "C-004",
        jobClassificationTitle: "HR Specialist",
      },
    ],
  },
  {
    id: "P-006",
    code: "P-006",
    fullName: "Vo Thi Bich Ngoc", // Original P-006 was Vo Thi Bich Ngoc
    firstName: "Ngoc",
    lastName: "Vo Thi Bich",
    personalEmail: "ngoc.vo@gmail.com",
    companyEmail: "ngoc.vo@8speople.com",
    positionId: "S-031-JR-001", // Assuming Junior JS Developer role
    positionCode: "S-031-JR-001",
    positionTitle: "Junior JavaScript Developer #1",
    jobClassificationId: "C-013",
    jobClassificationTitle: "Junior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2024-01-02",
    companyJoinDate: "2024-01-02",
    officialStartDate: "2024-01-02",
    fte: 1.0,
    cellphone: "+84 901 234 006",
    dateOfBirth: "1999-03-10",
    gender: "female",
    contracts: [
      {
        id: "ct-006-1", // Added id
        contractNumber: "CT-2024-006-ngoc",
        contractType: "Intern",
        startDate: "2024-01-02",
        endDate: "2024-06-30",
        status: "active",
        signDate: "2024-01-02",
        status: "active",
      },
      {
        id: "ct-006-2", // Added id
        contractNumber: "CT-2024-007-ngoc",
        contractType: "Junior Engineer",
        startDate: "2024-07-01",
        endDate: "2025-06-30",
        status: "active",
        signDate: "2024-07-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-006-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2024-01-02",
        createdAt: "2024-01-02T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-006-1", // Linked to the contract
        contractNumber: "CT-2024-006-ngoc",
        contractType: "Intern",
        contractStartDate: "2024-01-02",
        contractEndDate: "2024-06-30",
        signDate: "2024-01-02",
        positionId: "S-031-JR-001",
        positionTitle: "Junior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-013",
        jobClassificationTitle: "Junior Software Engineer",
      },
      {
        id: "tx-006-2",
        action: "promotion", // This might represent a change in contract type/level rather than a promotion to a new title
        reason: "Performance",
        text: "Promotion: Performance",
        effectiveDate: "2024-07-01",
        createdAt: "2024-07-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-006-2", // Linked to the contract
        contractNumber: "CT-2024-007-ngoc",
        contractType: "Junior Engineer",
        contractStartDate: "2024-07-01",
        contractEndDate: "2025-06-30",
        signDate: "2024-07-01",
        positionId: "S-031-JR-001",
        positionTitle: "Junior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-013",
        jobClassificationTitle: "Junior Software Engineer",
      },
    ],
  },
  {
    id: "P-007",
    code: "P-007",
    fullName: "Pham Van Giang", // Original P-007 was Pham Van Giang
    firstName: "Giang",
    lastName: "Pham Van",
    personalEmail: "giang.pham@gmail.com",
    companyEmail: "giang.pham@8speople.com",
    positionId: "S-021-01", // Assuming Marketing Specialist role
    positionCode: "S-021-01",
    positionTitle: "Marketing Specialist #1",
    jobClassificationId: "C-020",
    jobClassificationTitle: "Marketing Specialist",
    organizationalUnitId: "O-021",
    organizationalUnitName: "Marketing Department",
    lineManagerId: "P-001",
    lineManagerName: "Nguyen Van An",
    costCenter: "CC-MKT",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2023-03-01",
    companyJoinDate: "2023-03-01",
    officialStartDate: "2023-03-01",
    fte: 1.0,
    cellphone: "+84 901 234 007",
    dateOfBirth: "1993-08-15",
    gender: "male",
    contracts: [
      {
        id: "ct-007-1", // Added id
        contractNumber: "CT-2023-002-giang",
        contractType: "Official",
        startDate: "2023-03-01",
        endDate: "2026-02-28",
        status: "active",
        signDate: "2023-03-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-007-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2023-03-01",
        createdAt: "2023-03-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-007-1", // Linked to the contract
        contractNumber: "CT-2023-002-giang",
        contractType: "Official",
        contractStartDate: "2023-03-01",
        contractEndDate: "2026-02-28",
        signDate: "2023-03-01",
        positionId: "S-021-01",
        positionTitle: "Marketing Specialist #1",
        organizationalUnitId: "O-021",
        organizationalUnitName: "Marketing Department",
        jobClassificationId: "C-020",
        jobClassificationTitle: "Marketing Specialist",
      },
    ],
  },
  {
    id: "P-008",
    code: "P-008",
    fullName: "Hoang Thi Hoa", // Original P-008 was Hoang Thi Hoa
    firstName: "Hoa",
    lastName: "Hoang Thi",
    personalEmail: "hoa.hoang@gmail.com",
    companyEmail: "hoa.hoang@8speople.com",
    positionId: "S-012-01", // Assuming Finance Specialist role
    positionCode: "S-012-01",
    positionTitle: "Finance Specialist #1",
    jobClassificationId: "C-021",
    jobClassificationTitle: "Finance Specialist",
    organizationalUnitId: "O-012",
    organizationalUnitName: "Finance Department",
    lineManagerId: "P-001",
    lineManagerName: "Nguyen Van An",
    costCenter: "CC-FIN",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2023-04-15",
    companyJoinDate: "2023-04-15",
    officialStartDate: "2023-04-15",
    fte: 1.0,
    cellphone: "+84 901 234 008",
    dateOfBirth: "1990-11-01",
    gender: "female",
    contracts: [
      {
        id: "ct-008-1", // Added id
        contractNumber: "CT-2023-003-hoa",
        contractType: "Official",
        startDate: "2023-04-15",
        endDate: "2026-04-14",
        status: "active",
        signDate: "2023-04-15",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-008-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2023-04-15",
        createdAt: "2023-04-15T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-008-1", // Linked to the contract
        contractNumber: "CT-2023-003-hoa",
        contractType: "Official",
        contractStartDate: "2023-04-15",
        contractEndDate: "2026-04-14",
        signDate: "2023-04-15",
        positionId: "S-012-01",
        positionTitle: "Finance Specialist #1",
        organizationalUnitId: "O-012",
        organizationalUnitName: "Finance Department",
        jobClassificationId: "C-021",
        jobClassificationTitle: "Finance Specialist",
      },
    ],
  },
  {
    id: "P-009",
    code: "P-009",
    fullName: "Vu Van Ich", // Original P-009 was Vu Van Ich
    firstName: "Ich",
    lastName: "Vu Van",
    personalEmail: "ich.vu@gmail.com",
    companyEmail: "ich.vu@8speople.com",
    positionId: "S-031-MID-001", // Assuming Mid-level JS Developer role
    positionCode: "S-031-MID-001",
    positionTitle: "JavaScript Developer #1",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2023-01-10",
    companyJoinDate: "2023-01-10",
    officialStartDate: "2024-01-01",
    fte: 1.0,
    cellphone: "+84 901 234 009",
    dateOfBirth: "1992-07-07",
    gender: "male",
    contracts: [
      {
        id: "ct-009-1", // Added id
        contractNumber: "CT-2023-001-ich",
        contractType: "Junior Engineer",
        startDate: "2023-01-20",
        endDate: "2023-12-31",
        status: "active",
        signDate: "2023-01-20",
        status: "active",
      },
      {
        id: "ct-009-2", // Added id
        contractNumber: "CT-2024-005-ich",
        contractType: "Mid-Level Engineer",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        status: "active",
        signDate: "2024-01-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-009-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2023-01-20",
        createdAt: "2023-01-20T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-009-1", // Linked to the contract
        contractNumber: "CT-2023-001-ich",
        contractType: "Junior Engineer",
        contractStartDate: "2023-01-20",
        contractEndDate: "2023-12-31",
        signDate: "2023-01-20",
        positionId: "S-031-MID-001",
        positionTitle: "JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-012",
        jobClassificationTitle: "Software Engineer",
      },
      {
        id: "tx-009-2",
        action: "promotion",
        reason: "Performance",
        text: "Promotion: Performance",
        effectiveDate: "2024-01-01",
        createdAt: "2024-01-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-009-2", // Linked to the contract
        contractNumber: "CT-2024-005-ich",
        contractType: "Mid-Level Engineer",
        contractStartDate: "2024-01-01",
        contractEndDate: "2026-12-31",
        signDate: "2024-01-01",
        positionId: "S-031-MID-001",
        positionTitle: "JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-012",
        jobClassificationTitle: "Software Engineer",
      },
    ],
  },
  // Re-adding P-006 with a different name to avoid duplicate IDs for demonstration purposes.
  // In a real scenario, duplicate IDs should be resolved.
  {
    id: "P-006-alt",
    code: "P-006-alt",
    fullName: "Vo Thi Bich Ngoc - Alt",
    firstName: "Ngoc",
    lastName: "Vo Thi Bich",
    personalEmail: "ngoc.vo.alt@gmail.com",
    companyEmail: "ngoc.vo.alt@8speople.com",
    positionId: "S-031-JR-001", // Assuming Junior JS Developer role
    positionCode: "S-031-JR-001",
    positionTitle: "Junior JavaScript Developer #1",
    jobClassificationId: "C-013",
    jobClassificationTitle: "Junior Software Engineer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    lineManagerId: "P-010",
    lineManagerName: "Hoang Van Em",
    costCenter: "CC-JS",
    status: "active",
    onboardingStatus: { emailSent: true, accountActivated: true, profileCompleted: true },
    startDate: "2024-01-02",
    companyJoinDate: "2024-01-02",
    officialStartDate: "2024-01-02",
    fte: 1.0,
    cellphone: "+84 901 234 006-alt",
    dateOfBirth: "1999-03-10",
    gender: "female",
    contracts: [
      {
        id: "ct-006-alt-1", // Added id
        contractNumber: "CT-2024-006-alt",
        contractType: "Intern",
        startDate: "2024-01-02",
        endDate: "2024-06-30",
        status: "active",
        signDate: "2024-01-02",
        status: "active",
      },
      {
        id: "ct-006-alt-2", // Added id
        contractNumber: "CT-2024-007-alt",
        contractType: "Junior Engineer",
        startDate: "2024-07-01",
        endDate: "2025-06-30",
        status: "active",
        signDate: "2024-07-01",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "tx-006-alt-1",
        action: "hiring",
        reason: "New Position",
        text: "Hired: New Position",
        effectiveDate: "2024-01-02",
        createdAt: "2024-01-02T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-006-alt-1", // Linked to the contract
        contractNumber: "CT-2024-006-alt",
        contractType: "Intern",
        contractStartDate: "2024-01-02",
        contractEndDate: "2024-06-30",
        signDate: "2024-01-02",
        positionId: "S-031-JR-001",
        positionTitle: "Junior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-013",
        jobClassificationTitle: "Junior Software Engineer",
      },
      {
        id: "tx-006-alt-2",
        action: "promotion", // Similar to P-006, this might be a contract update
        reason: "Performance",
        text: "Promotion: Performance",
        effectiveDate: "2024-07-01",
        createdAt: "2024-07-01T09:00:00Z",
        createdBy: "admin",
        linkedContractId: "ct-006-alt-2", // Linked to the contract
        contractNumber: "CT-2024-007-alt",
        contractType: "Junior Engineer",
        contractStartDate: "2024-07-01",
        contractEndDate: "2025-06-30",
        signDate: "2024-07-01",
        positionId: "S-031-JR-001",
        positionTitle: "Junior JavaScript Developer #1",
        organizationalUnitId: "O-031",
        organizationalUnitName: "JavaScript Department",
        jobClassificationId: "C-013",
        jobClassificationTitle: "Junior Software Engineer",
      },
    ],
  },
]

export const leaveTypes: LeaveType[] = [
  {
    id: "lt-1",
    name: "Annual Leave",
    description: "Paid time off for vacation and personal matters",
    defaultDays: 14,
    carryForward: true,
    maxCarryForwardDays: 5,
    color: "#3B82F6",
  },
  {
    id: "lt-2",
    name: "Unpaid Leave",
    description: "Unpaid time off for personal reasons without benefits",
    defaultDays: 0,
    carryForward: false,
    maxCarryForwardDays: 0,
    color: "#9CA3AF",
  },
  {
    id: "lt-3",
    name: "Holiday Leave",
    description: "Public holidays as defined by company policy",
    defaultDays: 0,
    carryForward: false,
    maxCarryForwardDays: 0,
    color: "#EF4444",
  },
]

export const leavePolicyRules: LeavePolicyRule[] = [
  {
    id: "lp-1",
    name: "Executive Policy",
    description: "Leave policy for C-level executives",
    jobLevels: ["Executive"],
    annualLeaveDays: 20,
    maxCarryForwardDays: 5,
    carryForwardExpiryMonth: 6,
    carryForwardExpiryDay: 30,
    effectiveFrom: "2024-01-01",
    status: "active",
  },
  {
    id: "lp-2",
    name: "Manager Policy",
    description: "Leave policy for management level",
    jobLevels: ["Manager", "Lead"],
    annualLeaveDays: 18,
    maxCarryForwardDays: 5,
    carryForwardExpiryMonth: 6,
    carryForwardExpiryDay: 30,
    effectiveFrom: "2024-01-01",
    status: "active",
  },
  {
    id: "lp-3",
    name: "Senior Staff Policy",
    description: "Leave policy for senior-level employees",
    jobLevels: ["Senior"],
    annualLeaveDays: 16,
    maxCarryForwardDays: 5,
    carryForwardExpiryMonth: 6,
    carryForwardExpiryDay: 30,
    effectiveFrom: "2024-01-01",
    status: "active",
  },
  {
    id: "lp-4",
    name: "Standard Policy",
    description: "Default leave policy for all other employees",
    jobLevels: ["Mid-level", "Professional", "Junior", "Intern"],
    annualLeaveDays: 14,
    maxCarryForwardDays: 5,
    carryForwardExpiryMonth: 6,
    carryForwardExpiryDay: 30,
    effectiveFrom: "2024-01-01",
    status: "active",
  },
]

export const publicHolidays: PublicHoliday[] = [
  {
    id: "ph-1",
    name: "New Year's Day",
    date: "2026-01-01",
    year: 2026,
    isRecurring: true,
    description: "International New Year celebration",
    status: "active",
  },
  {
    id: "ph-2",
    name: "Lunar New Year Eve",
    date: "2026-02-16",
    year: 2026,
    isRecurring: false,
    description: "Vietnamese Lunar New Year - Tet Holiday",
    status: "active",
  },
  {
    id: "ph-3",
    name: "Lunar New Year Day 1",
    date: "2026-02-17",
    year: 2026,
    isRecurring: false,
    description: "Vietnamese Lunar New Year - Tet Holiday",
    status: "active",
  },
  {
    id: "ph-4",
    name: "Lunar New Year Day 2",
    date: "2026-02-18",
    year: 2026,
    isRecurring: false,
    description: "Vietnamese Lunar New Year - Tet Holiday",
    status: "active",
  },
  {
    id: "ph-5",
    name: "Lunar New Year Day 3",
    date: "2026-02-19",
    year: 2026,
    isRecurring: false,
    description: "Vietnamese Lunar New Year - Tet Holiday",
    status: "active",
  },
  {
    id: "ph-6",
    name: "Hung Kings Commemoration Day",
    date: "2026-04-15",
    year: 2026,
    isRecurring: false,
    description: "Anniversary of the Hung Kings",
    status: "active",
  },
  {
    id: "ph-7",
    name: "Reunification Day",
    date: "2026-04-30",
    year: 2026,
    isRecurring: true,
    description: "Liberation Day / Reunification Day",
    status: "active",
  },
  {
    id: "ph-8",
    name: "International Labor Day",
    date: "2026-05-01",
    year: 2026,
    isRecurring: true,
    description: "International Workers' Day",
    status: "active",
  },
  {
    id: "ph-9",
    name: "National Day",
    date: "2026-09-02",
    year: 2026,
    isRecurring: true,
    description: "Vietnam National Day",
    status: "active",
  },
]

export function getLeavePolicyForJobLevel(jobLevel: string): LeavePolicyRule | undefined {
  return leavePolicyRules.find((policy) => policy.status === "active" && policy.jobLevels.includes(jobLevel))
}

export const leaveRequests: LeaveRequest[] = [
  {
    id: "lr-1",
    employeeId: "P-011",
    employeeName: "Nguyen Van Phuc",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-15",
    endDate: "2026-01-17",
    totalDays: 3,
    reason: "Family vacation to Da Lat",
    status: "approved",
    approvers: [
      { employeeId: "P-010", employeeName: "Hoang Van Em", status: "approved", respondedAt: "2026-01-10T09:00:00Z" },
    ],
    ccRecipients: [{ employeeId: "P-002", employeeName: "Tran Thi Binh" }],
    createdAt: "2026-01-08T10:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "lr-2",
    employeeId: "P-012",
    employeeName: "Tran Thi Giang",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-20",
    endDate: "2026-01-20",
    totalDays: 0.5,
    reason: "Doctor appointment in the morning",
    notes: "morning",
    status: "approved",
    approvers: [
      { employeeId: "P-010", employeeName: "Hoang Van Em", status: "approved", respondedAt: "2026-01-12T14:00:00Z" },
    ],
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-12T14:00:00Z",
  },
  {
    id: "lr-3",
    employeeId: "P-003",
    employeeName: "Le Van Cuong",
    leaveTypeId: "lt-2",
    leaveTypeName: "Unpaid Leave",
    startDate: "2026-01-22",
    endDate: "2026-01-24",
    totalDays: 3,
    reason: "Personal matters - handling visa documents",
    status: "pending",
    approvers: [{ employeeId: "P-002", employeeName: "Tran Thi Binh", status: "pending" }],
    createdAt: "2026-01-11T11:00:00Z",
    updatedAt: "2026-01-11T11:00:00Z",
  },
  {
    id: "lr-4",
    employeeId: "P-005", // Originally P-005, was Nguyen Thi Anh
    employeeName: "Nguyen Thi Anh",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-06",
    endDate: "2026-01-08",
    totalDays: 3,
    reason: "Attending cousin's wedding in Hue",
    status: "approved",
    approvers: [
      { employeeId: "P-001", employeeName: "Nguyen Van An", status: "approved", respondedAt: "2026-01-03T10:00:00Z" },
    ],
    createdAt: "2026-01-02T09:00:00Z",
    updatedAt: "2026-01-03T10:00:00Z",
  },
  {
    id: "lr-5",
    employeeId: "P-007", // Originally P-007, was Pham Van Giang
    employeeName: "Pham Van Giang",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-13",
    endDate: "2026-01-13",
    totalDays: 0.5,
    reason: "Afternoon off for child's school event",
    notes: "afternoon",
    status: "approved",
    approvers: [
      { employeeId: "P-002", employeeName: "Tran Thi Binh", status: "approved", respondedAt: "2026-01-10T11:00:00Z" },
    ],
    createdAt: "2026-01-09T14:00:00Z",
    updatedAt: "2026-01-10T11:00:00Z",
  },
  {
    id: "lr-6",
    employeeId: "P-008", // Originally P-008, was Hoang Thi Hoa
    employeeName: "Hoang Thi Hoa",
    leaveTypeId: "lt-2",
    leaveTypeName: "Unpaid Leave",
    startDate: "2026-01-27",
    endDate: "2026-01-28",
    totalDays: 2,
    reason: "Moving to new apartment",
    status: "approved",
    approvers: [
      { employeeId: "P-002", employeeName: "Tran Thi Binh", status: "approved", respondedAt: "2026-01-15T09:00:00Z" },
    ],
    createdAt: "2026-01-14T10:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "lr-7",
    employeeId: "P-001",
    employeeName: "Nguyen Van An",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-30",
    endDate: "2026-02-02",
    totalDays: 4,
    reason: "Lunar New Year early celebration with family",
    status: "approved",
    approvers: [
      { employeeId: "P-002", employeeName: "Tran Thi Binh", status: "approved", respondedAt: "2026-01-20T14:00:00Z" },
    ],
    createdAt: "2026-01-18T09:00:00Z",
    updatedAt: "2026-01-20T14:00:00Z",
  },
  {
    id: "lr-8",
    employeeId: "P-004",
    employeeName: "Pham Thi Dung",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-06",
    endDate: "2026-01-06",
    totalDays: 1,
    reason: "Personal day off",
    status: "approved",
    approvers: [
      { employeeId: "P-001", employeeName: "Nguyen Van An", status: "approved", respondedAt: "2026-01-05T10:00:00Z" },
    ],
    createdAt: "2026-01-04T11:00:00Z",
    updatedAt: "2026-01-05T10:00:00Z",
  },
  {
    id: "lr-9",
    employeeId: "P-009", // Originally P-009, was Vu Van Ich
    employeeName: "Vu Van Ich",
    leaveTypeId: "lt-2",
    leaveTypeName: "Unpaid Leave",
    startDate: "2026-01-14",
    endDate: "2026-01-14",
    totalDays: 0.5,
    reason: "Bank appointment - morning",
    notes: "morning",
    status: "approved",
    approvers: [
      { employeeId: "P-002", employeeName: "Tran Thi Binh", status: "approved", respondedAt: "2026-01-12T08:00:00Z" },
    ],
    createdAt: "2026-01-11T15:00:00Z",
    updatedAt: "2026-01-12T08:00:00Z",
  },
  {
    id: "lr-10",
    employeeId: "P-006", // Originally P-006, was Vo Thi Bich Ngoc
    employeeName: "Vo Thi Bich Ngoc",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-21",
    endDate: "2026-01-23",
    totalDays: 3,
    reason: "Short trip with friends",
    status: "pending",
    approvers: [{ employeeId: "P-001", employeeName: "Nguyen Van An", status: "pending" }],
    createdAt: "2026-01-12T10:00:00Z",
    updatedAt: "2026-01-12T10:00:00Z",
  },
]

export const leaveBalances: LeaveBalance[] = employees.map((emp) => {
  const empNum = Number.parseInt(emp.id.replace("P-", "")) || 0

  // Find job classification to get job level
  const jobClass = jobClassifications.find((jc) => jc.id === emp.jobClassificationId)
  const jobLevel = jobClass?.jobLevel || "Mid-level"

  // Find applicable leave policy
  const policy = getLeavePolicyForJobLevel(jobLevel)
  const annualEntitlement = policy?.annualLeaveDays || 14
  const maxCarryForward = policy?.maxCarryForwardDays || 5

  // Calculate carry forward from previous year (simulated)
  const carryForwardFromPrevYear = Math.min(empNum % 5, maxCarryForward)

  const usedDays = (empNum * 3) % 10
  const pendingDays = empNum % 3
  const totalEntitlement = carryForwardFromPrevYear + annualEntitlement

  // Determine carry forward expiry date based on policy
  let carryForwardExpiryDate = undefined
  if (policy && policy.carryForwardExpiryMonth && policy.carryForwardExpiryDay) {
    // Find the last day of the carryForwardExpiryMonth in the current year (or next year if month is earlier than current month)
    const currentYear = new Date().getFullYear()
    const expiryYear = policy.carryForwardExpiryMonth < new Date().getMonth() + 1 ? currentYear + 1 : currentYear
    carryForwardExpiryDate = `${expiryYear}-${String(policy.carryForwardExpiryMonth).padStart(2, "0")}-${String(policy.carryForwardExpiryDay).padStart(2, "0")}`
  }

  // Calculate expired carry forward days (simplified simulation)
  const carryForwardExpired =
    carryForwardFromPrevYear > 0 && carryForwardExpiryDate && new Date(carryForwardExpiryDate) < new Date()
      ? carryForwardFromPrevYear
      : 0

  return {
    employeeId: emp.id,
    employeeName: emp.fullName,
    department: emp.organizationalUnitName,
    leaveTypeId: "lt-1",
    // Policy-based fields
    leavePolicyId: policy?.id,
    leavePolicyName: policy?.name,
    jobLevel: jobLevel,
    // Breakdown
    carryForwardFromPrevYear: carryForwardFromPrevYear,
    carryForwardExpiryDate: carryForwardExpiryDate, // Date when carry forward expires
    carryForwardExpired: carryForwardExpired, // Days already expired from carry forward
    annualEntitlement: annualEntitlement,
    totalEntitlement: totalEntitlement,
    used: usedDays,
    pending: pendingDays,
    carryForward: carryForwardFromPrevYear, // For backward compatibility
    available: Math.max(0, totalEntitlement - usedDays - pendingDays - carryForwardExpired),
    year: 2026,
  }
})

export interface LeaveHistoryEntry {
  id: string
  employeeId: string
  leaveTypeId: string
  leaveTypeName: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: "approved" | "rejected" | "cancelled"
  approvedBy: string
  approvedAt: string
  notes?: string
}

export const leaveHistory: LeaveHistoryEntry[] = [
  // P-001 Nguyen Van An - 3 days used
  {
    id: "lh-001-1",
    employeeId: "P-001",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-08-15",
    endDate: "2025-08-15",
    totalDays: 1,
    reason: "Personal appointment",
    status: "approved",
    approvedBy: "Board of Directors",
    approvedAt: "2025-08-10T10:00:00Z",
  },
  {
    id: "lh-001-2",
    employeeId: "P-001",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-12-24",
    endDate: "2025-12-25",
    totalDays: 2,
    reason: "Christmas holiday",
    status: "approved",
    approvedBy: "Board of Directors",
    approvedAt: "2025-12-15T09:00:00Z",
  },
  // P-002 Tran Thi Binh - 6 days used
  {
    id: "lh-002-1",
    employeeId: "P-002",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-07-14",
    endDate: "2025-07-16",
    totalDays: 3,
    reason: "Summer vacation with family",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2025-07-01T08:00:00Z",
  },
  {
    id: "lh-002-2",
    employeeId: "P-002",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-11-01",
    endDate: "2025-11-01",
    totalDays: 1,
    reason: "Personal day",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2025-10-28T10:00:00Z",
  },
  {
    id: "lh-002-3",
    employeeId: "P-002",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-12-30",
    endDate: "2025-12-31",
    totalDays: 2,
    reason: "New Year preparation",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2025-12-20T09:00:00Z",
  },
  // P-003 Le Van Cuong - 9 days used
  {
    id: "lh-003-1",
    employeeId: "P-003",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-04-28",
    endDate: "2025-05-02",
    totalDays: 5,
    reason: "Extended holiday trip to Japan",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2025-04-15T09:00:00Z",
  },
  {
    id: "lh-003-2",
    employeeId: "P-003",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-09-01",
    endDate: "2025-09-02",
    totalDays: 2,
    reason: "National Day holiday",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2025-08-25T10:00:00Z",
  },
  {
    id: "lh-003-3",
    employeeId: "P-003",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-12-24",
    endDate: "2025-12-25",
    totalDays: 2,
    reason: "Christmas break",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2025-12-18T08:00:00Z",
  },
  // P-004 Pham Thi Dung - 2 days used
  {
    id: "lh-004-1",
    employeeId: "P-004",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-10-15",
    endDate: "2025-10-16",
    totalDays: 2,
    reason: "Family wedding",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2025-10-10T09:00:00Z",
  },
  // P-005 Nguyen Thi Anh - Assuming 0 days used for this placeholder employee
  // No leave history entries for P-005 in this example, as it's assumed to be a newer employee or has no prior leave history.

  // P-006 Vo Thi Bich Ngoc - 8 days used
  {
    id: "lh-006-1",
    employeeId: "P-006",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-03-10",
    endDate: "2025-03-14",
    totalDays: 5,
    reason: "Spring break travel",
    status: "approved",
    approvedBy: "Tran Thi Binh",
    approvedAt: "2025-03-01T08:00:00Z",
  },
  {
    id: "lh-006-2",
    employeeId: "P-006",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-08-18",
    endDate: "2025-08-20",
    totalDays: 3,
    reason: "Family reunion",
    status: "approved",
    approvedBy: "Tran Thi Binh",
    approvedAt: "2025-08-10T10:00:00Z",
  },
  // P-007 Pham Van Giang - 1 day used
  {
    id: "lh-007-1",
    employeeId: "P-007",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-09-15",
    endDate: "2025-09-15",
    totalDays: 1,
    reason: "Doctor appointment",
    status: "approved",
    approvedBy: "Hoang Van Em",
    approvedAt: "2025-09-12T09:00:00Z",
  },
  // P-008 Hoang Thi Hoa - 4 days used
  {
    id: "lh-008-1",
    employeeId: "P-008",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-05-05",
    endDate: "2025-05-06",
    totalDays: 2,
    reason: "Personal errands",
    status: "approved",
    approvedBy: "Hoang Van Em",
    approvedAt: "2025-05-01T10:00:00Z",
  },
  {
    id: "lh-008-2",
    employeeId: "P-008",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-10-01",
    endDate: "2025-10-02",
    totalDays: 2,
    reason: "Moving to new apartment",
    status: "approved",
    approvedBy: "Hoang Van Em",
    approvedAt: "2025-09-25T09:00:00Z",
  },
  // P-009 Vu Van Ich - 7 days used
  {
    id: "lh-009-1",
    employeeId: "P-009",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-02-03",
    endDate: "2025-02-07",
    totalDays: 5,
    reason: "Lunar New Year extended holiday",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2025-01-25T08:00:00Z",
  },
  {
    id: "lh-009-2",
    employeeId: "P-009",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-07-21",
    endDate: "2025-07-22",
    totalDays: 2,
    reason: "Short trip",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2025-07-15T10:00:00Z",
  },
  // P-010 Hoang Van Em - 5 days used (Corrected to P-010 as this is the Team Lead)
  {
    id: "lh-010-1",
    employeeId: "P-010",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-06-09",
    endDate: "2025-06-11",
    totalDays: 3,
    reason: "Mid-year vacation",
    status: "approved",
    approvedBy: "Tran Thi Binh",
    approvedAt: "2025-06-01T10:00:00Z",
  },
  {
    id: "lh-010-2",
    employeeId: "P-010",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-11-20",
    endDate: "2025-11-21",
    totalDays: 2,
    reason: "Personal matters",
    status: "approved",
    approvedBy: "Tran Thi Binh",
    approvedAt: "2025-11-15T09:00:00Z",
  },

  // P-011 Nguyen Van Phuc - 3 days used
  {
    id: "lh-011-1",
    employeeId: "P-011",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-06-20",
    endDate: "2025-06-20",
    totalDays: 1,
    reason: "Personal day",
    status: "approved",
    approvedBy: "Hoang Van Em",
    approvedAt: "2025-06-18T09:00:00Z",
  },
  {
    id: "lh-011-2",
    employeeId: "P-011",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-11-27",
    endDate: "2025-11-28",
    totalDays: 2,
    reason: "Family event",
    status: "approved",
    approvedBy: "Hoang Van Em",
    approvedAt: "2025-11-20T10:00:00Z",
  },
  // P-012 Tran Thi Giang - 6 days used
  {
    id: "lh-012-1",
    employeeId: "P-012",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-04-14",
    endDate: "2025-04-16",
    totalDays: 3,
    reason: "Extended weekend trip",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2025-04-08T09:00:00Z",
  },
  {
    id: "lh-012-2",
    employeeId: "P-012",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-10-13",
    endDate: "2025-10-14",
    totalDays: 2,
    reason: "Wedding anniversary",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2025-10-08T10:00:00Z",
  },
  {
    id: "lh-012-3",
    employeeId: "P-012",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2025-08-05",
    endDate: "2025-08-05",
    totalDays: 1,
    reason: "Child's school event",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2025-08-01T09:00:00Z",
  },
]

// Helper to generate attendance records for Jan 2026
const generateJan2026Records = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const startDate = new Date("2026-01-01")
  const endDate = new Date("2026-01-16") // Generate up to today (Jan 16)

  // Specific overrides map
  const overrides: Record<string, AttendanceRecord> = {}

  const specificList: AttendanceRecord[] = [
    // P-001: Early Leave on Jan 14
    {
      id: "att-001-14",
      employeeId: "P-001",
      employeeName: "Nguyen Van An",
      date: "2026-01-14",
      clockIn: "08:00",
      clockOut: "12:00",
      status: "early_leave",
      totalHours: 4,
      source: "fingerprint",
    },
    // P-003: Late on Jan 6
    {
      id: "att-003-06",
      employeeId: "P-003",
      employeeName: "Le Van Cuong",
      date: "2026-01-06",
      clockIn: "08:45",
      clockOut: "17:30",
      status: "late",
      lateMinutes: 15,
      totalHours: 7.75,
      source: "fingerprint",
    }
  ]

  specificList.forEach(r => {
    overrides[`${r.employeeId}_${r.date}`] = r
  })

  employees.forEach(emp => {
    const workingDays = emp.workingDays || [1, 2, 3, 4, 5] // Default Mon-Fri

    const curr = new Date(startDate)
    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0]
      const key = `${emp.id}_${dateStr}`

      // Check override
      if (overrides[key]) {
        records.push(overrides[key])
      } else {
        // Check if working day
        const dayOfWeek = curr.getDay() // 0=Sun, 6=Sat
        if (workingDays.includes(dayOfWeek)) {
          // Check holiday
          const isHoliday = publicHolidays.some(h => h.date === dateStr && h.status === 'active')
          if (isHoliday) {
            records.push({
              id: `att-${emp.id}-${dateStr}`,
              employeeId: emp.id,
              employeeName: emp.fullName,
              date: dateStr,
              status: "holiday",
              totalHours: 0,
              source: "web"
            })
          } else {
            // Generate Present
            records.push({
              id: `att-${emp.id}-${dateStr}`,
              employeeId: emp.id,
              employeeName: emp.fullName,
              date: dateStr,
              clockIn: "08:00",
              clockOut: "17:00",
              status: "present",
              totalHours: 8,
              source: "fingerprint"
            })
          }
        }
      }

      // Next day
      curr.setDate(curr.getDate() + 1)
    }
  })

  return records
}

export const attendanceRecords: AttendanceRecord[] = generateJan2026Records()


export const jobRequisitions: JobRequisition[] = [
  {
    id: "jr-1",
    title: "Senior JavaScript Developer",
    positionId: "S-031-MID-002",
    positionCode: "S-031-MID-002",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    description:
      "We are looking for a Senior JavaScript Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern JavaScript frameworks. This role offers the opportunity to work on challenging projects with cutting-edge technologies.\n\nWhat we offer:\n- Competitive salary and benefits\n- Flexible working hours\n- Professional development opportunities\n- Modern office environment",
    requirements: [
      "5+ years of JavaScript/TypeScript experience",
      "Expert knowledge of React and Next.js",
      "Strong Node.js backend skills",
      "Experience with PostgreSQL and Redis",
      "Excellent problem-solving abilities",
      "Strong communication skills in English",
    ],
    salaryRange: { min: 25000000, max: 40000000, currency: "VND" },
    employmentType: "full-time",
    status: "open",
    openings: 2,
    hired: 0,
    createdBy: "P-003",
    createdAt: "2025-12-15T10:00:00Z",
    closingDate: "2026-02-28",
    publishPlatforms: ["linkedin", "topcv", "itviec", "landing_page"],
  },
  {
    id: "jr-2",
    title: "AI/ML Engineer",
    positionId: "S-032-SR-001",
    organizationalUnitId: "O-032",
    organizationalUnitName: "AI Department",
    jobClassificationId: "C-011",
    jobClassificationTitle: "Senior Software Engineer",
    description:
      "Join our AI team to build innovative machine learning solutions. You will work on cutting-edge AI projects including natural language processing, computer vision, and predictive analytics.\n\nResponsibilities:\n- Design and implement ML models\n- Collaborate with product teams\n- Research new AI techniques\n- Optimize model performance",
    requirements: [
      "3+ years ML/AI experience",
      "Proficiency in Python and PyTorch/TensorFlow",
      "Strong math and statistics background",
      "Experience with MLOps tools",
      "Publication in AI conferences is a plus",
    ],
    salaryRange: { min: 30000000, max: 50000000, currency: "VND" },
    employmentType: "full-time",
    status: "open",
    openings: 1,
    hired: 0,
    createdBy: "P-003",
    createdAt: "2025-12-20T10:00:00Z",
    closingDate: "2026-03-15",
    publishPlatforms: ["linkedin", "topcv"],
  },
  {
    id: "jr-3",
    title: "Junior React Developer",
    organizationalUnitId: "O-031",
    organizationalUnitName: "JavaScript Department",
    jobClassificationId: "C-013",
    jobClassificationTitle: "Junior Software Engineer",
    description:
      "Great opportunity for fresh graduates or developers with 1-2 years experience to join our JavaScript team. You will learn from senior developers and work on real projects.\n\nWhat you'll do:\n- Develop React components\n- Write unit tests\n- Participate in code reviews\n- Learn best practices",
    requirements: [
      "0-2 years of experience",
      "Knowledge of React basics",
      "Understanding of HTML, CSS, JavaScript",
      "Willingness to learn",
      "Good teamwork attitude",
    ],
    salaryHidden: true,
    employmentType: "full-time",
    status: "open",
    openings: 3,
    hired: 1,
    createdBy: "P-003",
    createdAt: "2026-01-02T10:00:00Z",
    closingDate: "2026-02-15",
    publishPlatforms: ["topcv", "vietnamworks", "facebook"],
  },
  {
    id: "jr-4",
    title: "Marketing Executive",
    organizationalUnitId: "O-021",
    organizationalUnitName: "Marketing Department",
    jobClassificationId: "C-020",
    jobClassificationTitle: "Marketing Specialist",
    description:
      "We are looking for a creative Marketing Executive to join our marketing team. You will help develop and execute marketing campaigns across multiple channels.",
    requirements: [
      "2+ years marketing experience",
      "Experience with digital marketing",
      "Strong writing skills",
      "Creative mindset",
    ],
    salaryRange: { min: 15000000, max: 25000000, currency: "VND" },
    employmentType: "full-time",
    status: "closed",
    openings: 1,
    hired: 1,
    createdBy: "P-003",
    createdAt: "2025-11-01T10:00:00Z",
    closingDate: "2025-12-31",
    publishPlatforms: ["linkedin", "vietnamworks"],
  },
  {
    id: "jr-5",
    title: "DevOps Engineer",
    organizationalUnitId: "O-030",
    organizationalUnitName: "Technology Division",
    jobClassificationId: "C-012",
    jobClassificationTitle: "Software Engineer",
    description:
      "Looking for a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will work with AWS, Docker, and Kubernetes.",
    requirements: [
      "3+ years DevOps experience",
      "Strong AWS knowledge",
      "Experience with Docker and Kubernetes",
      "CI/CD pipeline management",
      "Infrastructure as Code (Terraform)",
    ],
    salaryRange: { min: 25000000, max: 40000000, currency: "VND" },
    employmentType: "full-time",
    status: "on_hold",
    openings: 1,
    hired: 0,
    createdBy: "P-003",
    createdAt: "2025-12-10T10:00:00Z",
    publishPlatforms: ["linkedin", "itviec"],
  },
]

export const candidates: Candidate[] = [
  {
    id: "cand-1",
    jobRequisitionId: "jr-1",
    fullName: "Nguyen Minh Tuan",
    email: "tuan.nguyen@email.com",
    phone: "+84 901 111 222",
    linkedinUrl: "https://linkedin.com/in/tuannguyen",
    stage: "interviewing",
    source: "linkedin",
    appliedAt: "2025-12-20T10:00:00Z",
    updatedAt: "2026-01-05T10:00:00Z",
    rating: 4,
    aiCvScore: 85,
    aiCvAnalysis:
      "Strong candidate with 6 years of JavaScript experience. Skills align well with Senior JavaScript Developer requirements. Excellent React and Node.js proficiency demonstrated through portfolio projects.",
    expectedSalary: 35000000,
    yearsOfExperience: 6,
    skills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Redis"],
    interviews: [
      {
        id: "int-1",
        candidateId: "cand-1",
        scheduledAt: "2026-01-10T14:00:00Z",
        duration: 60,
        interviewers: ["P-010", "P-011"],
        interviewerNames: ["Hoang Van Em", "Nguyen Van Phuc"],
        type: "technical",
        status: "scheduled",
        meetingLink: "https://meet.google.com/abc-defg-hij",
      },
      {
        id: "int-2",
        candidateId: "cand-1",
        scheduledAt: "2026-01-08T10:00:00Z",
        duration: 30,
        interviewers: ["P-003"],
        interviewerNames: ["Le Van Cuong"],
        type: "hr",
        status: "completed",
        feedback: [
          {
            interviewerId: "P-003",
            rating: 4,
            strengths: "Good communication, clear career goals",
            recommendation: "hire",
          },
        ],
      },
    ],
  },
  {
    id: "cand-2",
    jobRequisitionId: "jr-1",
    fullName: "Tran Thanh Hoa",
    email: "hoa.tran@email.com",
    phone: "+84 902 333 444",
    stage: "screening",
    source: "topcv",
    appliedAt: "2025-12-25T10:00:00Z",
    updatedAt: "2025-12-28T10:00:00Z",
    aiCvScore: 72,
    aiCvAnalysis:
      "Candidate shows potential for the Senior JavaScript Developer position. 4 years of experience with good React knowledge. Consider for technical assessment to evaluate advanced skills.",
    expectedSalary: 30000000,
    yearsOfExperience: 4,
    skills: ["React", "JavaScript", "CSS", "Node.js"],
  },
  {
    id: "cand-3",
    jobRequisitionId: "jr-2",
    fullName: "Le Hoang Nam",
    email: "nam.le@email.com",
    phone: "+84 903 555 666",
    linkedinUrl: "https://linkedin.com/in/namle-ai",
    stage: "offering",
    source: "linkedin",
    appliedAt: "2025-12-18T10:00:00Z",
    updatedAt: "2026-01-07T10:00:00Z",
    rating: 5,
    aiCvScore: 92,
    aiCvAnalysis:
      "Excellent candidate for AI/ML Engineer position. PhD in Machine Learning with 5 years industry experience. Strong publication record and hands-on experience with production ML systems.",
    expectedSalary: 45000000,
    yearsOfExperience: 5,
    skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "Computer Vision", "NLP"],
    interviews: [
      {
        id: "int-3",
        candidateId: "cand-3",
        scheduledAt: "2025-12-28T14:00:00Z",
        duration: 90,
        interviewers: ["P-020", "P-002"],
        interviewerNames: ["Vo Thi Lan", "Tran Thi Binh"],
        type: "technical",
        status: "completed",
        feedback: [
          {
            interviewerId: "P-020",
            rating: 5,
            strengths: "Deep ML knowledge, great problem-solving",
            recommendation: "strong_hire",
          },
          {
            interviewerId: "P-002",
            rating: 5,
            strengths: "Strong technical background, good culture fit",
            recommendation: "strong_hire",
          },
        ],
      },
      {
        id: "int-4",
        candidateId: "cand-3",
        scheduledAt: "2026-01-05T10:00:00Z",
        duration: 45,
        interviewers: ["P-003"],
        interviewerNames: ["Le Van Cuong"],
        type: "hr",
        status: "completed",
        feedback: [
          {
            interviewerId: "P-003",
            rating: 5,
            strengths: "Excellent communication, clear expectations",
            recommendation: "strong_hire",
          },
        ],
      },
    ],
  },
  {
    id: "cand-4",
    jobRequisitionId: "jr-3",
    fullName: "Pham Duc Anh",
    email: "anh.pham@email.com",
    phone: "+84 904 777 888",
    stage: "new",
    source: "career_page",
    appliedAt: "2026-01-08T10:00:00Z",
    updatedAt: "2026-01-08T10:00:00Z",
    aiCvScore: 68,
    aiCvAnalysis:
      "Fresh graduate with good foundation in React basics. 1 internship experience. Shows enthusiasm to learn and has completed several personal projects.",
    yearsOfExperience: 0,
    skills: ["React", "JavaScript", "HTML", "CSS"],
  },
  {
    id: "cand-5",
    jobRequisitionId: "jr-3",
    fullName: "Vo Thi Bich",
    email: "bich.vo@email.com",
    stage: "hired",
    source: "referral",
    referredBy: "P-011",
    appliedAt: "2025-12-10T10:00:00Z",
    updatedAt: "2026-01-02T10:00:00Z",
    rating: 4,
    aiCvScore: 78,
    aiCvAnalysis:
      "Good candidate for Junior React Developer. 1.5 years experience with strong fundamentals. Referred by internal employee.",
    offerAccepted: true,
    offerAcceptedAt: "2026-01-02T10:00:00Z",
    expectedSalary: 15000000,
    yearsOfExperience: 1,
    skills: ["React", "JavaScript", "TypeScript", "CSS"],
    interviews: [
      {
        id: "int-5",
        candidateId: "cand-5",
        scheduledAt: "2025-12-18T14:00:00Z",
        duration: 45,
        interviewers: ["P-010"],
        interviewerNames: ["Hoang Van Em"],
        type: "technical",
        status: "completed",
        meetingLink: "https://meet.google.com/xyz-abcd-efg",
        feedback: [
          {
            interviewerId: "P-010",
            rating: 4,
            strengths: "Good React basics, eager to learn",
            recommendation: "hire",
          },
        ],
      },
    ],
  },
  {
    id: "cand-6",
    jobRequisitionId: "jr-1",
    fullName: "Nguyen Van Cuong",
    email: "cuong.nv@email.com",
    stage: "testing",
    source: "agency",
    appliedAt: "2025-12-22T10:00:00Z",
    updatedAt: "2026-01-06T10:00:00Z",
    rating: 4,
    aiCvScore: 81,
    aiCvAnalysis:
      "Strong technical background with 5 years experience. Good React and Node.js skills. Currently completing technical assessment.",
    expectedSalary: 38000000,
    yearsOfExperience: 5,
    skills: ["React", "Vue.js", "Node.js", "MongoDB", "AWS"],
    interviews: [
      {
        id: "int-6",
        candidateId: "cand-6",
        scheduledAt: "2026-01-03T14:00:00Z",
        duration: 60,
        interviewers: ["P-011", "P-012"],
        interviewerNames: ["Nguyen Van Phuc", "Tran Thi Giang"],
        type: "technical",
        status: "completed",
        meetingLink: "https://meet.google.com/test-meet-123",
        feedback: [
          {
            interviewerId: "P-011",
            rating: 4,
            strengths: "Good system design, solid coding skills",
            recommendation: "hire",
          },
          {
            interviewerId: "P-012",
            rating: 4,
            strengths: "Strong backend knowledge",
            recommendation: "hire",
          },
        ],
      },
    ],
  },
  {
    id: "cand-7",
    jobRequisitionId: "jr-3",
    fullName: "Tran Minh Quan",
    email: "quan.tm@email.com",
    stage: "new",
    source: "topcv",
    appliedAt: "2026-01-09T08:00:00Z",
    updatedAt: "2026-01-09T08:00:00Z",
    aiCvScore: 65,
    aiCvAnalysis:
      "Recent bootcamp graduate with portfolio projects. Shows enthusiasm for learning React. Recommend initial screening call.",
    yearsOfExperience: 0,
    skills: ["JavaScript", "React", "HTML", "CSS", "Git"],
  },
  {
    id: "cand-8",
    jobRequisitionId: "jr-1",
    fullName: "Le Thi Thanh",
    email: "thanh.le@email.com",
    stage: "rejected",
    source: "linkedin",
    appliedAt: "2025-12-15T10:00:00Z",
    updatedAt: "2025-12-20T10:00:00Z",
    aiCvScore: 55,
    aiCvAnalysis: "Experience level does not meet Senior Developer requirements. Only 2 years of experience.",
    rejectionReason: "Experience Insufficient",
    yearsOfExperience: 2,
    skills: ["JavaScript", "React"],
  },
  {
    id: "cand-9",
    jobRequisitionId: "jr-4",
    fullName: "Pham Thi Lan",
    email: "lan.pham@email.com",
    stage: "hired",
    source: "vietnamworks",
    appliedAt: "2025-11-15T10:00:00Z",
    updatedAt: "2025-12-20T10:00:00Z",
    rating: 4,
    aiCvScore: 82,
    aiCvAnalysis: "Strong marketing background with 3 years experience. Good fit for Marketing Executive role.",
    offerAccepted: true,
    offerAcceptedAt: "2025-12-20T10:00:00Z",
    expectedSalary: 20000000,
    yearsOfExperience: 3,
    skills: ["Digital Marketing", "Content Writing", "SEO", "Social Media"],
  },
]

export const notifications: Notification[] = [
  {
    id: "notif-1",
    userId: "P-010",
    title: "New Leave Request",
    message: "Tran Thi Giang has submitted a leave request for approval",
    type: "leave_request",
    isRead: false,
    actionUrl: "/leave/requests",
    createdAt: "2026-01-18T08:00:00Z",
  },
  {
    id: "notif-2",
    userId: "P-003",
    title: "Interview Scheduled",
    message: "Interview with Nguyen Minh Tuan scheduled for tomorrow at 10:00 AM",
    type: "interview",
    isRead: false,
    actionUrl: "/recruitment/interviews",
    createdAt: "2026-01-07T15:00:00Z",
  },
  {
    id: "notif-3",
    userId: "P-003",
    title: "Contract Expiring Soon",
    message: "Nguyen Van A's probation contract expires in 7 days (2026-01-25)",
    type: "contract_warning",
    isRead: false,
    actionUrl: "/employees?id=P-001", // Assuming P-001 is Nguyen Van A
    createdAt: "2026-01-18T09:00:00Z",
  },
  {
    id: "notif-4",
    userId: "P-003",
    title: "Employee Birthday",
    message: "Today is Tran Thi B's birthday! 🎂",
    type: "birthday",
    isRead: false,
    actionUrl: "/employees?id=P-002",
    createdAt: "2026-01-18T00:00:00Z",
  },
]

export const auditLogs: AuditLogEntry[] = []

export const shifts: Shift[] = [
  {
    id: "shift-1",
    name: "Morning Shift",
    startTime: "08:00",
    endTime: "17:00",
    breakDuration: 60,
    gracePeriod: 15,
    isDefault: true,
  },
  {
    id: "shift-2",
    name: "Afternoon Shift",
    startTime: "13:00",
    endTime: "22:00",
    breakDuration: 60,
    gracePeriod: 15,
    isDefault: false,
  },
  {
    id: "shift-3",
    name: "Night Shift",
    startTime: "22:00",
    endTime: "07:00",
    breakDuration: 60,
    gracePeriod: 15,
    isDefault: false,
  },
]
