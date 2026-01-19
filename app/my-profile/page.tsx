"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Lock, Save, Users, History, FileText, Briefcase, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AvatarSection } from "@/components/profile/avatar-section"

interface Dependent {
  id: string
  fullName: string
  relationship: string
  dateOfBirth?: string
  effectiveDate: string
  nationalIdNumber?: string
  notes?: string
}

interface Transaction {
  id: string
  action: string
  reason: string
  text: string
  effectiveDate: string
  createdAt: string
  createdBy: string
  notes?: string
  contractNumber?: string
  contractType?: string
  positionTitle?: string
  organizationalUnitName?: string
  salaryChange?: {
    oldSalary?: number
    newSalary?: number
    currency?: string
  }
}

const mockUsersByRole: Record<
  string,
  {
    id: string
    employeeId: string
    fullName: string
    companyEmail: string
    jobTitle: string
    departmentName: string
    teamName: string
    startDate: string
    client: string
    cellphone: string
    personalEmail: string
    dateOfBirth: string
    gender: string
    nationality: string
    maritalStatus: string
    citizenshipIdNumber: string
    idIssueDate: string
    idIssuePlace: string
    birthRegisterAddress: string
    permanentAddress: string
    currentAddress: string
    personalTaxCode: string
    taxDependents: number
    socialInsuranceBookNumber: string
    initialRegistrationHospitalCode: string
    bankName: string
    bankBranch: string
    bankAccountNumber: string
    bankAccountHolderName: string
    emergencyContactName: string
    emergencyContactRelationship: string
    emergencyContactPhone: string
    emergencyContactEmail: string
    education: Array<{ degree: string; fieldOfStudy: string; institution: string; graduationYear: string }>
    contractNumber: string
    contractType: string
    contractStartDate: string
    contractEndDate: string
    dependents: Dependent[]
    transactions: Transaction[]
  }
> = {
  hr: {
    id: "hr-001",
    employeeId: "EMP-HR-001",
    fullName: "Nguyen Thi Mai",
    companyEmail: "mai.nguyen@8people.com",
    jobTitle: "HR Manager",
    departmentName: "Human Resources",
    teamName: "HR Operations",
    startDate: "2021-03-15",
    client: "",
    cellphone: "0901234567",
    personalEmail: "mai.personal@gmail.com",
    dateOfBirth: "1990-05-20",
    gender: "Female",
    nationality: "Vietnamese",
    maritalStatus: "Married",
    citizenshipIdNumber: "012345678901",
    idIssueDate: "2020-01-15",
    idIssuePlace: "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội",
    birthRegisterAddress: "123 Le Loi, District 1, Ho Chi Minh City",
    permanentAddress: "123 Le Loi, District 1, Ho Chi Minh City",
    currentAddress: "456 Nguyen Hue, District 1, Ho Chi Minh City",
    personalTaxCode: "8012345678",
    taxDependents: 1,
    socialInsuranceBookNumber: "SI-2021-001234",
    initialRegistrationHospitalCode: "HC-001",
    bankName: "Vietcombank",
    bankBranch: "District 1 Branch",
    bankAccountNumber: "1234567890123",
    bankAccountHolderName: "NGUYEN THI MAI",
    emergencyContactName: "Nguyen Van Tuan",
    emergencyContactRelationship: "Spouse",
    emergencyContactPhone: "0909876543",
    emergencyContactEmail: "tuan.nguyen@gmail.com",
    education: [
      {
        degree: "Bachelor",
        fieldOfStudy: "Human Resource Management",
        institution: "University of Economics HCMC",
        graduationYear: "2012",
      },
    ],
    contractNumber: "CTR-HR-2021-001",
    contractType: "Indefinite",
    contractStartDate: "2021-03-15",
    contractEndDate: "",
    dependents: [
      {
        id: "dep-hr-001",
        fullName: "Nguyen Van Tuan",
        relationship: "Spouse",
        dateOfBirth: "1988-03-10",
        effectiveDate: "2021-04-01",
        nationalIdNumber: "012345678902",
        notes: "Husband - tax deduction registered",
      },
      {
        id: "dep-hr-002",
        fullName: "Nguyen Minh Khoa",
        relationship: "Child",
        dateOfBirth: "2018-07-15",
        effectiveDate: "2021-04-01",
        nationalIdNumber: "",
        notes: "Son - under 18",
      },
    ],
    transactions: [
      {
        id: "txn-hr-001",
        action: "Hire",
        reason: "New Hire",
        text: "Hired as HR Specialist",
        effectiveDate: "2021-03-15",
        createdAt: "2021-03-10",
        createdBy: "System",
        contractNumber: "CTR-HR-2021-001",
        contractType: "Fixed-term",
        positionTitle: "HR Specialist",
        organizationalUnitName: "Human Resources",
        notes: "Initial hire from recruitment campaign Q1 2021",
      },
      {
        id: "txn-hr-002",
        action: "Promotion",
        reason: "Performance",
        text: "Promoted to HR Manager",
        effectiveDate: "2023-01-01",
        createdAt: "2022-12-20",
        createdBy: "Admin",
        positionTitle: "HR Manager",
        organizationalUnitName: "Human Resources",
        salaryChange: {
          oldSalary: 25000000,
          newSalary: 35000000,
          currency: "VND",
        },
        notes: "Excellent performance review - promoted to managerial role",
      },
      {
        id: "txn-hr-003",
        action: "Contract Renewal",
        reason: "Contract Extension",
        text: "Contract renewed to Indefinite",
        effectiveDate: "2023-03-15",
        createdAt: "2023-03-01",
        createdBy: "Admin",
        contractNumber: "CTR-HR-2023-001",
        contractType: "Indefinite",
        notes: "Converted from fixed-term to indefinite contract",
      },
    ],
  },
  employee: {
    id: "emp-001",
    employeeId: "EMP-DEV-001",
    fullName: "Tran Van Duc",
    companyEmail: "duc.tran@8people.com",
    jobTitle: "Senior Developer",
    departmentName: "Engineering",
    teamName: "Backend Team",
    startDate: "2022-06-01",
    client: "Asseco",
    cellphone: "0912345678",
    personalEmail: "duc.tran.personal@gmail.com",
    dateOfBirth: "1995-08-12",
    gender: "Male",
    nationality: "Vietnamese",
    maritalStatus: "Single",
    citizenshipIdNumber: "098765432109",
    idIssueDate: "2019-06-20",
    idIssuePlace: "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội",
    birthRegisterAddress: "789 Tran Hung Dao, District 5, Ho Chi Minh City",
    permanentAddress: "789 Tran Hung Dao, District 5, Ho Chi Minh City",
    currentAddress: "101 Pham Van Dong, Thu Duc City, Ho Chi Minh City",
    personalTaxCode: "8098765432",
    taxDependents: 0,
    socialInsuranceBookNumber: "SI-2022-005678",
    initialRegistrationHospitalCode: "HC-005",
    bankName: "Techcombank",
    bankBranch: "Thu Duc Branch",
    bankAccountNumber: "9876543210987",
    bankAccountHolderName: "TRAN VAN DUC",
    emergencyContactName: "Tran Thi Lan",
    emergencyContactRelationship: "Mother",
    emergencyContactPhone: "0987654321",
    emergencyContactEmail: "lan.tran@gmail.com",
    education: [
      {
        degree: "Bachelor",
        fieldOfStudy: "Computer Science",
        institution: "HCMC University of Technology",
        graduationYear: "2017",
      },
      {
        degree: "Master",
        fieldOfStudy: "Software Engineering",
        institution: "HCMC University of Technology",
        graduationYear: "2019",
      },
    ],
    contractNumber: "CTR-DEV-2022-015",
    contractType: "Fixed-term",
    contractStartDate: "2022-06-01",
    contractEndDate: "2025-06-01",
    dependents: [
      {
        id: "dep-emp-001",
        fullName: "Tran Thi Lan",
        relationship: "Mother",
        dateOfBirth: "1965-02-28",
        effectiveDate: "2023-01-01",
        nationalIdNumber: "098765432100",
        notes: "Mother - registered for tax deduction",
      },
    ],
    transactions: [
      {
        id: "txn-emp-001",
        action: "Hire",
        reason: "New Hire",
        text: "Hired as Junior Developer",
        effectiveDate: "2022-06-01",
        createdAt: "2022-05-25",
        createdBy: "HR Admin",
        contractNumber: "CTR-DEV-2022-015",
        contractType: "Fixed-term",
        positionTitle: "Junior Developer",
        organizationalUnitName: "Engineering",
        notes: "Hired through campus recruitment program",
      },
      {
        id: "txn-emp-002",
        action: "Promotion",
        reason: "Performance",
        text: "Promoted to Senior Developer",
        effectiveDate: "2024-01-01",
        createdAt: "2023-12-15",
        createdBy: "HR Manager",
        positionTitle: "Senior Developer",
        organizationalUnitName: "Engineering",
        salaryChange: {
          oldSalary: 20000000,
          newSalary: 30000000,
          currency: "VND",
        },
        notes: "Outstanding performance in backend development projects",
      },
      {
        id: "txn-emp-003",
        action: "Transfer",
        reason: "Project Assignment",
        text: "Transferred to Backend Team",
        effectiveDate: "2024-06-01",
        createdAt: "2024-05-20",
        createdBy: "HR Admin",
        positionTitle: "Senior Developer",
        organizationalUnitName: "Engineering - Backend Team",
        notes: "Assigned to Asseco client project",
      },
    ],
  },
}

const relationshipOptions = [
  "Spouse",
  "Child",
  "Parent",
  "Father",
  "Mother",
  "Sibling",
  "Brother",
  "Sister",
  "Grandparent",
  "Other",
]

export default function MyProfilePage() {
  const router = useRouter()
  const { currentRole } = useStore()
  const [hasChanges, setHasChanges] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const currentUser = mockUsersByRole[currentRole] || mockUsersByRole.employee

  const [profileData, setProfileData] = useState({
    cellphone: currentUser?.cellphone || "",
    personalEmail: currentUser?.personalEmail || "",
    dateOfBirth: currentUser?.dateOfBirth || "",
    gender: currentUser?.gender || "",
    nationality: currentUser?.nationality || "",
    maritalStatus: currentUser?.maritalStatus || "",
    jobTitle: currentUser?.jobTitle || "",
    client: currentUser?.client || "",
    citizenshipIdNumber: currentUser?.citizenshipIdNumber || "",
    idIssueDate: currentUser?.idIssueDate || "",
    idIssuePlace: currentUser?.idIssuePlace || "",
    birthRegisterAddress: currentUser?.birthRegisterAddress || "",
    permanentAddress: currentUser?.permanentAddress || "",
    currentAddress: currentUser?.currentAddress || "",
    personalTaxCode: currentUser?.personalTaxCode || "",
    taxDependents: currentUser?.taxDependents || 0,
    socialInsuranceBookNumber: currentUser?.socialInsuranceBookNumber || "",
    initialRegistrationHospitalCode: currentUser?.initialRegistrationHospitalCode || "",
    bankName: currentUser?.bankName || "",
    bankBranch: currentUser?.bankBranch || "",
    bankAccountNumber: currentUser?.bankAccountNumber || "",
    bankAccountHolderName: currentUser?.bankAccountHolderName || "",
    emergencyContactName: currentUser?.emergencyContactName || "",
    emergencyContactRelationship: currentUser?.emergencyContactRelationship || "",
    emergencyContactPhone: currentUser?.emergencyContactPhone || "",
    emergencyContactEmail: currentUser?.emergencyContactEmail || "",
    education: currentUser?.education || [],
  })

  const dependents = currentUser?.dependents || []
  const [transactions] = useState<Transaction[]>(currentUser?.transactions || [])
  const [transactionDetailOpen, setTransactionDetailOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    if (currentRole !== "employee" && currentRole !== "hr") {
      router.push("/")
    }
  }, [currentRole, router])

  useEffect(() => {
    const user = mockUsersByRole[currentRole] || mockUsersByRole.employee
    if (user) {
      setProfileData({
        cellphone: user.cellphone || "",
        personalEmail: user.personalEmail || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        nationality: user.nationality || "",
        maritalStatus: user.maritalStatus || "",
        jobTitle: user.jobTitle || "",
        client: user.client || "",
        citizenshipIdNumber: user.citizenshipIdNumber || "",
        idIssueDate: user.idIssueDate || "",
        idIssuePlace: user.idIssuePlace || "",
        birthRegisterAddress: user.birthRegisterAddress || "",
        permanentAddress: user.permanentAddress || "",
        currentAddress: user.currentAddress || "",
        personalTaxCode: user.personalTaxCode || "",
        taxDependents: user.taxDependents || 0,
        socialInsuranceBookNumber: user.socialInsuranceBookNumber || "",
        initialRegistrationHospitalCode: user.initialRegistrationHospitalCode || "",
        bankName: user.bankName || "",
        bankBranch: user.bankBranch || "",
        bankAccountNumber: user.bankAccountNumber || "",
        bankAccountHolderName: user.bankAccountHolderName || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactRelationship: user.emergencyContactRelationship || "",
        emergencyContactPhone: user.emergencyContactPhone || "",
        emergencyContactEmail: user.emergencyContactEmail || "",
        education: user.education || [],
      })
      // setDependents(user.dependents || []) // Removed as dependents are now read-only
      setHasChanges(false)
    }
  }, [currentRole])

  if (currentRole !== "employee" && currentRole !== "hr") {
    return null
  }

  const handleChange = (field: string, value: string | number) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...profileData.education]
    updated[index] = { ...updated[index], [field]: value }
    setProfileData((prev) => ({ ...prev, education: updated }))
    setHasChanges(true)
  }

  const addEducation = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", fieldOfStudy: "", institution: "", graduationYear: "" }],
    }))
    setHasChanges(true)
  }

  const removeEducation = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  const handleProfileImageChange = (imageData: string) => {
    setProfileImage(imageData)
    setHasChanges(true)
  }

  const openTransactionDetail = (txn: Transaction) => {
    setSelectedTransaction(txn)
    setTransactionDetailOpen(true)
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "Hire":
        return "bg-green-500/20 text-green-400"
      case "Promotion":
        return "bg-blue-500/20 text-blue-400"
      case "Transfer":
        return "bg-purple-500/20 text-purple-400"
      case "Contract Renewal":
        return "bg-amber-500/20 text-amber-400"
      case "Salary Adjustment":
        return "bg-cyan-500/20 text-cyan-400"
      case "Termination":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  return (
    <AdminLayout title="My Profile" subtitle="View and manage your personal information">
      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-6 p-6">
            <AvatarSection
              userName={currentUser?.fullName || ""}
              profileImage={profileImage || undefined}
              onImageChange={handleProfileImageChange}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-card-foreground">{currentUser?.fullName}</h2>
              <p className="text-muted-foreground">{currentUser?.jobTitle}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary">{currentUser?.departmentName}</Badge>
                {currentUser?.teamName && (
                  <Badge variant="outline" className="border-border">
                    {currentUser?.teamName}
                  </Badge>
                )}
              </div>
            </div>
            {hasChanges && (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="work" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="work" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Work Info
            </TabsTrigger>
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="dependents" className="gap-2">
              <Users className="h-4 w-4" />
              Dependents
            </TabsTrigger>
            <TabsTrigger value="contract" className="gap-2">
              <FileText className="h-4 w-4" />
              Contract
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Work Information */}
          <TabsContent value="work" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Work Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Employee ID</Label>
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  </div>
                  <Input value={currentUser?.employeeId || currentUser?.id} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Job Title</Label>
                  <Input
                    value={profileData.jobTitle}
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    placeholder="Enter job title"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Department</Label>
                  <Input value={currentUser?.departmentName} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Team</Label>
                  <Input value={currentUser?.teamName || "-"} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Client</Label>
                  <Input
                    value={profileData.client}
                    onChange={(e) => handleChange("client", e.target.value)}
                    placeholder="Enter client name"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Start Date</Label>
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  </div>
                  <Input value={currentUser?.startDate || "-"} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Company Email</Label>
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  </div>
                  <Input value={currentUser?.companyEmail} disabled className="bg-input opacity-60" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            {/* General Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">General Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <Input value={currentUser?.fullName} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Cellphone Number</Label>
                  <Input
                    value={profileData.cellphone}
                    onChange={(e) => handleChange("cellphone", e.target.value)}
                    placeholder="Enter cellphone"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Personal Email</Label>
                  <Input
                    value={profileData.personalEmail}
                    onChange={(e) => handleChange("personalEmail", e.target.value)}
                    placeholder="Enter personal email"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Date of Birth</Label>
                  <Input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className="w-full bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Gender</Label>
                  <Select value={profileData.gender} onValueChange={(v) => handleChange("gender", v)}>
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Nationality</Label>
                  <Input
                    value={profileData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    placeholder="Enter nationality"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Marital Status</Label>
                  <Select value={profileData.maritalStatus} onValueChange={(v) => handleChange("maritalStatus", v)}>
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Citizenship */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Citizenship</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-card-foreground">National ID / Passport Number</Label>
                  <Input
                    value={profileData.citizenshipIdNumber}
                    onChange={(e) => handleChange("citizenshipIdNumber", e.target.value)}
                    placeholder="Enter ID number"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Issue Date</Label>
                  <Input
                    type="date"
                    value={profileData.idIssueDate}
                    onChange={(e) => handleChange("idIssueDate", e.target.value)}
                    className="w-full bg-input border-border"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-card-foreground">Issue Place</Label>
                  <Input
                    value={profileData.idIssuePlace}
                    onChange={(e) => handleChange("idIssuePlace", e.target.value)}
                    placeholder="Enter issue place"
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Birth Register Address</Label>
                  <Input
                    value={profileData.birthRegisterAddress}
                    onChange={(e) => handleChange("birthRegisterAddress", e.target.value)}
                    placeholder="Enter birth register address"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Permanent Address</Label>
                  <Input
                    value={profileData.permanentAddress}
                    onChange={(e) => handleChange("permanentAddress", e.target.value)}
                    placeholder="Enter permanent address"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Current Address</Label>
                  <Input
                    value={profileData.currentAddress}
                    onChange={(e) => handleChange("currentAddress", e.target.value)}
                    placeholder="Enter current address"
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tax Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Tax Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Personal Tax Code</Label>
                  <Input
                    value={profileData.personalTaxCode}
                    onChange={(e) => handleChange("personalTaxCode", e.target.value)}
                    placeholder="Enter tax code"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Tax Dependents</Label>
                  <Input
                    type="number"
                    value={profileData.taxDependents}
                    onChange={(e) => handleChange("taxDependents", Number.parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Social Insurance Book Number</Label>
                  <Input
                    value={profileData.socialInsuranceBookNumber}
                    onChange={(e) => handleChange("socialInsuranceBookNumber", e.target.value)}
                    placeholder="Enter book number"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Initial Registration Hospital Code</Label>
                  <Input
                    value={profileData.initialRegistrationHospitalCode}
                    onChange={(e) => handleChange("initialRegistrationHospitalCode", e.target.value)}
                    placeholder="Enter hospital code"
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bank Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Bank Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Bank Name</Label>
                  <Input
                    value={profileData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    placeholder="Enter bank name"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Branch</Label>
                  <Input
                    value={profileData.bankBranch}
                    onChange={(e) => handleChange("bankBranch", e.target.value)}
                    placeholder="Enter branch (optional)"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Account Number</Label>
                  <Input
                    value={profileData.bankAccountNumber}
                    onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                    placeholder="Enter account number"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Account Holder Name</Label>
                  <Input
                    value={profileData.bankAccountHolderName}
                    onChange={(e) => handleChange("bankAccountHolderName", e.target.value)}
                    placeholder="Enter account holder name"
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Contact Person's Name</Label>
                  <Input
                    value={profileData.emergencyContactName}
                    onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                    placeholder="Enter contact name"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Relationship</Label>
                  <Input
                    value={profileData.emergencyContactRelationship}
                    onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                    placeholder="Enter relationship"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Phone</Label>
                  <Input
                    value={profileData.emergencyContactPhone}
                    onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                    placeholder="Enter phone"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Email</Label>
                  <Input
                    value={profileData.emergencyContactEmail}
                    onChange={(e) => handleChange("emergencyContactEmail", e.target.value)}
                    placeholder="Enter email"
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">Education</CardTitle>
                <Button size="sm" variant="outline" onClick={addEducation}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus mr-2 h-4 w-4"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">Education #{index + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeEducation(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-trash-2 h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                        </svg>
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-card-foreground">Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                          placeholder="Enter degree"
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-card-foreground">Field of Study</Label>
                        <Input
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleEducationChange(index, "fieldOfStudy", e.target.value)}
                          placeholder="Enter field of study"
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-card-foreground">Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                          placeholder="Enter institution"
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-card-foreground">Graduation Year</Label>
                        <Input
                          value={edu.graduationYear}
                          onChange={(e) => handleEducationChange(index, "graduationYear", e.target.value)}
                          placeholder="Enter graduation year"
                          className="bg-input border-border"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {profileData.education.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No education records. Click "Add Education" to add one.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dependents" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-card-foreground">Dependents</CardTitle>
                      <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                        <Lock className="mr-1 h-3 w-3" />
                        Admin Managed
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dependents registered for tax deduction purposes. Contact Admin to update.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dependents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-card-foreground">No dependents registered</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Contact your Admin to register dependents for tax deduction purposes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dependents.map((dep) => (
                      <div key={dep.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <span className="text-sm font-bold">
                              {dep.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-card-foreground">{dep.fullName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {dep.relationship}
                              </Badge>
                              {dep.dateOfBirth && (
                                <span className="text-xs text-muted-foreground">
                                  Born: {new Date(dep.dateOfBirth).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                              <div>
                                <span className="text-muted-foreground">Effective Date: </span>
                                <span className="text-card-foreground">
                                  {new Date(dep.effectiveDate).toLocaleDateString()}
                                </span>
                              </div>
                              {dep.nationalIdNumber && (
                                <div>
                                  <span className="text-muted-foreground">National ID: </span>
                                  <span className="text-card-foreground">{dep.nationalIdNumber}</span>
                                </div>
                              )}
                            </div>
                            {dep.notes && <p className="text-xs text-muted-foreground mt-2 italic">{dep.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            {dependents.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground text-base">Tax Deduction Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-secondary/50 p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{dependents.length}</div>
                      <div className="text-sm text-muted-foreground">Total Dependents</div>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {(dependents.length * 6200000).toLocaleString()} VND
                      </div>
                      <div className="text-sm text-muted-foreground">Monthly Deduction</div>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {(dependents.length * 6200000 * 12).toLocaleString()} VND
                      </div>
                      <div className="text-sm text-muted-foreground">Yearly Deduction</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    * Based on current tax regulation: 6,200,000 VND per dependent per month
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contract Details - All Locked */}
          <TabsContent value="contract" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-card-foreground">Contract Details</CardTitle>
                  <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                    <Lock className="mr-1 h-3 w-3" />
                    Company Managed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Contract Number</Label>
                  <Input value={currentUser?.contractNumber || "-"} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Contract Type</Label>
                  <Input value={currentUser?.contractType || "-"} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Contract Start Date</Label>
                  <Input value={currentUser?.contractStartDate || "-"} disabled className="bg-input opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Contract End Date</Label>
                  <Input
                    value={currentUser?.contractEndDate || "Indefinite"}
                    disabled
                    className="bg-input opacity-60"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-card-foreground">Transaction History</CardTitle>
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Read Only
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{transactions.length} records</p>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-card-foreground">No transaction history</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your employment history transactions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                          <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Action</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Description</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Created By</TableHead>
                          <TableHead className="text-muted-foreground font-medium w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions
                          .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                          .map((txn) => (
                            <TableRow key={txn.id} className="hover:bg-secondary/30">
                              <TableCell className="text-card-foreground">
                                {new Date(txn.effectiveDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge className={getActionBadgeColor(txn.action)}>{txn.action}</Badge>
                              </TableCell>
                              <TableCell className="text-card-foreground max-w-[300px] truncate">{txn.text}</TableCell>
                              <TableCell className="text-muted-foreground">{txn.createdBy}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => openTransactionDetail(txn)}>
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline View */}
            {transactions.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground text-base">Career Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      {transactions
                        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                        .map((txn, index) => (
                          <div key={txn.id} className="relative pl-10">
                            <div
                              className={`absolute left-2 top-1 h-5 w-5 rounded-full border-2 border-background ${
                                index === 0 ? "bg-primary" : "bg-secondary"
                              }`}
                            />
                            <div className="rounded-lg bg-secondary/30 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className={getActionBadgeColor(txn.action)}>{txn.action}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(txn.effectiveDate).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-medium text-card-foreground">{txn.text}</h4>
                              {txn.positionTitle && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Position: {txn.positionTitle}
                                  {txn.organizationalUnitName && ` • ${txn.organizationalUnitName}`}
                                </p>
                              )}
                              {txn.salaryChange && (
                                <p className="text-sm text-green-400 mt-1">
                                  Salary: {txn.salaryChange.oldSalary?.toLocaleString()} →{" "}
                                  {txn.salaryChange.newSalary?.toLocaleString()} {txn.salaryChange.currency}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Removed Dialog for Dependent Editing */}

      <Dialog open={transactionDetailOpen} onOpenChange={setTransactionDetailOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Transaction Details
              <Badge variant="outline" className="text-xs">
                <Lock className="mr-1 h-3 w-3" />
                Read Only
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Badge className={getActionBadgeColor(selectedTransaction.action)}>{selectedTransaction.action}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedTransaction.effectiveDate).toLocaleDateString()}
                </span>
              </div>

              <div className="rounded-lg bg-secondary/30 p-4">
                <h4 className="font-medium text-card-foreground mb-2">{selectedTransaction.text}</h4>
                <p className="text-sm text-muted-foreground">Reason: {selectedTransaction.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedTransaction.positionTitle && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Position</Label>
                    <p className="text-card-foreground">{selectedTransaction.positionTitle}</p>
                  </div>
                )}
                {selectedTransaction.organizationalUnitName && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Department</Label>
                    <p className="text-card-foreground">{selectedTransaction.organizationalUnitName}</p>
                  </div>
                )}
                {selectedTransaction.contractNumber && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Contract Number</Label>
                    <p className="text-card-foreground">{selectedTransaction.contractNumber}</p>
                  </div>
                )}
                {selectedTransaction.contractType && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Contract Type</Label>
                    <p className="text-card-foreground">{selectedTransaction.contractType}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.salaryChange && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                  <Label className="text-green-400 text-xs">Salary Change</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">
                      {selectedTransaction.salaryChange.oldSalary?.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-400 font-medium">
                      {selectedTransaction.salaryChange.newSalary?.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">{selectedTransaction.salaryChange.currency}</span>
                  </div>
                </div>
              )}

              {selectedTransaction.notes && (
                <div>
                  <Label className="text-muted-foreground text-xs">Notes</Label>
                  <p className="text-card-foreground text-sm mt-1">{selectedTransaction.notes}</p>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created by: {selectedTransaction.createdBy}</span>
                  <span>Created at: {new Date(selectedTransaction.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
