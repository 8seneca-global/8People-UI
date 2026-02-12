// Mock data for the 8People CMS - O-S-C-P Model
// O = Organizational Unit, S = Position, C = Job Classification, P = Person (Employee)

export interface OrganizationalUnit {
  id: string;
  code: string;
  name: string;
  abbreviation?: string;
  parentId?: string;
  costCenter?: string;
  managerPositionId?: string;
  validFrom: string;
  validTo?: string;
  status: "active" | "inactive";
  description?: string;
  level: number; // 1=Company, 2=Division, 3=Department, 4=Team
  unitType: "company" | "division" | "department" | "team";
}

export interface JobClassification {
  id: string;
  code: string;
  title: string;
  jobFamily: string;
  jobLevel: string;
  payGradeGroup: string;
  standardHours: number;
  flsaStatus: "exempt" | "non-exempt";
  description?: string;
  requirements: string[];
  responsibilities: string[];
  competencies: string[];
  status: "active" | "inactive";
}

export interface Position {
  id: string;
  code: string;
  title: string;
  jobClassificationId: string;
  jobClassificationTitle: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  parentPositionId?: string;
  parentPositionTitle?: string;
  costCenter?: string;
  fte: number;
  validFrom: string;
  validTo?: string;
  status: "active" | "inactive";
  hiringStatus: "filled" | "vacant" | "hiring";
  incumbentId?: string;
  incumbentName?: string;
  focusArea?: string;
  workMode?: "onsite" | "hybrid" | "remote";
  officeLocation?: string;
}

export interface EmployeeAddress {
  fullAddress: string;
}

export interface EmployeeTaxInfo {
  personalTaxCode: string;
  taxDependents: number;
  socialInsuranceBookNumber: string;
  initialRegistrationHospitalCode: string;
}

export interface EmployeeBankInfo {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface EmployeeEmergencyContact {
  contactPersonName: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface EmployeeEducation {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
}

export interface EmployeeContract {
  contractNumber: string;
  contractType: string;
  startDate: string;
  endDate: string;
  signDate: string; // Added signDate field
  attachmentFile?: string;
}

export type LeaveRequestStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";



export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approvers: {
    employeeId: string;
    employeeName: string;
    status: "pending" | "approved" | "rejected";
    comment?: string;
    respondedAt?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName?: string; // Added employee name
  department?: string; // Added department
  leaveTypeId: string;
  totalEntitlement: number;
  used: number;
  pending: number;
  carryForward: number;
  available: number;
  year: number;
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
  status: "present" | "late" | "early_leave" | "absent" | "missing" | "on_leave" | "weekend" | "holiday" | "not_checked_in" | "annual_leave" | "unpaid_leave" | "work_from_home" | "sick_leave" | "marriage_leave" | "social_insurance_paid"
  totalHours?: number
  overtime?: number
  lateMinutes?: number
  earlyMinutes?: number
  source: "web" | "mobile" | "fingerprint" | "import"
  notes?: string
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  gracePeriod: number;
  isDefault: boolean;
}

export type CandidateStage =
  | "new"
  | "screening"
  | "interviewing"
  | "testing"
  | "offering"
  | "hired"
  | "rejected";

export interface JobRequisition {
  id: string;
  title: string;
  positionId?: string;
  positionCode?: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  jobClassificationId?: string;
  jobClassificationTitle: string; // Added jobClassificationTitle (already present in updates, but good to have)
  description: string;
  requirements: string[];
  salaryRange?: { min: number; max: number; currency: string };
  salaryHidden?: boolean; // Added salary hidden option (deal)
  employmentType: "full-time" | "part-time" | "contract" | "intern";
  status: "draft" | "open" | "closed" | "on_hold";
  openings: number;
  hired: number;
  createdBy: string;
  createdAt: string;
  closingDate?: string;
  publishPlatforms?: string[]; // Added publish platforms
  jdFile?: string; // Added JD file
}

export interface Candidate {
  id: string;
  jobRequisitionId: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeFile?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  stage: CandidateStage;
  source:
  | "career_page"
  | "linkedin"
  | "referral"
  | "agency"
  | "topcv"
  | "vietnamworks"
  | "other";
  referredBy?: string;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  rating?: number;
  rejectionReason?: string;
  interviews?: Interview[];
  aiCvScore?: number; // AI CV score (0-100)
  aiCvAnalysis?: string; // AI analysis summary
  offerAccepted?: boolean; // Track if offer was accepted
  offerAcceptedAt?: string;
  expectedSalary?: number;
  yearsOfExperience?: number;
  skills?: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  scheduledAt: string;
  duration: number;
  interviewers: string[];
  interviewerNames?: string[]; // Added interviewer names
  type: "phone" | "video" | "onsite" | "technical" | "hr";
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  meetingLink?: string; // Added meeting link
  location?: string; // Added location for onsite
  feedback?: {
    interviewerId: string;
    rating: number;
    strengths?: string;
    weaknesses?: string;
    recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
  | "leave_request"
  | "leave_approved"
  | "leave_rejected"
  | "interview"
  | "onboarding"
  | "announcement"
  | "system";
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  changeType: "self" | "hr" | "admin" | "system";
}

export interface Employee {
  id: string;
  code: string; // P-001, EMP-001
  fullName: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;

  // O-S-C-P relationships
  positionId: string;
  positionCode: string;
  positionTitle: string;
  jobClassificationId: string;
  jobClassificationTitle: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  costCenter?: string;

  // Relations from API
  organizationalUnit?: {
    id: string;
    name: string;
    code: string;
  } | null;
  position?: {
    id: string;
    title: string;
    code: string;
  } | null;
  jobClassification?: {
    id: string;
    title: string;
    code: string;
  } | null;
  lineManager?: {
    id: string;
    fullName: string;
  } | null;
  user?: any;

  // Derived from position hierarchy
  lineManagerId?: string;
  lineManagerName?: string;

  // Matrix management (optional secondary reporting)
  matrixManagerId?: string;
  matrixManagerName?: string;

  status: "pending" | "active" | "terminated" | string;
  onboardingStatus: {
    emailSent: boolean;
    accountActivated: boolean;
    profileCompleted: boolean;
  };

  employeeId?: string;
  jobTitle?: string;
  client?: string;
  startDate?: string | Date;
  fte: number;

  cellphone?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;

  nationalIdNumber?: string;
  nationalIdIssueDate?: string;
  nationalIdIssuePlace?: string;
  citizenshipIdFile?: string;

  birthRegisterAddress?: EmployeeAddress;
  permanentAddress?: EmployeeAddress;
  currentAddress?: EmployeeAddress;
  taxInfo?: EmployeeTaxInfo;
  bankInfo?: EmployeeBankInfo;
  emergencyContact?: EmployeeEmergencyContact;
  education?: EmployeeEducation[];
  contracts?: EmployeeContract[];
  auditLog?: AuditLogEntry[];
}

export interface LeaveType {
  id: string;
  name: string;
  description: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForwardDays: number;
  color: string;
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
];

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
    requirements: [
      "MBA or equivalent",
      "15+ years executive experience",
      "Strategic leadership",
    ],
    responsibilities: [
      "Set company vision and strategy",
      "Lead executive team",
      "Stakeholder management",
    ],
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
    requirements: [
      "CS degree or equivalent",
      "10+ years tech leadership",
      "Architecture expertise",
    ],
    responsibilities: [
      "Technology roadmap",
      "Engineering culture",
      "Technical decisions",
    ],
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
    requirements: [
      "HR degree or certification",
      "5+ years HR experience",
      "Employment law knowledge",
    ],
    responsibilities: [
      "HR policy development",
      "Employee relations",
      "Recruitment oversight",
    ],
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
    responsibilities: [
      "Recruitment support",
      "Onboarding",
      "HR administration",
    ],
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
    requirements: [
      "5+ years development",
      "Leadership experience",
      "Technical expertise",
    ],
    responsibilities: [
      "Team leadership",
      "Code review",
      "Technical guidance",
      "Sprint planning",
    ],
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
    requirements: [
      "5+ years software development",
      "System design",
      "Mentoring ability",
    ],
    responsibilities: [
      "System design",
      "Code development",
      "Code review",
      "Mentor juniors",
    ],
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
    responsibilities: [
      "Feature development",
      "Bug fixes",
      "Unit testing",
      "Documentation",
    ],
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
    requirements: [
      "Marketing degree",
      "2+ years marketing experience",
      "Digital marketing",
    ],
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
];

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
  // HR Manager
  {
    id: "S-011",
    code: "S-011",
    title: "HR Manager",
    jobClassificationId: "C-003",
    jobClassificationTitle: "HR Manager",
    organizationalUnitId: "O-011",
    organizationalUnitName: "HR Department",
    parentPositionId: "S-001",
    parentPositionTitle: "Chief Executive Officer",
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
];

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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2020-01-01",
    fte: 1.0,
    cellphone: "+84 901 234 001",
    dateOfBirth: "1975-03-15",
    gender: "Male",
    contracts: [
      {
        contractNumber: "CT-2020-001",
        contractType: "Official",
        startDate: "2020-01-01",
        endDate: "2025-12-31",
        signDate: "2020-01-01", // Same as startDate for the initial contract
      },
      {
        contractNumber: "CT-2025-002",
        contractType: "Contract Extension",
        startDate: "2026-01-01",
        endDate: "2029-12-31",
        signDate: "2025-12-15", // Earlier than startDate
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2021-01-15",
    fte: 1.0,
    cellphone: "+84 901 234 002",
    dateOfBirth: "1980-06-20",
    gender: "Female",
    contracts: [
      {
        contractNumber: "CT-2021-001",
        contractType: "Official",
        startDate: "2021-01-15",
        endDate: "2024-01-14",
        signDate: "2021-01-15",
      },
      {
        contractNumber: "CT-2024-002",
        contractType: "Contract Renewal",
        startDate: "2024-01-15",
        endDate: "2027-01-14",
        signDate: "2024-01-01",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2021-03-01",
    fte: 1.0,
    cellphone: "+84 901 234 003",
    dateOfBirth: "1985-09-10",
    gender: "Male",
    contracts: [
      {
        contractNumber: "CT-2021-002",
        contractType: "Official",
        startDate: "2021-03-01",
        endDate: "2024-02-29",
        signDate: "2021-03-01",
      },
      {
        contractNumber: "CT-2024-003",
        contractType: "Contract Extension",
        startDate: "2024-03-01",
        endDate: "2027-02-28",
        signDate: "2024-02-20",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2022-01-10",
    fte: 1.0,
    cellphone: "+84 901 234 004",
    dateOfBirth: "1990-12-05",
    gender: "Female",
    contracts: [
      {
        contractNumber: "CT-2022-005",
        contractType: "Probation",
        startDate: "2022-01-10",
        endDate: "2022-04-09",
        signDate: "2022-01-10",
      },
      {
        contractNumber: "CT-2022-006",
        contractType: "Official",
        startDate: "2022-04-10",
        endDate: "2025-04-09",
        signDate: "2022-04-01",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2022-02-01",
    fte: 1.0,
    cellphone: "+84 901 234 010",
    dateOfBirth: "1988-04-15",
    gender: "Male",
    contracts: [
      {
        contractNumber: "CT-2021-003",
        contractType: "Junior Engineer",
        startDate: "2021-06-01",
        endDate: "2022-01-31",
        signDate: "2021-06-01",
      },
      {
        contractNumber: "CT-2022-007",
        contractType: "Mid-Level Engineer",
        startDate: "2022-02-01",
        endDate: "2023-12-31",
        signDate: "2022-02-01",
      },
      {
        contractNumber: "CT-2024-004",
        contractType: "Promotion to Team Lead",
        startDate: "2024-01-01",
        endDate: "2027-01-01",
        signDate: "2024-01-01",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2022-03-15",
    fte: 1.0,
    cellphone: "+84 901 234 011",
    dateOfBirth: "1990-07-20",
    gender: "Male",
    contracts: [
      {
        contractNumber: "CT-2022-001",
        contractType: "Intern",
        startDate: "2022-01-15",
        endDate: "2022-03-14",
        signDate: "2022-01-15",
      },
      {
        contractNumber: "CT-2022-002",
        contractType: "Probation",
        startDate: "2022-03-15",
        endDate: "2022-06-14",
        signDate: "2022-03-15",
      },
      {
        contractNumber: "CT-2022-003",
        contractType: "Official",
        startDate: "2022-06-15",
        endDate: "2025-06-14",
        signDate: "2022-06-10",
      },
      {
        contractNumber: "CT-2025-001",
        contractType: "Salary Increase",
        startDate: "2025-01-01",
        endDate: "2028-01-01",
        signDate: "2024-12-20",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2022-04-01",
    fte: 1.0,
    cellphone: "+84 901 234 012",
    dateOfBirth: "1991-11-30",
    gender: "Female",
    contracts: [
      {
        contractNumber: "CT-2022-004",
        contractType: "Official",
        startDate: "2022-04-01",
        endDate: "2025-03-31",
        signDate: "2022-04-01",
      },
      {
        contractNumber: "CT-2024-001",
        contractType: "Promotion",
        startDate: "2024-06-01",
        endDate: "2027-06-01",
        signDate: "2024-05-25",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2023-01-10",
    fte: 1.0,
    cellphone: "+84 901 234 013",
    dateOfBirth: "1993-02-14",
    gender: "Male",
    contracts: [
      {
        contractNumber: "CT-2023-001",
        contractType: "Junior Engineer",
        startDate: "2023-01-20",
        endDate: "2023-12-31",
        signDate: "2023-01-20",
      },
      {
        contractNumber: "CT-2024-005",
        contractType: "Mid-Level Engineer",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        signDate: "2024-01-01",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2024-01-02",
    fte: 1.0,
    cellphone: "+84 901 234 014",
    dateOfBirth: "1998-08-25",
    gender: "Male",
    contracts: [
      {
        contractNumber: "CT-2024-006",
        contractType: "Intern",
        startDate: "2023-07-01",
        endDate: "2023-12-31",
        signDate: "2023-07-01",
      },
      {
        contractNumber: "CT-2024-007",
        contractType: "Junior Engineer",
        startDate: "2024-01-02",
        endDate: "2025-01-01",
        signDate: "2024-01-02",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2022-06-01",
    fte: 1.0,
    cellphone: "+84 901 234 020",
    dateOfBirth: "1987-05-18",
    gender: "Female",
    contracts: [
      {
        contractNumber: "CT-2022-008",
        contractType: "Official",
        startDate: "2022-06-01",
        endDate: "2025-05-31",
        signDate: "2022-06-01",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2023-03-01",
    fte: 1.0,
    cellphone: "+84 901 234 030",
    dateOfBirth: "1992-10-12",
    gender: "Female",
    contracts: [
      {
        contractNumber: "CT-2023-002",
        contractType: "Official",
        startDate: "2023-03-01",
        endDate: "2026-02-28",
        signDate: "2023-03-01",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2023-04-15",
    fte: 1.0,
    cellphone: "+84 901 234 031",
    dateOfBirth: "1989-01-28",
    gender: "Male",
    contracts: [
      {
        contractNumber: "CT-2023-003",
        contractType: "Official",
        startDate: "2023-04-15",
        endDate: "2026-04-14",
        signDate: "2023-04-15",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2022-01-10",
    fte: 1.0,
    cellphone: "+84 901 234 005",
    dateOfBirth: "1991-05-20",
    gender: "Female",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2024-01-02",
    fte: 1.0,
    cellphone: "+84 901 234 006",
    dateOfBirth: "1999-03-10",
    gender: "Female",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2023-03-01",
    fte: 1.0,
    cellphone: "+84 901 234 007",
    dateOfBirth: "1993-08-15",
    gender: "Male",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2023-04-15",
    fte: 1.0,
    cellphone: "+84 901 234 008",
    dateOfBirth: "1990-11-01",
    gender: "Female",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2023-01-10",
    fte: 1.0,
    cellphone: "+84 901 234 009",
    dateOfBirth: "1992-07-07",
    gender: "Male",
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
    onboardingStatus: {
      emailSent: true,
      accountActivated: true,
      profileCompleted: true,
    },
    startDate: "2024-01-02",
    fte: 1.0,
    cellphone: "+84 901 234 006-alt",
    dateOfBirth: "1999-03-10",
    gender: "Female",
  },
];

export const leaveTypes: LeaveType[] = [
  {
    id: "lt-1",
    name: "Annual Leave",
    description: "Paid time off",
    defaultDays: 14,
    carryForward: true,
    maxCarryForwardDays: 5,
    color: "#3B82F6",
  },
  {
    id: "lt-2",
    name: "Sick Leave",
    description: "Medical leave",
    defaultDays: 0,
    carryForward: false,
    maxCarryForwardDays: 0,
    color: "#9CA3AF",
  },
];

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
      {
        employeeId: "P-010",
        employeeName: "Hoang Van Em",
        status: "approved",
        respondedAt: "2026-01-10T09:00:00Z",
      },
    ],
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
      {
        employeeId: "P-010",
        employeeName: "Hoang Van Em",
        status: "approved",
        respondedAt: "2026-01-12T14:00:00Z",
      },
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
    approvers: [
      { employeeId: "P-002", employeeName: "Tran Thi Binh", status: "pending" },
    ],
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
      {
        employeeId: "P-001",
        employeeName: "Nguyen Van An",
        status: "approved",
        respondedAt: "2026-01-03T10:00:00Z",
      },
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
      {
        employeeId: "P-002",
        employeeName: "Tran Thi Binh",
        status: "approved",
        respondedAt: "2026-01-10T11:00:00Z",
      },
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
      {
        employeeId: "P-002",
        employeeName: "Tran Thi Binh",
        status: "approved",
        respondedAt: "2026-01-15T09:00:00Z",
      },
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
      {
        employeeId: "P-002",
        employeeName: "Tran Thi Binh",
        status: "approved",
        respondedAt: "2026-01-20T14:00:00Z",
      },
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
    startDate: "2026-01-08",
    endDate: "2026-01-08",
    totalDays: 1,
    reason: "Personal day off",
    status: "approved",
    approvers: [
      {
        employeeId: "P-001",
        employeeName: "Nguyen Van An",
        status: "approved",
        respondedAt: "2026-01-05T10:00:00Z",
      },
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
      {
        employeeId: "P-002",
        employeeName: "Tran Thi Binh",
        status: "approved",
        respondedAt: "2026-01-12T08:00:00Z",
      },
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
    approvers: [
      { employeeId: "P-001", employeeName: "Nguyen Van An", status: "pending" },
    ],
    createdAt: "2026-01-12T10:00:00Z",
    updatedAt: "2026-01-12T10:00:00Z",
  },
];

export const leaveBalances: LeaveBalance[] = employees.map((emp) => {
  const empNum = Number.parseInt(emp.id.replace("P-", "")) || 0;
  const usedDays = (empNum * 3) % 10; // deterministic used days
  const pendingDays = empNum % 3; // deterministic pending days
  return {
    employeeId: emp.id,
    employeeName: emp.fullName,
    department: emp.organizationalUnitName,
    leaveTypeId: "lt-1",
    totalEntitlement: 14,
    used: usedDays,
    pending: pendingDays,
    carryForward: empNum % 4,
    available: Math.max(0, 14 - usedDays - pendingDays),
    year: 2026,
  };
});

export interface LeaveHistoryEntry {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "approved" | "rejected" | "cancelled";
  approvedBy: string;
  approvedAt: string;
  notes?: string;
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
  // P-005 Hoang Van Em - 5 days used (NOTE: Employee ID P-005 was Nguyen Thi Anh in original, but data implies Hoang Van Em is meant here based on leave history.)
  {
    id: "lh-005-1",
    employeeId: "P-010", // Corrected to P-010 based on common line manager 'Hoang Van Em'
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
    id: "lh-005-2",
    employeeId: "P-010", // Corrected to P-010
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
  // P-006 Nguyen Thi Phuong - 8 days used (NOTE: Employee ID P-006 was Vo Thi Bich Ngoc in original, but data implies Nguyen Thi Phuong based on leave history.)
  {
    id: "lh-006-1",
    employeeId: "P-006", // Assuming P-006 refers to Nguyen Thi Phuong based on context of used days
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
    employeeId: "P-006", // Assuming P-006 refers to Nguyen Thi Phuong
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
  // P-007 Tran Van Giang - 1 day used
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
  // P-008 Le Thi Huong - 4 days used
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
  // P-009 Pham Van Ich - 7 days used
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
  // P-010 Nguyen Thi Kim - 0 days used (new employee or saving leave) - Assuming P-010 refers to this new employee.
  // No leave history entries for this placeholder ID.

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

// Helper to generate attendance records for Jan-Feb 2026
const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const startDate = new Date("2026-01-01")
  const endDate = new Date("2026-02-28")

  const employeesToGenerate = employees.filter(e => e.status !== 'future')

  employeesToGenerate.forEach(emp => {
    const workingDays = emp.workingDays || [1, 2, 3, 4, 5] // Default Mon-Fri

    const curr = new Date(startDate)
    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0]
      const dayOfWeek = curr.getDay()

      // 1. Check Public Holiday
      const isHoliday = publicHolidays.some(h => h.date === dateStr && h.status === 'active')
      if (isHoliday) {
        // Optionally create holiday record or skip
        curr.setDate(curr.getDate() + 1)
        continue
      }

      // 2. Check Leave Requests (Approved) - Takes Priority
      const leave = leaveRequests.find(req =>
        req.employeeId === emp.id &&
        req.status === 'approved' &&
        dateStr >= req.startDate &&
        dateStr <= req.endDate
      )

      if (leave) {
        let status: any = 'on_leave'
        const typeName = leave.leaveTypeName.toLowerCase()
        if (typeName.includes('annual')) status = 'annual_leave'
        else if (typeName.includes('unpaid')) status = 'unpaid_leave'
        else if (typeName.includes('sick') || typeName.includes('social')) status = 'sick_leave' // or social_insurance_paid
        else if (typeName.includes('marriage')) status = 'marriage_leave'
        else if (typeName.includes('work from home')) status = 'work_from_home'

        // If WFH, we might want to simulate clock-in, but usually leave supersedes or is treated as a status.
        // User requested WFH as status label.
        // If it's a "Leave Request" for WFH, we treat it as such.

        records.push({
          id: `att-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          date: dateStr,
          clockIn: status === 'work_from_home' ? "08:00" : undefined, // WFH implies working?
          clockOut: status === 'work_from_home' ? "17:00" : undefined,
          status: status,
          totalHours: status === 'work_from_home' ? 8 : 0,
          source: "web"
        })
      }
      // 3. Normal Attendance Generation (if working day)
      else if (workingDays.includes(dayOfWeek)) {
        // Pseudo-random generation based on employee ID and date for deterministic results (avoids hydration errors)
        const seedStr = `${emp.id}-${dateStr}`
        let hash = 0
        for (let i = 0; i < seedStr.length; i++) {
          hash = ((hash << 5) - hash) + seedStr.charCodeAt(i)
          hash |= 0
        }
        const rand = Math.abs(hash) / 2147483647

        // A. Missing (No Check-in/out) - 2% chance
        if (rand < 0.02) {
          // Creates a "Missing" record (User wants to see "Missing" status if incomplete)
          // Case 1: No punch at all implies "Absent" usually, but user requirement says:
          // "Missing: ko check in hoặc check in thiếu thời gian vào/ra"
          // Let's simulate incomplete punch
          records.push({
            id: `att-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.fullName,
            date: dateStr,
            clockIn: "08:00", // Forgot out
            status: "missing",
            totalHours: 0,
            source: "fingerprint"
          })
        }
        // B. Late (> 9:00) - 5% chance
        else if (rand < 0.07) {
          const lateMin = (Math.floor(rand * 1000) % 60) + 1 // 1-60m
          const h = 9, m = lateMin
          const clockIn = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
          const clockOut = "18:00"

          // Calc hours: (18 - (9 + m/60)) - 1
          const hours = (18 - (9 + lateMin / 60)) - 1

          records.push({
            id: `att-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.fullName,
            date: dateStr,
            clockIn,
            clockOut,
            status: "late",
            lateMinutes: lateMin,
            totalHours: Number(hours.toFixed(2)),
            source: "fingerprint"
          })
        }
        // C. Early Leave (Total < 8h) - 5% chance
        else if (rand < 0.12) {
          // Arrive 08:00
          // Leave such that hours < 8.
          const hoursWorked = 4 + (Math.floor(rand * 100) % 35) / 10 // 4.0 to 7.5 hours
          const endHour = 8 + 1 + Math.floor(hoursWorked) // simplified break logic
          const endMin = Math.floor((hoursWorked % 1) * 60)

          records.push({
            id: `att-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.fullName,
            date: dateStr,
            clockIn: "08:00",
            clockOut: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
            status: "early_leave",
            totalHours: hoursWorked,
            source: "fingerprint"
          })
        }
        // D. Present (Normal)
        else {
          // 5. Present (>= 8 hours) - Random variations
          // Arrive between 07:45 and 08:59 (Strictly < 09:00)
          const arriveHour = 8
          // Random minute between -15 (07:45) and 59 (08:59)
          const arriveMinOffset = (Math.floor(rand * 1000) % 75) - 15

          const arriveDate = new Date(`2000-01-01T08:00:00`)
          arriveDate.setMinutes(arriveDate.getMinutes() + arriveMinOffset)

          // Manual 24h formatting to avoid locale issues
          const inHH = arriveDate.getHours().toString().padStart(2, '0')
          const inMM = arriveDate.getMinutes().toString().padStart(2, '0')
          const clockIn = `${inHH}:${inMM}`

          // Work duration: 8 hours + random overtime (0-2 hours)
          // Use a different hash based component for variation
          const hoursWorked = 8 + (Math.floor(rand * 500) % 200) / 100

          const leaveDate = new Date(arriveDate)
          leaveDate.setMinutes(leaveDate.getMinutes() + (hoursWorked + 1) * 60) // +1 hour lunch break

          const outHH = leaveDate.getHours().toString().padStart(2, '0')
          const outMM = leaveDate.getMinutes().toString().padStart(2, '0')
          const clockOut = `${outHH}:${outMM}`

          const inTime = arriveDate.getHours() + arriveDate.getMinutes() / 60
          const outTime = leaveDate.getHours() + leaveDate.getMinutes() / 60
          const total = Math.max(0, (outTime - inTime) - 1)

          records.push({
            id: `att-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.fullName,
            date: dateStr,
            clockIn,
            clockOut,
            status: "present",
            totalHours: Number(total.toFixed(2)),
            source: "fingerprint"
          })
        }
      }

      curr.setDate(curr.getDate() + 1)
    }
  })

  return records
}

export const attendanceRecords: AttendanceRecord[] = generateAttendanceRecords()

export const attendanceRecords: AttendanceRecord[] = [
  // January 2026 data
  {
    id: "att-1",
    employeeId: "P-011",
    employeeName: "Nguyen Van Phuc",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-06",
    clockIn: "08:55",
    clockOut: "18:05",
    status: "present",
    totalHours: 8.17,
    source: "fingerprint",
  },
  {
    id: "att-2",
    employeeId: "P-011",
    employeeName: "Nguyen Van Phuc",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-07",
    clockIn: "08:50",
    clockOut: "18:30",
    status: "present",
    totalHours: 8.67,
    overtime: 0.5,
    source: "fingerprint",
  },
  {
    id: "att-3",
    employeeId: "P-011",
    employeeName: "Nguyen Van Phuc",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-08",
    clockIn: "09:20",
    clockOut: "18:00",
    status: "late",
    totalHours: 7.67,
    lateMinutes: 20,
    source: "fingerprint",
  },
  {
    id: "att-4",
    employeeId: "P-012",
    employeeName: "Tran Thi Giang",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-06",
    clockIn: "08:45",
    clockOut: "18:15",
    status: "present",
    totalHours: 8.5,
    source: "fingerprint",
  },
  {
    id: "att-5",
    employeeId: "P-012",
    employeeName: "Tran Thi Giang",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-07",
    clockIn: "08:58",
    clockOut: "19:00",
    status: "present",
    totalHours: 9.03,
    overtime: 1,
    source: "fingerprint",
  },
  {
    id: "att-6",
    employeeId: "P-012",
    employeeName: "Tran Thi Giang",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-08",
    clockIn: "08:55",
    clockOut: "18:00",
    status: "present",
    totalHours: 8.08,
    source: "fingerprint",
  },
  {
    id: "att-7",
    employeeId: "P-013",
    employeeName: "Le Van Hung",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-06",
    clockIn: "09:05",
    clockOut: "18:00",
    status: "late",
    totalHours: 7.92,
    lateMinutes: 5,
    source: "fingerprint",
  },
  {
    id: "att-8",
    employeeId: "P-013",
    employeeName: "Le Van Hung",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-07",
    clockIn: "08:50",
    clockOut: "18:00",
    status: "present",
    totalHours: 8.17,
    source: "fingerprint",
  },
  {
    id: "att-9",
    employeeId: "P-014",
    employeeName: "Pham Van Khanh",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-06",
    clockIn: "08:30",
    clockOut: "17:45",
    status: "early_leave",
    totalHours: 8.25,
    earlyMinutes: 15,
    source: "fingerprint",
  },
  {
    id: "att-10",
    employeeId: "P-014",
    employeeName: "Pham Van Khanh",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-07",
    clockIn: "08:55",
    clockOut: "18:10",
    status: "present",
    totalHours: 8.25,
    source: "fingerprint",
  },
  {
    id: "att-11",
    employeeId: "P-020",
    employeeName: "Vo Thi Lan",
    department: "AI Department",
    organizationalUnitId: "O-032",
    date: "2026-01-06",
    clockIn: "08:40",
    clockOut: "18:30",
    status: "present",
    totalHours: 8.83,
    overtime: 0.5,
    source: "fingerprint",
  },
  {
    id: "att-12",
    employeeId: "P-020",
    employeeName: "Vo Thi Lan",
    department: "AI Department",
    organizationalUnitId: "O-032",
    date: "2026-01-07",
    clockIn: "08:55",
    clockOut: "19:15",
    status: "present",
    totalHours: 9.33,
    overtime: 1.25,
    source: "fingerprint",
  },
  {
    id: "att-13",
    employeeId: "P-030",
    employeeName: "Nguyen Thi Mai",
    department: "Marketing Department",
    organizationalUnitId: "O-021",
    date: "2026-01-06",
    clockIn: "08:50",
    clockOut: "18:00",
    status: "present",
    totalHours: 8.17,
    source: "fingerprint",
  },
  {
    id: "att-14",
    employeeId: "P-030",
    employeeName: "Nguyen Thi Mai",
    department: "Marketing Department",
    organizationalUnitId: "O-021",
    date: "2026-01-07",
    status: "on_leave",
    source: "fingerprint",
    notes: "Annual Leave",
  },
  {
    id: "att-15",
    employeeId: "P-031",
    employeeName: "Tran Van Nam",
    department: "Finance Department",
    organizationalUnitId: "O-012",
    date: "2026-01-06",
    clockIn: "08:45",
    clockOut: "18:05",
    status: "present",
    totalHours: 8.33,
    source: "fingerprint",
  },
  {
    id: "att-16",
    employeeId: "P-031",
    employeeName: "Tran Van Nam",
    department: "Finance Department",
    organizationalUnitId: "O-012",
    date: "2026-01-07",
    clockIn: "08:58",
    clockOut: "18:00",
    status: "present",
    totalHours: 8.03,
    source: "fingerprint",
  },
  {
    id: "att-17",
    employeeId: "P-003",
    employeeName: "Le Van Cuong",
    department: "HR Department",
    organizationalUnitId: "O-011",
    date: "2026-01-06",
    clockIn: "08:30",
    clockOut: "18:30",
    status: "present",
    totalHours: 9,
    overtime: 0.5,
    source: "fingerprint",
  },
  {
    id: "att-18",
    employeeId: "P-004",
    employeeName: "Pham Thi Dung",
    department: "HR Department",
    organizationalUnitId: "O-011",
    date: "2026-01-06",
    clockIn: "08:55",
    clockOut: "18:00",
    status: "present",
    totalHours: 8.08,
    source: "fingerprint",
  },
  {
    id: "att-19",
    employeeId: "P-010", // Hoang Van Em
    employeeName: "Hoang Van Em",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-06",
    clockIn: "08:35",
    clockOut: "19:00",
    status: "present",
    totalHours: 9.42,
    overtime: 1,
    source: "fingerprint",
  },
  {
    id: "att-20",
    employeeId: "P-010", // Hoang Van Em
    employeeName: "Hoang Van Em",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-07",
    clockIn: "08:40",
    clockOut: "18:45",
    status: "present",
    totalHours: 9.08,
    overtime: 0.75,
    source: "fingerprint",
  },
  // Add January 8 and 9 data
  {
    id: "att-21",
    employeeId: "P-003",
    employeeName: "Le Van Cuong",
    department: "HR Department",
    organizationalUnitId: "O-011",
    date: "2026-01-07",
    clockIn: "08:45",
    clockOut: "18:15",
    status: "present",
    totalHours: 8.5,
    source: "fingerprint",
  },
  {
    id: "att-22",
    employeeId: "P-003",
    employeeName: "Le Van Cuong",
    department: "HR Department",
    organizationalUnitId: "O-011",
    date: "2026-01-08",
    clockIn: "08:50",
    clockOut: "18:00",
    status: "present",
    totalHours: 8.17,
    source: "fingerprint",
  },
  {
    id: "att-23",
    employeeId: "P-004",
    employeeName: "Pham Thi Dung",
    department: "HR Department",
    organizationalUnitId: "O-011",
    date: "2026-01-07",
    clockIn: "09:10",
    clockOut: "18:00",
    status: "late",
    totalHours: 7.83,
    lateMinutes: 10,
    source: "fingerprint",
  },
  // Real-time dashboard data for January 12, 2026
  {
    id: "att-today-1",
    employeeId: "P-001",
    employeeName: "Nguyen Van An",
    department: "Executive",
    organizationalUnitId: "O-001",
    date: "2026-01-12",
    clockIn: "07:50",
    status: "present",
    source: "fingerprint",
  },
  {
    id: "att-today-2",
    employeeId: "P-002",
    employeeName: "Tran Thi Binh",
    department: "Technology Division",
    organizationalUnitId: "O-030",
    date: "2026-01-12",
    clockIn: "08:05",
    clockOut: "18:30",
    status: "present",
    totalHours: 10.42,
    source: "fingerprint",
  },
  {
    id: "att-today-3",
    employeeId: "P-003",
    employeeName: "Le Van Cuong",
    department: "HR Department",
    organizationalUnitId: "O-011",
    date: "2026-01-12",
    clockIn: "08:45",
    clockOut: "18:00",
    status: "present",
    totalHours: 8.25,
    source: "fingerprint",
  },
  {
    id: "att-today-4",
    employeeId: "P-011",
    employeeName: "Nguyen Van Phuc",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-12",
    clockIn: "09:15",
    status: "late",
    totalHours: undefined,
    lateMinutes: 15,
    source: "fingerprint",
  },
  {
    id: "att-today-5",
    employeeId: "P-012",
    employeeName: "Tran Thi Giang",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-12",
    clockIn: "08:55",
    clockOut: "18:15",
    status: "present",
    totalHours: 8.33,
    source: "fingerprint",
  },
  {
    id: "att-today-6",
    employeeId: "P-013",
    employeeName: "Le Van Hung",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-12",
    clockIn: "08:30",
    status: "present",
    source: "fingerprint",
  },
  {
    id: "att-today-7",
    employeeId: "P-014",
    employeeName: "Pham Van Khanh",
    department: "JavaScript Department",
    organizationalUnitId: "O-031",
    date: "2026-01-12",
    status: "not_checked_in",
    source: "fingerprint",
  },
  {
    id: "att-today-8",
    employeeId: "P-020",
    employeeName: "Vo Thi Lan",
    department: "AI Department",
    organizationalUnitId: "O-032",
    date: "2026-01-12",
    clockIn: "08:40",
    clockOut: "18:45",
    status: "present",
    totalHours: 10.08,
    overtime: 0.5,
    source: "fingerprint",
  },
  {
    id: "att-today-9",
    employeeId: "P-030",
    employeeName: "Nguyen Thi Mai",
    department: "Marketing Department",
    organizationalUnitId: "O-021",
    date: "2026-01-12",
    clockIn: "09:05",
    clockOut: "17:50",
    status: "early_leave",
    totalHours: 7.75,
    earlyMinutes: 10,
    source: "fingerprint",
  },
  {
    id: "att-today-10",
    employeeId: "P-031",
    employeeName: "Tran Van Nam",
    department: "Finance Department",
    organizationalUnitId: "O-012",
    date: "2026-01-12",
    clockIn: "08:35",
    status: "present",
    source: "fingerprint",
  },
  {
    id: "att-today-11",
    employeeId: "P-040", // Added P-040 for new Sales Department data
    employeeName: "Vu Thi Hoa",
    department: "Sales Department",
    organizationalUnitId: "O-022", // Assuming O-022 for Sales Department
    date: "2026-01-12",
    status: "absent",
    source: "fingerprint",
    notes: "No clock-in record",
  },
  {
    id: "att-today-12",
    employeeId: "P-041", // Added P-041 for new Customer Service data
    employeeName: "Hoang Van Duy",
    department: "Customer Service",
    organizationalUnitId: "O-040", // Assuming O-040 for Customer Service
    date: "2026-01-12",
    clockIn: "08:50",
    clockOut: "18:20",
    status: "present",
    totalHours: 8.5,
    source: "fingerprint",
  },
];

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
];

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
    skills: [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "Redis",
    ],
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
    skills: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "MLOps",
      "Computer Vision",
      "NLP",
    ],
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
      "Fresh graduate with good foundation in React basics. 1 internship experience. Shows willingness to learn and has completed several personal projects.",
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
    aiCvAnalysis:
      "Experience level does not meet Senior Developer requirements. Only 2 years of experience.",
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
    aiCvAnalysis:
      "Strong marketing background with 3 years experience. Good fit for Marketing Executive role.",
    offerAccepted: true,
    offerAcceptedAt: "2025-12-20T10:00:00Z",
    expectedSalary: 20000000,
    yearsOfExperience: 3,
    skills: ["Digital Marketing", "Content Writing", "SEO", "Social Media"],
  },
];

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
    message:
      "Interview with Nguyen Minh Tuan scheduled for tomorrow at 10:00 AM",
    type: "interview",
    isRead: false,
    actionUrl: "/recruitment/interviews",
    createdAt: "2026-01-07T15:00:00Z",
  },
];

export const auditLogs: AuditLogEntry[] = [];

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
];
