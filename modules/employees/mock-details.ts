export interface DetailedEmployeeInfo {
  id: string;
  middleName: string;
  // Personal Info
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  bloodGroup: string;
  religion: string;
  gender: string;
  race: string;
  motherLanguage: string;
  payslipPassword: string;
  documents: {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
  }[];

  // Contact Info
  mobilePhone1: string;
  mobilePhone2: string;
  homePhone1: string;
  homePhone2: string;
  companyPhone: string;
  extension: string;
  businessEmail: string;
  personalEmail: string;
  facebookUrl: string;
  twitterUrl: string;

  permanentAddress: {
    country: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    other: string;
    postalCode: string;
  };
  temporaryAddress: {
    country: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    other: string;
    postalCode: string;
  };

  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    remark: string;
  }[];

  // Organization & Job Info
  organizationJob: {
    jobTitle: string;
    orgStructure: {
      level: string;
      unit: string;
    }[];
    directLineManager: {
      code: string;
      name: string;
      byOrgStructure: boolean;
    };
    functionalManager: {
      code: string;
      name: string;
      byOrgStructure: boolean;
    };
  };

  // Contract Info
  salaryDetail: {
    baseSalary: number;
    currency: string;
    payCycle: string;
    allowances: { name: string; amount: number }[];
  };
  contracts: {
    id: string;
    contractNumber: string;
    type: string;
    status: "Active" | "Expired" | "Official" | "Pending";
    startDate: string;
    endDate: string;
    signDate: string;
  }[];

  // Relationship Info
  relationships: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string;
    occupation: string;
    jobTitle: string;
    nationality: string;
    taxDependency: boolean;
    taxStart: string;
    taxEnd: string;
  }[];
  transactions: {
    id: string;
    type:
      | "Personal Information"
      | "Contact Information"
      | "Organization & Job"
      | "Contract Information";
    reason: string;
    affectedDate: string;
    status: "Approved" | "Rejected" | "Pending";
    createdAt: string;
    details?: any; // To store the changes made in that transaction
  }[];
}

export const mockDetailedEmployees: Record<string, DetailedEmployeeInfo> = {
  "P-001": {
    id: "P-001",
    middleName: "Xuan",
    dateOfBirth: "07/10/1985",
    placeOfBirth: "Tinh Nam Dinh",
    nationality: "Viet Nam",
    bloodGroup: "O+",
    religion: "None",
    gender: "Male",
    race: "Kinh",
    motherLanguage: "Vietnamese",
    payslipPassword: "*************",
    documents: [
      {
        id: "doc-1",
        name: "ID_Card_Front.pdf",
        type: "pdf",
        size: "1.2MB",
        uploadedAt: "2024-01-15",
      },
      {
        id: "doc-2",
        name: "Degree_Certificate.jpg",
        type: "image",
        size: "3.4MB",
        uploadedAt: "2024-01-16",
      },
    ],
    mobilePhone1: "0353962286",
    mobilePhone2: "",
    homePhone1: "",
    homePhone2: "",
    companyPhone: "",
    extension: "",
    businessEmail: "thang.phamxuan@8seneca.com",
    personalEmail: "phamxuanthang0170@gmail.com",
    facebookUrl: "fb.com/thangpx",
    twitterUrl: "@thangpx",
    permanentAddress: {
      country: "Viet Nam",
      province: "Nam Dinh Province",
      district: "Y Yen District",
      ward: "Yen Dong Commune",
      street: "So 24 Thon Tien Thang",
      other: "",
      postalCode: "420000",
    },
    temporaryAddress: {
      country: "Viet Nam",
      province: "Ha Noi City",
      district: "Thanh Xuan District",
      ward: "Khuong Trung Ward",
      street: "283 Khuong Trung",
      other: "",
      postalCode: "100000",
    },
    emergencyContacts: [
      {
        name: "Nguyen Thi Thu",
        relationship: "Mother",
        phone: "0987654321",
        email: "",
        address: "Nam Dinh",
        remark: "",
      },
    ],
    organizationJob: {
      jobTitle: "Chief Technology Officer",
      orgStructure: [
        { level: "Tenant", unit: "8Seneca Vietnam" },
        { level: "Division", unit: "Information Technology Division" },
        { level: "Department", unit: "Core Applications" },
      ],
      directLineManager: {
        code: "100038",
        name: "Tran Dang Dung",
        byOrgStructure: true,
      },
      functionalManager: {
        code: "",
        name: "",
        byOrgStructure: false,
      },
    },
    salaryDetail: {
      baseSalary: 45000000,
      currency: "VND",
      payCycle: "Monthly",
      allowances: [
        { name: "Lunch", amount: 1000000 },
        { name: "Parking", amount: 200000 },
      ],
    },
    contracts: [
      {
        id: "CT-2025-002",
        contractNumber: "CT-2025-002",
        type: "Contract Extension",
        status: "Active",
        startDate: "Jan 1, 2026",
        endDate: "Dec 31, 2029",
        signDate: "Dec 15, 2025",
      },
      {
        id: "CT-2020-001",
        contractNumber: "CT-2020-001",
        type: "Official",
        status: "Expired",
        startDate: "Jan 1, 2020",
        endDate: "Dec 31, 2025",
        signDate: "Dec 20, 2019",
      },
    ],
    relationships: [
      {
        id: "rel-1",
        firstName: "Minh",
        middleName: "",
        lastName: "Pham Tuan",
        relationship: "Child",
        dateOfBirth: "18/11/2021",
        occupation: "Unemployed",
        jobTitle: "",
        nationality: "Viet Nam",
        taxDependency: true,
        taxStart: "01/01/2022",
        taxEnd: "",
      },
      {
        id: "rel-2",
        firstName: "Hue",
        middleName: "",
        lastName: "Trinh Thi",
        relationship: "Parent",
        dateOfBirth: "20/06/1955",
        occupation: "Unemployed",
        jobTitle: "",
        nationality: "Viet Nam",
        taxDependency: true,
        taxStart: "01/01/2024",
        taxEnd: "",
      },
    ],
    transactions: [
      {
        id: "TR-001",
        type: "Contract Information",
        reason: "Salary Increase",
        affectedDate: "01/05/2024",
        status: "Approved",
        createdAt: "2024-04-15T08:00:00Z",
        details: { baseSalary: 45000000 },
      },
      {
        id: "TR-002",
        type: "Organization & Job",
        reason: "Promotion to CTO",
        affectedDate: "15/06/2009",
        status: "Approved",
        createdAt: "2009-06-01T08:00:00Z",
        details: { jobTitle: "Chief Technology Officer" },
      },
    ],
  },
};
