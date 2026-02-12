export interface TransactionDetail {
  generalInfo: {
    employeeType: string;
    serviceStartDate: string;
    workingTime: string;
    employeeLevel: string;
    employeeBand: string;
    employeeCategory: string;
    employeeGroup: string;
    employeeSubGroup: string;
  };
  organizationJob: {
    jobTitle: string;
    orgStructure: { level: string; unit: string }[];
    directLineManager: string;
    functionalManager: string;
  };
  contractInfo: {
    category: string;
    contractNumber: string;
    startDate: string;
    endDate: string;
    duration: string;
    appendixNumber: string;
    signDate: string;
  };
  salaryInfo: {
    baseSalary: number;
    currency: string;
    payCycle: string;
    allowances: { name: string; amount: number }[];
  };
}

export interface EmployeeTransaction {
  id: string;
  action: string;
  status: "Approved" | "Pending" | "Rejected";
  isActive: boolean;
  effectiveDate: string;
  isRetroactive: boolean;
  retroactiveFromDate?: string;
  retroactiveToDate?: string;
  reason: string;
  details: TransactionDetail;
}

export const ACTION_REASONS: Record<string, string[]> = {
  Hiring: ["New Position", "Replacement", "Project Based"],
  "Extension of Probation": ["Unsatisfactory Performance"],
  "Probation Confirmation": ["Probation Completion"],
  Transfer: [
    "Restructuring",
    "Internal Recruitment",
    "New acquired skills",
    "Employee Request",
  ],
  "Contract Renewal": ["New contract"],
  Promotion: ["Organizational Requirement"],
  "Salary change": ["Annual Appraisal", "Restructuring"],
  Demotion: ["Performance", "Restructuring", "Disciplinary Action"],
  "Job rotation": [
    "Performance",
    "Restructuring",
    "Disciplinary Action",
    "Skill Enhancement",
  ],
  "Temporary Assignment": ["Acting New Role"],
  "Disciplinary Action": ["Misconduct", "Theft", "Fraud", "Criminal offense"],
  "Resignation Action": ["Voluntary", "Involuntary"],
  "Resignation reason": [
    "Contract end",
    "Disciplinary",
    "Personal matter",
    "Culture",
    "Career Development",
    "Salary and benefits",
  ],
};

export const mockTransactions: Record<string, EmployeeTransaction[]> = {
  "1": [
    {
      id: "TR-001",
      action: "Salary Increase",
      status: "Approved",
      isActive: true,
      effectiveDate: "2024-05-01",
      isRetroactive: false,
      reason: "Annual performance review",
      details: {
        generalInfo: {
          employeeType: "FTE",
          serviceStartDate: "2020-01-01",
          workingTime: "Full time",
          employeeLevel: "Level 4",
          employeeBand: "Professional",
          employeeCategory: "White Collar",
          employeeGroup: "Support",
          employeeSubGroup: "IT",
        },
        organizationJob: {
          jobTitle: "Senior Software Engineer",
          orgStructure: [
            { level: "Division", unit: "Engineering" },
            { level: "Department", unit: "Feature Team A" },
          ],
          directLineManager: "John Doe",
          functionalManager: "Jane Smith",
        },
        contractInfo: {
          category: "Indefinite",
          contractNumber: "CT-2020-001",
          startDate: "2020-01-01",
          endDate: "2030-01-01",
          duration: "10 Years",
          appendixNumber: "APP-001",
          signDate: "2019-12-15",
        },
        salaryInfo: {
          baseSalary: 55000000,
          currency: "VND",
          payCycle: "Monthly",
          allowances: [
            { name: "Lunch", amount: 1000000 },
            { name: "Parking", amount: 200000 },
          ],
        },
      },
    },
    {
      id: "TR-002",
      action: "Promotion",
      status: "Pending",
      isActive: false,
      effectiveDate: "2024-06-01",
      isRetroactive: true,
      retroactiveFromDate: "2024-05-15",
      reason: "Outstanding contribution to project X",
      details: {
        generalInfo: {
          employeeType: "FTE",
          serviceStartDate: "2020-01-01",
          workingTime: "Full time",
          employeeLevel: "Level 5",
          employeeBand: "Lead",
          employeeCategory: "White Collar",
          employeeGroup: "Management",
          employeeSubGroup: "Engineering Management",
        },
        organizationJob: {
          jobTitle: "Engineering Lead",
          orgStructure: [
            { level: "Division", unit: "Engineering" },
            { level: "Department", unit: "Platform Team" },
          ],
          directLineManager: "Alice Wonderland",
          functionalManager: "Bob Builder",
        },
        contractInfo: {
          category: "Indefinite",
          contractNumber: "CT-2024-005",
          startDate: "2024-06-01",
          endDate: "2034-06-01",
          duration: "10 Years",
          appendixNumber: "APP-012",
          signDate: "2024-05-20",
        },
        salaryInfo: {
          baseSalary: 75000000,
          currency: "VND",
          payCycle: "Monthly",
          allowances: [
            { name: "Mobile", amount: 500000 },
            { name: "Internet", amount: 300000 },
          ],
        },
      },
    },
  ],
};
