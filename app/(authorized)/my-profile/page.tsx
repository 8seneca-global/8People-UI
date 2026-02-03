"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Input } from "@/modules/core/components/ui/input";
import { Label } from "@/modules/core/components/ui/label";
import { Button } from "@/modules/core/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Badge } from "@/modules/core/components/ui/badge";
import { Lock, Save, Plus, Trash2 } from "lucide-react";

const mockUsersByRole: Record<
  string,
  {
    id: string;
    employeeId: string;
    fullName: string;
    companyEmail: string;
    jobTitle: string;
    departmentName: string;
    teamName: string;
    startDate: string;
    client: string;
    cellphone: string;
    personalEmail: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    maritalStatus: string;
    citizenshipIdNumber: string;
    idIssueDate: string;
    idIssuePlace: string;
    birthRegisterAddress: string;
    permanentAddress: string;
    currentAddress: string;
    personalTaxCode: string;
    taxDependents: number;
    socialInsuranceBookNumber: string;
    initialRegistrationHospitalCode: string;
    bankName: string;
    bankBranch: string;
    bankAccountNumber: string;
    bankAccountHolderName: string;
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    emergencyContactEmail: string;
    education: Array<{
      degree: string;
      fieldOfStudy: string;
      institution: string;
      graduationYear: string;
    }>;
    contractNumber: string;
    contractType: string;
    contractStartDate: string;
    contractEndDate: string;
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
    idIssuePlace:
      "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội",
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
    idIssuePlace:
      "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội",
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
  },
};

export default function MyProfilePage() {
  const router = useRouter();
  const { currentRole } = useStore();
  const [hasChanges, setHasChanges] = useState(false);

  const currentUser = mockUsersByRole[currentRole] || mockUsersByRole.employee;

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
    initialRegistrationHospitalCode:
      currentUser?.initialRegistrationHospitalCode || "",
    bankName: currentUser?.bankName || "",
    bankBranch: currentUser?.bankBranch || "",
    bankAccountNumber: currentUser?.bankAccountNumber || "",
    bankAccountHolderName: currentUser?.bankAccountHolderName || "",
    emergencyContactName: currentUser?.emergencyContactName || "",
    emergencyContactRelationship:
      currentUser?.emergencyContactRelationship || "",
    emergencyContactPhone: currentUser?.emergencyContactPhone || "",
    emergencyContactEmail: currentUser?.emergencyContactEmail || "",
    education: currentUser?.education || [],
  });

  useEffect(() => {
    if (currentRole !== "employee" && currentRole !== "hr") {
      router.push("/");
    }
  }, [currentRole, router]);

  useEffect(() => {
    const user = mockUsersByRole[currentRole] || mockUsersByRole.employee;
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
        initialRegistrationHospitalCode:
          user.initialRegistrationHospitalCode || "",
        bankName: user.bankName || "",
        bankBranch: user.bankBranch || "",
        bankAccountNumber: user.bankAccountNumber || "",
        bankAccountHolderName: user.bankAccountHolderName || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactRelationship: user.emergencyContactRelationship || "",
        emergencyContactPhone: user.emergencyContactPhone || "",
        emergencyContactEmail: user.emergencyContactEmail || "",
        education: user.education || [],
      });
      setHasChanges(false);
    }
  }, [currentRole]);

  if (currentRole !== "employee" && currentRole !== "hr") {
    return null;
  }

  const handleChange = (field: string, value: string | number) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...profileData.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfileData((prev) => ({ ...prev, education: updated }));
    setHasChanges(true);
  };

  const addEducation = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", fieldOfStudy: "", institution: "", graduationYear: "" },
      ],
    }));
    setHasChanges(true);
  };

  const removeEducation = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setHasChanges(false);
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="View and manage your personal information"
      />
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="text-2xl font-bold">
                  {currentUser?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "?"}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-card-foreground">
                  {currentUser?.fullName}
                </h2>
                <p className="text-muted-foreground">{currentUser?.jobTitle}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary">
                    {currentUser?.departmentName}
                  </Badge>
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
              <TabsTrigger value="work">Work Info</TabsTrigger>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="contract">Contract</TabsTrigger>
            </TabsList>

            {/* Work Information */}
            <TabsContent value="work" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">
                        Employee ID
                      </Label>
                      <Badge
                        variant="outline"
                        className="border-border text-muted-foreground text-xs"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    </div>
                    <Input
                      value={currentUser?.employeeId || currentUser?.id}
                      disabled
                      className="bg-input opacity-60"
                    />
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
                    <Input
                      value={currentUser?.departmentName}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Team</Label>
                    <Input
                      value={currentUser?.teamName || "-"}
                      disabled
                      className="bg-input opacity-60"
                    />
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
                      <Label className="text-muted-foreground">
                        Start Date
                      </Label>
                      <Badge
                        variant="outline"
                        className="border-border text-muted-foreground text-xs"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    </div>
                    <Input
                      value={currentUser?.startDate || "-"}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">
                        Company Email
                      </Label>
                      <Badge
                        variant="outline"
                        className="border-border text-muted-foreground text-xs"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    </div>
                    <Input
                      value={currentUser?.companyEmail}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              {/* General Information */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    General Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Full Name</Label>
                    <Input
                      value={currentUser?.fullName}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Cellphone Number
                    </Label>
                    <Input
                      value={profileData.cellphone}
                      onChange={(e) =>
                        handleChange("cellphone", e.target.value)
                      }
                      placeholder="Enter cellphone"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Personal Email
                    </Label>
                    <Input
                      value={profileData.personalEmail}
                      onChange={(e) =>
                        handleChange("personalEmail", e.target.value)
                      }
                      placeholder="Enter personal email"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Date of Birth
                    </Label>
                    <Input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        handleChange("dateOfBirth", e.target.value)
                      }
                      className="w-full bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Gender</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(v) => handleChange("gender", v)}
                    >
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
                      onChange={(e) =>
                        handleChange("nationality", e.target.value)
                      }
                      placeholder="Enter nationality"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Marital Status
                    </Label>
                    <Select
                      value={profileData.maritalStatus}
                      onValueChange={(v) => handleChange("maritalStatus", v)}
                    >
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
                  <CardTitle className="text-card-foreground">
                    Citizenship
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      National ID / Passport Number
                    </Label>
                    <Input
                      value={profileData.citizenshipIdNumber}
                      onChange={(e) =>
                        handleChange("citizenshipIdNumber", e.target.value)
                      }
                      placeholder="Enter ID number"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Issue Date</Label>
                    <Input
                      type="date"
                      value={profileData.idIssueDate}
                      onChange={(e) =>
                        handleChange("idIssueDate", e.target.value)
                      }
                      className="w-full bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-card-foreground">Issue Place</Label>
                    <Input
                      value={profileData.idIssuePlace}
                      onChange={(e) =>
                        handleChange("idIssuePlace", e.target.value)
                      }
                      placeholder="Enter issue place"
                      className="bg-input border-border"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Birth Register Address
                    </Label>
                    <Input
                      value={profileData.birthRegisterAddress}
                      onChange={(e) =>
                        handleChange("birthRegisterAddress", e.target.value)
                      }
                      placeholder="Enter birth register address"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Permanent Address
                    </Label>
                    <Input
                      value={profileData.permanentAddress}
                      onChange={(e) =>
                        handleChange("permanentAddress", e.target.value)
                      }
                      placeholder="Enter permanent address"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Current Address
                    </Label>
                    <Input
                      value={profileData.currentAddress}
                      onChange={(e) =>
                        handleChange("currentAddress", e.target.value)
                      }
                      placeholder="Enter current address"
                      className="bg-input border-border"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tax Information */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Tax Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Personal Tax Code
                    </Label>
                    <Input
                      value={profileData.personalTaxCode}
                      onChange={(e) =>
                        handleChange("personalTaxCode", e.target.value)
                      }
                      placeholder="Enter tax code"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Tax Dependents
                    </Label>
                    <Input
                      type="number"
                      value={profileData.taxDependents}
                      onChange={(e) =>
                        handleChange(
                          "taxDependents",
                          Number.parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Social Insurance Book Number
                    </Label>
                    <Input
                      value={profileData.socialInsuranceBookNumber}
                      onChange={(e) =>
                        handleChange(
                          "socialInsuranceBookNumber",
                          e.target.value,
                        )
                      }
                      placeholder="Enter book number"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Initial Registration Hospital Code
                    </Label>
                    <Input
                      value={profileData.initialRegistrationHospitalCode}
                      onChange={(e) =>
                        handleChange(
                          "initialRegistrationHospitalCode",
                          e.target.value,
                        )
                      }
                      placeholder="Enter hospital code"
                      className="bg-input border-border"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Bank Information
                  </CardTitle>
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
                      onChange={(e) =>
                        handleChange("bankBranch", e.target.value)
                      }
                      placeholder="Enter branch (optional)"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Account Number
                    </Label>
                    <Input
                      value={profileData.bankAccountNumber}
                      onChange={(e) =>
                        handleChange("bankAccountNumber", e.target.value)
                      }
                      placeholder="Enter account number"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Account Holder Name
                    </Label>
                    <Input
                      value={profileData.bankAccountHolderName}
                      onChange={(e) =>
                        handleChange("bankAccountHolderName", e.target.value)
                      }
                      placeholder="Enter account holder name"
                      className="bg-input border-border"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">
                      Contact Person's Name
                    </Label>
                    <Input
                      value={profileData.emergencyContactName}
                      onChange={(e) =>
                        handleChange("emergencyContactName", e.target.value)
                      }
                      placeholder="Enter contact name"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Relationship</Label>
                    <Input
                      value={profileData.emergencyContactRelationship}
                      onChange={(e) =>
                        handleChange(
                          "emergencyContactRelationship",
                          e.target.value,
                        )
                      }
                      placeholder="Enter relationship"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Phone</Label>
                    <Input
                      value={profileData.emergencyContactPhone}
                      onChange={(e) =>
                        handleChange("emergencyContactPhone", e.target.value)
                      }
                      placeholder="Enter phone"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Email</Label>
                    <Input
                      value={profileData.emergencyContactEmail}
                      onChange={(e) =>
                        handleChange("emergencyContactEmail", e.target.value)
                      }
                      placeholder="Enter email"
                      className="bg-input border-border"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-card-foreground">
                    Education
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={addEducation}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-secondary/30 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                          Education #{index + 1}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-card-foreground">Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "degree",
                                e.target.value,
                              )
                            }
                            placeholder="Enter degree"
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-card-foreground">
                            Field of Study
                          </Label>
                          <Input
                            value={edu.fieldOfStudy}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "fieldOfStudy",
                                e.target.value,
                              )
                            }
                            placeholder="Enter field of study"
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-card-foreground">
                            Institution
                          </Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "institution",
                                e.target.value,
                              )
                            }
                            placeholder="Enter institution"
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-card-foreground">
                            Graduation Year
                          </Label>
                          <Input
                            value={edu.graduationYear}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "graduationYear",
                                e.target.value,
                              )
                            }
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

            {/* Contract Details - All Locked */}
            <TabsContent value="contract" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-card-foreground">
                      Contract Details
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground text-xs"
                    >
                      <Lock className="mr-1 h-3 w-3" />
                      Company Managed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Contract Number
                    </Label>
                    <Input
                      value={currentUser?.contractNumber || "-"}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Contract Type
                    </Label>
                    <Input
                      value={currentUser?.contractType || "-"}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Contract Start Date
                    </Label>
                    <Input
                      value={currentUser?.contractStartDate || "-"}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Contract End Date
                    </Label>
                    <Input
                      value={currentUser?.contractEndDate || "Indefinite"}
                      disabled
                      className="bg-input opacity-60"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
