"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useStore } from "@/lib/store"
import {
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  FileText,
  Clock,
  Info,
  ChevronDown,
  ChevronRight,
  Users,
  UserX,
  AlertTriangle,
  Pencil,
  Download,
} from "lucide-react"
import type {
  Employee,
  EmployeeAddress,
  EmployeeEducation,
  EmployeeContract,
  EmployeeTransaction,
  EmployeeDependent,
  TransactionAction,
} from "@/lib/mock-data"
import { transactionReasons, resignationSubReasons, contractTypeOptions } from "@/lib/mock-data"

interface EmployeeDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  readOnly?: boolean
}

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"]
const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"]
const statusOptions = ["pending", "active", "future", "resigned"]
const relationshipOptions = ["Spouse", "Child", "Parent", "Sibling", "Other"]

const transactionActionLabels: Record<TransactionAction, string> = {
  hiring: "Hiring",
  extension_of_probation: "Extension of Probation",
  probation_confirmation: "Probation Confirmation",
  transfer: "Transfer",
  contract_renewal: "Contract Renewal",
  promotion: "Promotion",
  salary_change: "Salary Change",
  demotion: "Demotion",
  job_rotation: "Job Rotation",
  temporary_assignment: "Temporary Assignment",
  disciplinary_action: "Disciplinary Action",
  resignation: "Resignation",
  rehire: "Rehire",
}

const actionBadgeColors: Record<TransactionAction, string> = {
  hiring: "bg-success/20 text-success",
  extension_of_probation: "bg-warning/20 text-warning",
  probation_confirmation: "bg-success/20 text-success",
  transfer: "bg-info/20 text-info",
  contract_renewal: "bg-primary/20 text-primary",
  promotion: "bg-success/20 text-success",
  salary_change: "bg-primary/20 text-primary",
  demotion: "bg-warning/20 text-warning",
  job_rotation: "bg-info/20 text-info",
  temporary_assignment: "bg-info/20 text-info",
  disciplinary_action: "bg-destructive/20 text-destructive",
  resignation: "bg-destructive/20 text-destructive",
  rehire: "bg-success/20 text-success",
}

const contractStatusColors: Record<string, string> = {
  active: "bg-success/20 text-success",
  expired: "bg-muted/50 text-muted-foreground",
  upcoming: "bg-info/20 text-info",
  terminated: "bg-destructive/20 text-destructive",
}

const emptyAddress: EmployeeAddress = {
  fullAddress: "",
}

const emptyEducation: EmployeeEducation = {
  degree: "",
  fieldOfStudy: "",
  institution: "",
  graduationYear: "",
}

const emptyContract: EmployeeContract = {
  contractNumber: "",
  contractType: "",
  startDate: "",
  endDate: "",
  signDate: "",
}

const emptyDependent: EmployeeDependent = {
  id: "",
  fullName: "",
  relationship: "",
  effectiveDate: "",
}

const emptyTransaction: Omit<EmployeeTransaction, "id" | "createdAt" | "createdBy" | "text"> = {
  action: "hiring",
  reason: "",
  effectiveDate: "",
}

function calculateSeniority(date: string | undefined): string {
  if (!date) return "—"

  const startDate = new Date(date)
  const today = new Date()

  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "Not started"

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const days = diffDays % 30

  if (years > 0) {
    return months > 0 ? `${years}y ${months}m` : `${years}y`
  } else if (months > 0) {
    return days > 0 ? `${months}m ${days}d` : `${months}m`
  } else {
    return `${days}d`
  }
}

function generateTransactionText(action: TransactionAction, reason: string, subReason?: string): string {
  const actionLabel = transactionActionLabels[action]
  if (subReason) {
    return `${actionLabel} - ${reason}: ${subReason}`
  }
  return reason ? `${actionLabel} - ${reason}` : actionLabel
}

export function EmployeeDetailModal({ open, onOpenChange, employee, readOnly = false }: EmployeeDetailModalProps) {
  const { updateEmployee, organizationalUnits, positions, jobClassifications, employees } = useStore()
  const [activeTab, setActiveTab] = useState("work")
  const [formData, setFormData] = useState<
    Partial<Employee> & { citizenshipIdFile?: File | null; contractFile?: File | null; directReportIds?: string[] }
  >({})
  const [hasChanges, setHasChanges] = useState(false)
  const idFileInputRef = useRef<HTMLInputElement>(null)
  const contractFileInputRef = useRef<HTMLInputElement>(null)

  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set())
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set())

  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [newTransaction, setNewTransaction] = useState<typeof emptyTransaction>({ ...emptyTransaction })

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<EmployeeTransaction | null>(null)

  const [showAddContract, setShowAddContract] = useState(false)
  const [newContract, setNewContract] = useState<EmployeeContract & { file?: File | null }>({ ...emptyContract })
  const [editingContractIndex, setEditingContractIndex] = useState<number | null>(null)
  const [editingContract, setEditingContract] = useState<(EmployeeContract & { file?: File | null }) | null>(null)

  const [showAddDependent, setShowAddDependent] = useState(false)
  const [newDependent, setNewDependent] = useState<Omit<EmployeeDependent, "id">>({
    fullName: "",
    relationship: "",
    effectiveDate: "",
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        birthRegisterAddress: employee.birthRegisterAddress || { ...emptyAddress },
        permanentAddress: employee.permanentAddress || { ...emptyAddress },
        currentAddress: employee.currentAddress || { ...emptyAddress },
        taxInfo: employee.taxInfo || {
          personalTaxCode: "",
          taxDependents: 0,
          socialInsuranceBookNumber: "",
          initialRegistrationHospitalCode: "",
        },
        bankInfo: employee.bankInfo || { bankName: "", branch: "", accountNumber: "", accountHolderName: "" },
        emergencyContact: employee.emergencyContact || {
          contactPersonName: "",
          relationship: "",
          phone: "",
          email: "",
        },
        education: employee.education || [],
        contracts: employee.contracts || [],
        transactions: employee.transactions || [],
        dependents: employee.dependents || [],
        citizenshipIdFile: null,
        contractFile: null,
        directReportIds: employee.directReportIds || [],
      })
      setHasChanges(false)
      setExpandedTransactions(new Set())
      setExpandedContracts(new Set())
      setShowAddTransaction(false)
      setShowAddContract(false)
      setShowAddDependent(false)
      setEditingContractIndex(null)
      setEditingContract(null)
      setEditingTransactionId(null)
      setEditingTransaction(null)
    }
  }, [employee])

  const handleFieldChange = (field: string, value: string | number | boolean | string[]) => {
    if (readOnly) return
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, citizenshipIdFile: file }))
      setHasChanges(true)
    }
  }

  const handleRemoveIdFile = () => {
    if (readOnly) return
    setFormData((prev) => ({ ...prev, citizenshipIdFile: null }))
    if (idFileInputRef.current) {
      idFileInputRef.current.value = ""
    }
    setHasChanges(true)
  }

  const handleAddressChange = (type: "birthRegisterAddress" | "permanentAddress" | "currentAddress", value: string) => {
    if (readOnly) return
    setFormData((prev) => ({
      ...prev,
      [type]: { fullAddress: value },
    }))
    setHasChanges(true)
  }

  const handleNestedChange = (
    parent: "taxInfo" | "bankInfo" | "emergencyContact" | "resignationInfo",
    field: string,
    value: string | number | boolean,
  ) => {
    if (readOnly) return
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as Record<string, unknown>), [field]: value },
    }))
    setHasChanges(true)
  }

  const handleEducationChange = (index: number, field: keyof EmployeeEducation, value: string) => {
    if (readOnly) return
    setFormData((prev) => {
      const education = [...(prev.education || [])]
      education[index] = { ...education[index], [field]: value }
      return { ...prev, education }
    })
    setHasChanges(true)
  }

  const addEducation = () => {
    if (readOnly) return
    setFormData((prev) => ({
      ...prev,
      education: [...(prev.education || []), { ...emptyEducation }],
    }))
    setHasChanges(true)
  }

  const removeEducation = (index: number) => {
    if (readOnly) return
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }))
    setHasChanges(true)
  }

  const handleContractChange = (index: number, field: keyof EmployeeContract, value: string) => {
    if (readOnly) return
    setFormData((prev) => {
      const contracts = [...(prev.contracts || [])]
      contracts[index] = { ...contracts[index], [field]: value }
      return { ...prev, contracts }
    })
    setHasChanges(true)
  }

  const addContract = () => {
    if (readOnly) return
    setShowAddContract(true)
    setNewContract({ ...emptyContract })
  }

  const handleAddContract = () => {
    if (!newContract.contractNumber || !newContract.contractType) return

    const contractToAdd: EmployeeContract = {
      contractNumber: newContract.contractNumber,
      contractType: newContract.contractType,
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      signDate: newContract.signDate,
      notes: newContract.notes,
      // In a real app, you would upload the file and store the URL
      fileUrl: newContract.file ? URL.createObjectURL(newContract.file) : undefined,
      fileName: newContract.file?.name,
    }

    setFormData((prev) => ({
      ...prev,
      contracts: [...(prev.contracts || []), contractToAdd],
    }))
    setHasChanges(true)
    setShowAddContract(false)
    setNewContract({ ...emptyContract })
  }

  const startEditContract = (index: number) => {
    const contract = formData.contracts?.[index]
    if (contract) {
      setEditingContractIndex(index)
      setEditingContract({ ...contract })
    }
  }

  const cancelEditContract = () => {
    setEditingContractIndex(null)
    setEditingContract(null)
  }

  const saveEditContract = () => {
    if (editingContractIndex === null || !editingContract) return

    setFormData((prev) => {
      const contracts = [...(prev.contracts || [])]
      contracts[editingContractIndex] = {
        contractNumber: editingContract.contractNumber,
        contractType: editingContract.contractType,
        startDate: editingContract.startDate,
        endDate: editingContract.endDate,
        signDate: editingContract.signDate,
        notes: editingContract.notes,
        fileUrl: editingContract.file ? URL.createObjectURL(editingContract.file) : editingContract.fileUrl,
        fileName: editingContract.file?.name || editingContract.fileName,
      }
      return { ...prev, contracts }
    })
    setHasChanges(true)
    setEditingContractIndex(null)
    setEditingContract(null)
  }

  const toggleContractExpand = (index: number) => {
    setExpandedContracts((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const getContractStatus = (contract: EmployeeContract): string => {
    const today = new Date()
    const startDate = contract.startDate ? new Date(contract.startDate) : null
    const endDate = contract.endDate ? new Date(contract.endDate) : null

    if (startDate && startDate > today) return "upcoming"
    if (endDate && endDate < today) return "expired"
    if (startDate && startDate <= today && (!endDate || endDate >= today)) return "active"
    return "active"
  }

  const removeContract = (index: number) => {
    if (readOnly) return
    setFormData((prev) => ({
      ...prev,
      contracts: (prev.contracts || []).filter((_, i) => i !== index),
    }))
    setHasChanges(true)
  }

  const handleAddTransaction = () => {
    if (readOnly || !newTransaction.action || !newTransaction.effectiveDate) return

    const transaction: EmployeeTransaction = {
      id: `txn-${Date.now()}`,
      action: newTransaction.action,
      reason: newTransaction.reason || "",
      subReason: newTransaction.subReason,
      text: generateTransactionText(newTransaction.action, newTransaction.reason || "", newTransaction.subReason),
      effectiveDate: newTransaction.effectiveDate,
      createdAt: new Date().toISOString(),
      createdBy: "HR Admin",
      notes: newTransaction.notes,
      // Contract info is now optional
      contractNumber: newTransaction.contractNumber,
      contractType: newTransaction.contractType,
      contractStartDate: newTransaction.contractStartDate,
      contractEndDate: newTransaction.contractEndDate,
      signDate: newTransaction.signDate,
      positionId: formData.positionId,
      positionTitle: formData.positionTitle,
      organizationalUnitId: formData.organizationalUnitId,
      organizationalUnitName: formData.organizationalUnitName,
      fromTeamId: newTransaction.fromTeamId,
      fromTeamName: newTransaction.fromTeamName,
      toTeamId: newTransaction.toTeamId,
      toTeamName: newTransaction.toTeamName,
    }

    setFormData((prev) => ({
      ...prev,
      transactions: [...(prev.transactions || []), transaction],
    }))
    setNewTransaction({ ...emptyTransaction })
    setShowAddTransaction(false)
    setHasChanges(true)
  }

  const startEditTransaction = (txn: EmployeeTransaction) => {
    setEditingTransactionId(txn.id)
    setEditingTransaction({ ...txn })
    setExpandedTransactions((prev) => new Set(prev).add(txn.id))
  }

  const cancelEditTransaction = () => {
    setEditingTransactionId(null)
    setEditingTransaction(null)
  }

  const saveEditTransaction = () => {
    if (!editingTransactionId || !editingTransaction) return

    setFormData((prev) => {
      const transactions = (prev.transactions || []).map((txn) => {
        if (txn.id === editingTransactionId) {
          return {
            ...editingTransaction,
            text: generateTransactionText(
              editingTransaction.action,
              editingTransaction.reason || "",
              editingTransaction.subReason,
            ),
          }
        }
        return txn
      })
      return { ...prev, transactions }
    })
    setHasChanges(true)
    setEditingTransactionId(null)
    setEditingTransaction(null)
  }

  const removeTransaction = (id: string) => {
    if (readOnly) return
    setFormData((prev) => ({
      ...prev,
      transactions: (prev.transactions || []).filter((t) => t.id !== id),
    }))
    setHasChanges(true)
  }

  const toggleTransactionExpand = (id: string) => {
    setExpandedTransactions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleAddDependent = () => {
    if (readOnly || !newDependent.fullName || !newDependent.relationship || !newDependent.effectiveDate) return

    const dependent: EmployeeDependent = {
      id: `dep-${Date.now()}`,
      ...newDependent,
    }

    setFormData((prev) => ({
      ...prev,
      dependents: [...(prev.dependents || []), dependent],
    }))
    setNewDependent({ fullName: "", relationship: "", effectiveDate: "" })
    setShowAddDependent(false)
    setHasChanges(true)
  }

  const removeDependent = (id: string) => {
    if (readOnly) return
    setFormData((prev) => ({
      ...prev,
      dependents: (prev.dependents || []).filter((d) => d.id !== id),
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (employee && !readOnly) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { citizenshipIdFile, contractFile, ...dataToSave } = formData
      updateEmployee(employee.id, dataToSave)
      setHasChanges(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setActiveTab("work")
  }

  if (!employee) return null

  const departmentUnits = organizationalUnits.filter((u) => u.unitType === "department" || u.unitType === "team")
  const availablePositions = positions.filter((p) => p.organizationalUnitId === formData.organizationalUnitId)

  const formatDate = (date: string | undefined) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[1600px] sm:max-w-none max-h-[95vh] bg-card border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-card-foreground flex items-center gap-2">
              {employee.fullName}
              {formData.resignationInfo?.rehireEligible === false && (
                <Badge variant="destructive" className="text-xs">
                  Blacklisted
                </Badge>
              )}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{employee.companyEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && hasChanges && (
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-6 bg-secondary">
            <TabsTrigger value="work">Work Info</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="dependents">Dependents</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            {formData.status === "resigned" && <TabsTrigger value="resignation">Resignation</TabsTrigger>}
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[75vh] pr-2">
            {/* Work Info Tab */}
            <TabsContent value="work" className="space-y-4 m-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Employee ID</Label>
                  <Input
                    value={formData.employeeId || ""}
                    onChange={(e) => handleFieldChange("employeeId", e.target.value)}
                    placeholder="EMP001"
                    className="bg-input border-border"
                    readOnly={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Company Email</Label>
                  <Input value={formData.companyEmail || ""} className="bg-input border-border" readOnly />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Job Title</Label>
                  <Input
                    value={formData.jobTitle || ""}
                    onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
                    placeholder="Type job title manually"
                    className="bg-input border-border"
                    readOnly={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Department / Team</Label>
                  <Select
                    value={formData.organizationalUnitId || ""}
                    onValueChange={(value) => {
                      if (readOnly) return
                      const unit = organizationalUnits.find((u) => u.id === value)
                      setFormData((prev) => ({
                        ...prev,
                        organizationalUnitId: value,
                        organizationalUnitName: unit?.name || "",
                        positionId: "",
                        positionTitle: "",
                      }))
                      setHasChanges(true)
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Select department/team" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Position</Label>
                  <Select
                    value={formData.positionId || ""}
                    onValueChange={(value) => {
                      if (readOnly) return
                      const position = positions.find((p) => p.id === value)
                      setFormData((prev) => ({
                        ...prev,
                        positionId: value,
                        positionTitle: position?.title || "",
                      }))
                      setHasChanges(true)
                    }}
                    disabled={readOnly || !formData.organizationalUnitId}
                  >
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Job Classification</Label>
                  <Select
                    value={formData.jobClassificationId || ""}
                    onValueChange={(value) => {
                      if (readOnly) return
                      const classification = jobClassifications.find((j) => j.id === value)
                      setFormData((prev) => ({
                        ...prev,
                        jobClassificationId: value,
                        jobClassificationName: classification?.name || "",
                      }))
                      setHasChanges(true)
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobClassifications.map((classification) => (
                        <SelectItem key={classification.id} value={classification.id}>
                          {classification.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Status</Label>
                  <Select
                    value={formData.status || ""}
                    onValueChange={(value) => handleFieldChange("status", value)}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-card-foreground">Line Reports (Direct Reports)</Label>
                  {readOnly ? (
                    <div className="h-10 px-3 py-2 rounded-md border border-border bg-secondary/50 flex items-center flex-wrap gap-2">
                      {(formData.directReportIds || []).length > 0 ? (
                        employees
                          .filter((e) => formData.directReportIds?.includes(e.id))
                          .map((emp) => (
                            <span
                              key={emp.id}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                            >
                              {emp.fullName}
                            </span>
                          ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No direct reports selected</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(formData.directReportIds || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {employees
                            .filter((e) => formData.directReportIds?.includes(e.id))
                            .map((emp) => (
                              <span
                                key={emp.id}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                              >
                                {emp.fullName}
                                <button
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      directReportIds: (prev.directReportIds || []).filter((id) => id !== emp.id),
                                    }))
                                  }
                                  className="ml-1 hover:text-primary/70"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                        </div>
                      )}
                      <Select
                        onValueChange={(value) => {
                          const reportIds = formData.directReportIds || []
                          if (!reportIds.includes(value)) {
                            setFormData((prev) => ({
                              ...prev,
                              directReportIds: [...reportIds, value],
                            }))
                            setHasChanges(true)
                          }
                        }}
                      >
                        <SelectTrigger className="w-full bg-input border-border">
                          <SelectValue placeholder="Select employees to add..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employees
                            .filter((e) => e.id !== employee?.id && !formData.directReportIds?.includes(e.id))
                            .map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.fullName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {/* Replace onboardDate with companyJoinDate and officialStartDate fields */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">First Day at Company (Onboarding)</Label>
                  <Input
                    type="date"
                    value={formData.companyJoinDate || ""}
                    onChange={(e) => handleFieldChange("companyJoinDate", e.target.value)}
                    className="w-full bg-input border-border"
                    readOnly={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">First Day as Official Employee</Label>
                  <Input
                    type="date"
                    value={formData.officialStartDate || ""}
                    onChange={(e) => handleFieldChange("officialStartDate", e.target.value)}
                    className="w-full bg-input border-border"
                    readOnly={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Seniority</Label>
                  <div className="h-10 px-3 py-2 rounded-md border border-border bg-secondary/50 flex items-center">
                    {/* Update calculateSeniority to accept officialStartDate parameter for proper seniority calculation */}
                    <span className="text-card-foreground">{calculateSeniority(formData.officialStartDate)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-4 m-0">
              {/* Basic Info Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Full Name</Label>
                    <Input
                      value={formData.fullName || ""}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Personal Email</Label>
                    <Input
                      type="email"
                      value={formData.personalEmail || ""}
                      onChange={(e) => handleFieldChange("personalEmail", e.target.value)}
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Phone</Label>
                    <Input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)}
                      className="w-full bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Gender</Label>
                    <Select
                      value={formData.gender || ""}
                      onValueChange={(value) => handleFieldChange("gender", value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-full bg-input border-border">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Marital Status</Label>
                    <Select
                      value={formData.maritalStatus || ""}
                      onValueChange={(value) => handleFieldChange("maritalStatus", value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-full bg-input border-border">
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Nationality</Label>
                    <Input
                      value={formData.nationality || ""}
                      onChange={(e) => handleFieldChange("nationality", e.target.value)}
                      placeholder="e.g., Vietnamese"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Place of Birth</Label>
                    <Input
                      value={formData.placeOfBirth || ""}
                      onChange={(e) => handleFieldChange("placeOfBirth", e.target.value)}
                      placeholder="e.g., Ho Chi Minh City"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Citizenship ID Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Citizenship Identification
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Citizenship ID Number</Label>
                    <Input
                      value={formData.citizenshipIdNumber || ""}
                      onChange={(e) => handleFieldChange("citizenshipIdNumber", e.target.value)}
                      placeholder="Enter ID number"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Date of Issue</Label>
                    <Input
                      type="date"
                      value={formData.citizenshipIdDateOfIssue || ""}
                      onChange={(e) => handleFieldChange("citizenshipIdDateOfIssue", e.target.value)}
                      className="w-full bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Place of Issue</Label>
                    <Input
                      value={formData.citizenshipIdPlaceOfIssue || ""}
                      onChange={(e) => handleFieldChange("citizenshipIdPlaceOfIssue", e.target.value)}
                      placeholder="e.g., Ho Chi Minh City Police"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">ID Document (Front/Back)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={idFileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleIdFileChange}
                        className="hidden"
                        disabled={readOnly}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => idFileInputRef.current?.click()}
                        disabled={readOnly}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      {formData.citizenshipIdFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{formData.citizenshipIdFile.name}</span>
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveIdFile}
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-card-foreground">Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Birth Register Address</Label>
                    <Textarea
                      value={formData.birthRegisterAddress?.fullAddress || ""}
                      onChange={(e) => handleAddressChange("birthRegisterAddress", e.target.value)}
                      placeholder="Full address as registered at birth"
                      className="bg-input border-border min-h-[60px]"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Permanent Address</Label>
                    <Textarea
                      value={formData.permanentAddress?.fullAddress || ""}
                      onChange={(e) => handleAddressChange("permanentAddress", e.target.value)}
                      placeholder="Permanent residence address"
                      className="bg-input border-border min-h-[60px]"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Current Address</Label>
                    <Textarea
                      value={formData.currentAddress?.fullAddress || ""}
                      onChange={(e) => handleAddressChange("currentAddress", e.target.value)}
                      placeholder="Current living address"
                      className="bg-input border-border min-h-[60px]"
                      readOnly={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Education Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-card-foreground">Education</CardTitle>
                  {!readOnly && (
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.education || []).map((edu, index) => (
                    <div key={index} className="grid gap-3 sm:grid-cols-2 p-3 rounded-lg bg-card border border-border">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                          placeholder="e.g., Bachelor's"
                          className="bg-input border-border"
                          readOnly={readOnly}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Field of Study</Label>
                        <Input
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleEducationChange(index, "fieldOfStudy", e.target.value)}
                          placeholder="e.g., Computer Science"
                          className="bg-input border-border"
                          readOnly={readOnly}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                          placeholder="University name"
                          className="bg-input border-border"
                          readOnly={readOnly}
                        />
                      </div>
                      <div className="space-y-1 flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Graduation Year</Label>
                          <Input
                            value={edu.graduationYear}
                            onChange={(e) => handleEducationChange(index, "graduationYear", e.target.value)}
                            placeholder="e.g., 2020"
                            className="bg-input border-border"
                            readOnly={readOnly}
                          />
                        </div>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(formData.education || []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No education records</p>
                  )}
                </CardContent>
              </Card>

              {/* Tax Info Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-card-foreground">Tax & Insurance</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Personal Tax Code</Label>
                    <Input
                      value={formData.taxInfo?.personalTaxCode || ""}
                      onChange={(e) => handleNestedChange("taxInfo", "personalTaxCode", e.target.value)}
                      placeholder="Tax code"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Tax Dependents</Label>
                    <Input
                      type="number"
                      value={formData.taxInfo?.taxDependents || 0}
                      onChange={(e) => handleNestedChange("taxInfo", "taxDependents", Number.parseInt(e.target.value))}
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Social Insurance Book Number</Label>
                    <Input
                      value={formData.taxInfo?.socialInsuranceBookNumber || ""}
                      onChange={(e) => handleNestedChange("taxInfo", "socialInsuranceBookNumber", e.target.value)}
                      placeholder="Insurance book number"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Initial Hospital Code</Label>
                    <Input
                      value={formData.taxInfo?.initialRegistrationHospitalCode || ""}
                      onChange={(e) => handleNestedChange("taxInfo", "initialRegistrationHospitalCode", e.target.value)}
                      placeholder="Hospital registration code"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bank Info Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-card-foreground">Bank Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Bank Name</Label>
                    <Input
                      value={formData.bankInfo?.bankName || ""}
                      onChange={(e) => handleNestedChange("bankInfo", "bankName", e.target.value)}
                      placeholder="e.g., Vietcombank"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Branch</Label>
                    <Input
                      value={formData.bankInfo?.branch || ""}
                      onChange={(e) => handleNestedChange("bankInfo", "branch", e.target.value)}
                      placeholder="Branch name"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Account Number</Label>
                    <Input
                      value={formData.bankInfo?.accountNumber || ""}
                      onChange={(e) => handleNestedChange("bankInfo", "accountNumber", e.target.value)}
                      placeholder="Account number"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Account Holder Name</Label>
                    <Input
                      value={formData.bankInfo?.accountHolderName || ""}
                      onChange={(e) => handleNestedChange("bankInfo", "accountHolderName", e.target.value)}
                      placeholder="Name on account"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-card-foreground">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Contact Person Name</Label>
                    <Input
                      value={formData.emergencyContact?.contactPersonName || ""}
                      onChange={(e) => handleNestedChange("emergencyContact", "contactPersonName", e.target.value)}
                      placeholder="Full name"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Relationship</Label>
                    <Input
                      value={formData.emergencyContact?.relationship || ""}
                      onChange={(e) => handleNestedChange("emergencyContact", "relationship", e.target.value)}
                      placeholder="e.g., Spouse, Parent"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Phone</Label>
                    <Input
                      type="tel"
                      value={formData.emergencyContact?.phone || ""}
                      onChange={(e) => handleNestedChange("emergencyContact", "phone", e.target.value)}
                      placeholder="Phone number"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Email</Label>
                    <Input
                      type="email"
                      value={formData.emergencyContact?.email || ""}
                      onChange={(e) => handleNestedChange("emergencyContact", "email", e.target.value)}
                      placeholder="Email address"
                      className="bg-input border-border"
                      readOnly={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dependents Tab */}
            <TabsContent value="dependents" className="space-y-4 m-0">
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Tax Dependents
                  </CardTitle>
                  {!readOnly && !showAddDependent && (
                    <Button variant="outline" size="sm" onClick={() => setShowAddDependent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dependent
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Dependent Form */}
                  {showAddDependent && (
                    <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">Add New Dependent</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddDependent(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Full Name *</Label>
                          <Input
                            value={newDependent.fullName}
                            onChange={(e) =>
                              setNewDependent((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                            placeholder="Dependent's full name"
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Relationship *</Label>
                          <Select
                            value={newDependent.relationship}
                            onValueChange={(value) =>
                              setNewDependent((prev) => ({
                                ...prev,
                                relationship: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full bg-input border-border">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              {relationshipOptions.map((rel) => (
                                <SelectItem key={rel} value={rel}>
                                  {rel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Effective Date *</Label>
                          <Input
                            type="date"
                            value={newDependent.effectiveDate}
                            onChange={(e) =>
                              setNewDependent((prev) => ({
                                ...prev,
                                effectiveDate: e.target.value,
                              }))
                            }
                            className="w-full bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                          <Input
                            type="date"
                            value={newDependent.dateOfBirth || ""}
                            onChange={(e) =>
                              setNewDependent((prev) => ({
                                ...prev,
                                dateOfBirth: e.target.value,
                              }))
                            }
                            className="w-full bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">ID Number</Label>
                          <Input
                            value={newDependent.idNumber || ""}
                            onChange={(e) =>
                              setNewDependent((prev) => ({
                                ...prev,
                                idNumber: e.target.value,
                              }))
                            }
                            placeholder="ID/Birth certificate number"
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Tax Code</Label>
                          <Input
                            value={newDependent.taxCode || ""}
                            onChange={(e) =>
                              setNewDependent((prev) => ({
                                ...prev,
                                taxCode: e.target.value,
                              }))
                            }
                            placeholder="Dependent's tax code"
                            className="bg-input border-border"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowAddDependent(false)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddDependent}
                          disabled={!newDependent.fullName || !newDependent.relationship || !newDependent.effectiveDate}
                        >
                          Add Dependent
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Dependents List */}
                  {(formData.dependents || []).length === 0 && !showAddDependent ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No dependents registered</p>
                  ) : (
                    <div className="space-y-3">
                      {(formData.dependents || []).map((dep) => (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{dep.fullName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {dep.relationship}
                                </Badge>
                                <span>Effective: {formatDate(dep.effectiveDate)}</span>
                                {dep.dateOfBirth && <span>• DOB: {formatDate(dep.dateOfBirth)}</span>}
                              </div>
                            </div>
                          </div>
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDependent(dep.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contract Tab */}
            <TabsContent value="contract" className="space-y-4 m-0">
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Contract History
                  </CardTitle>
                  {!readOnly && !showAddContract && (
                    <Button variant="outline" size="sm" onClick={addContract}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contract
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Contract Form */}
                  {showAddContract && (
                    <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">Add New Contract</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddContract(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Contract Number *</Label>
                          <Input
                            value={newContract.contractNumber}
                            onChange={(e) => setNewContract((prev) => ({ ...prev, contractNumber: e.target.value }))}
                            placeholder="CT-2024-001"
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Contract Type *</Label>
                          <Select
                            value={newContract.contractType}
                            onValueChange={(value) => setNewContract((prev) => ({ ...prev, contractType: value }))}
                          >
                            <SelectTrigger className="w-full bg-input border-border">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {contractTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Sign Date</Label>
                          <Input
                            type="date"
                            value={newContract.signDate}
                            onChange={(e) => setNewContract((prev) => ({ ...prev, signDate: e.target.value }))}
                            className="w-full bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Start Date</Label>
                          <Input
                            type="date"
                            value={newContract.startDate}
                            onChange={(e) => setNewContract((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="w-full bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">End Date</Label>
                          <Input
                            type="date"
                            value={newContract.endDate}
                            onChange={(e) => setNewContract((prev) => ({ ...prev, endDate: e.target.value }))}
                            className="w-full bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Contract File</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setNewContract((prev) => ({ ...prev, file }))
                                }
                              }}
                              className="bg-input border-border"
                            />
                          </div>
                          {newContract.file && (
                            <p className="text-xs text-muted-foreground mt-1">Selected: {newContract.file.name}</p>
                          )}
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs text-muted-foreground">Notes</Label>
                          <Textarea
                            value={newContract.notes || ""}
                            onChange={(e) => setNewContract((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes about this contract..."
                            className="bg-input border-border min-h-[60px]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowAddContract(false)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddContract}
                          disabled={!newContract.contractNumber || !newContract.contractType}
                        >
                          Add Contract
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Contract List - Timeline Style */}
                  {(formData.contracts || []).length === 0 && !showAddContract ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No contract records</p>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      {(formData.contracts || []).length > 0 && (
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      )}

                      <div className="space-y-4">
                        {(formData.contracts || [])
                          .slice()
                          .reverse()
                          .map((contract, reversedIndex) => {
                            const index = (formData.contracts || []).length - 1 - reversedIndex
                            const isExpanded = expandedContracts.has(index)
                            const isEditing = editingContractIndex === index
                            const status = getContractStatus(contract)

                            return (
                              <Collapsible
                                key={index}
                                open={isExpanded}
                                onOpenChange={() => toggleContractExpand(index)}
                              >
                                <div className="relative pl-10">
                                  {/* Timeline dot */}
                                  <div
                                    className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-background ${
                                      status === "active"
                                        ? "bg-success"
                                        : status === "upcoming"
                                          ? "bg-info"
                                          : "bg-muted-foreground"
                                    }`}
                                  />

                                  <CollapsibleTrigger asChild>
                                    <div
                                      className={`rounded-lg border overflow-hidden cursor-pointer transition-colors ${
                                        isExpanded
                                          ? "border-primary/50 bg-primary/5"
                                          : "border-border hover:bg-secondary/50"
                                      }`}
                                    >
                                      {/* Contract Header */}
                                      <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                          <div className="flex items-center gap-2">
                                            {isExpanded ? (
                                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-card-foreground">
                                                {contract.contractNumber || `Contract #${index + 1}`}
                                              </span>
                                              <Badge variant="outline" className={contractStatusColors[status]}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                              </Badge>
                                              <Badge variant="outline" className="bg-secondary/50">
                                                {contract.contractType || "N/A"}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {contract.fileName && (
                                            <Badge variant="outline" className="bg-info/10 text-info">
                                              <FileText className="h-3 w-3 mr-1" />
                                              File attached
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      {/* Expanded Content */}
                                      <CollapsibleContent>
                                        <div className="border-t border-border p-4 bg-secondary/20">
                                          {isEditing && editingContract ? (
                                            /* Edit Form */
                                            <div className="space-y-4">
                                              <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">
                                                    Contract Number
                                                  </Label>
                                                  <Input
                                                    value={editingContract.contractNumber}
                                                    onChange={(e) =>
                                                      setEditingContract((prev) =>
                                                        prev ? { ...prev, contractNumber: e.target.value } : null,
                                                      )
                                                    }
                                                    className="bg-input border-border"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Contract Type</Label>
                                                  <Select
                                                    value={editingContract.contractType}
                                                    onValueChange={(value) =>
                                                      setEditingContract((prev) =>
                                                        prev ? { ...prev, contractType: value } : null,
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="w-full bg-input border-border">
                                                      <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {contractTypeOptions.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                          {type}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Sign Date</Label>
                                                  <Input
                                                    type="date"
                                                    value={editingContract.signDate}
                                                    onChange={(e) =>
                                                      setEditingContract((prev) =>
                                                        prev ? { ...prev, signDate: e.target.value } : null,
                                                      )
                                                    }
                                                    className="w-full bg-input border-border"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                                                  <Input
                                                    type="date"
                                                    value={editingContract.startDate}
                                                    onChange={(e) =>
                                                      setEditingContract((prev) =>
                                                        prev ? { ...prev, startDate: e.target.value } : null,
                                                      )
                                                    }
                                                    className="w-full bg-input border-border"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">End Date</Label>
                                                  <Input
                                                    type="date"
                                                    value={editingContract.endDate}
                                                    onChange={(e) =>
                                                      setEditingContract((prev) =>
                                                        prev ? { ...prev, endDate: e.target.value } : null,
                                                      )
                                                    }
                                                    className="w-full bg-input border-border"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Contract File</Label>
                                                  <Input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0]
                                                      if (file) {
                                                        setEditingContract((prev) => (prev ? { ...prev, file } : null))
                                                      }
                                                    }}
                                                    className="bg-input border-border"
                                                  />
                                                  {(editingContract.file || editingContract.fileName) && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                      Current: {editingContract.file?.name || editingContract.fileName}
                                                    </p>
                                                  )}
                                                </div>
                                                <div className="sm:col-span-2 space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Notes</Label>
                                                  <Textarea
                                                    value={editingContract.notes || ""}
                                                    onChange={(e) =>
                                                      setEditingContract((prev) =>
                                                        prev ? { ...prev, notes: e.target.value } : null,
                                                      )
                                                    }
                                                    className="bg-input border-border min-h-[60px]"
                                                  />
                                                </div>
                                              </div>
                                              <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={cancelEditContract}>
                                                  Cancel
                                                </Button>
                                                <Button size="sm" onClick={saveEditContract}>
                                                  Save Changes
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            /* View Mode */
                                            <div className="space-y-4">
                                              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Contract Number
                                                  </p>
                                                  <span className="text-card-foreground font-mono">
                                                    {contract.contractNumber || "—"}
                                                  </span>
                                                </div>
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Contract Type
                                                  </p>
                                                  <span className="text-card-foreground">
                                                    {contract.contractType || "—"}
                                                  </span>
                                                </div>
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Sign Date
                                                  </p>
                                                  <span className="text-card-foreground">
                                                    {formatDate(contract.signDate)}
                                                  </span>
                                                </div>
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Start Date
                                                  </p>
                                                  <span className="text-card-foreground">
                                                    {formatDate(contract.startDate)}
                                                  </span>
                                                </div>
                                                <div>
                                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    End Date
                                                  </p>
                                                  <span className="text-card-foreground">
                                                    {formatDate(contract.endDate)}
                                                  </span>
                                                </div>
                                                {contract.fileName && (
                                                  <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                                      Attached File
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                      <FileText className="h-4 w-4 text-info" />
                                                      <span className="text-card-foreground">{contract.fileName}</span>
                                                      {contract.fileUrl && (
                                                        <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                                                          <a
                                                            href={contract.fileUrl}
                                                            download={contract.fileName}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                          >
                                                            <Download className="h-3 w-3" />
                                                          </a>
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                                {contract.notes && (
                                                  <div className="sm:col-span-2">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                                      Notes
                                                    </p>
                                                    <p className="text-card-foreground">{contract.notes}</p>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Action buttons */}
                                              {!readOnly && (
                                                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      startEditContract(index)
                                                    }}
                                                  >
                                                    <Pencil className="h-3 w-3 mr-1" />
                                                    Edit
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      removeContract(index)
                                                    }}
                                                    className="text-destructive hover:text-destructive"
                                                  >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </div>
                                  </CollapsibleTrigger>
                                </div>
                              </Collapsible>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab - Updated to make transactions editable and contract info optional */}
            <TabsContent value="transactions" className="space-y-4 m-0">
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Transaction History
                  </CardTitle>
                  {!readOnly && !showAddTransaction && (
                    <Button variant="outline" size="sm" onClick={() => setShowAddTransaction(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Transaction Form - Contract fields moved to collapsible section */}
                  {showAddTransaction && (
                    <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">Add New Transaction</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddTransaction(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">Required Information</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Action *</Label>
                            <Select
                              value={newTransaction.action}
                              onValueChange={(value: TransactionAction) =>
                                setNewTransaction((prev) => ({
                                  ...prev,
                                  action: value,
                                  reason: "",
                                  subReason: undefined,
                                }))
                              }
                            >
                              <SelectTrigger className="w-full bg-input border-border">
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(transactionActionLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Reason *</Label>
                            <Select
                              value={newTransaction.reason || ""}
                              onValueChange={(value) =>
                                setNewTransaction((prev) => ({ ...prev, reason: value, subReason: undefined }))
                              }
                            >
                              <SelectTrigger className="w-full bg-input border-border">
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                {(transactionReasons[newTransaction.action] || []).map((reason) => (
                                  <SelectItem key={reason} value={reason}>
                                    {reason}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Effective Date *</Label>
                            <Input
                              type="date"
                              value={newTransaction.effectiveDate}
                              onChange={(e) =>
                                setNewTransaction((prev) => ({ ...prev, effectiveDate: e.target.value }))
                              }
                              className="w-full bg-input border-border"
                            />
                          </div>
                        </div>

                        {/* Sub-reason for resignation */}
                        {newTransaction.action === "resignation" &&
                          newTransaction.reason &&
                          resignationSubReasons[newTransaction.reason] && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Sub-Reason</Label>
                              <Select
                                value={newTransaction.subReason || ""}
                                onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, subReason: value }))}
                              >
                                <SelectTrigger className="w-full bg-input border-border">
                                  <SelectValue placeholder="Select sub-reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  {resignationSubReasons[newTransaction.reason].map((subReason) => (
                                    <SelectItem key={subReason} value={subReason}>
                                      {subReason}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                      </div>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between">
                            <span className="text-xs text-muted-foreground">Optional: Contract & Additional Info</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 space-y-3">
                          {/* Transfer specific fields */}
                          {newTransaction.action === "transfer" && (
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">From Team/Department</Label>
                                <Select
                                  value={newTransaction.fromTeamId || ""}
                                  onValueChange={(value) => {
                                    const unit = organizationalUnits.find((u) => u.id === value)
                                    setNewTransaction((prev) => ({
                                      ...prev,
                                      fromTeamId: value,
                                      fromTeamName: unit?.name || "",
                                    }))
                                  }}
                                >
                                  <SelectTrigger className="w-full bg-input border-border">
                                    <SelectValue placeholder="Select from" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departmentUnits.map((unit) => (
                                      <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">To Team/Department</Label>
                                <Select
                                  value={newTransaction.toTeamId || ""}
                                  onValueChange={(value) => {
                                    const unit = organizationalUnits.find((u) => u.id === value)
                                    setNewTransaction((prev) => ({
                                      ...prev,
                                      toTeamId: value,
                                      toTeamName: unit?.name || "",
                                    }))
                                  }}
                                >
                                  <SelectTrigger className="w-full bg-input border-border">
                                    <SelectValue placeholder="Select to" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departmentUnits.map((unit) => (
                                      <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Contract info fields - now optional */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Contract Number</Label>
                              <Input
                                value={newTransaction.contractNumber || ""}
                                onChange={(e) =>
                                  setNewTransaction((prev) => ({ ...prev, contractNumber: e.target.value }))
                                }
                                placeholder="CT-2024-001"
                                className="bg-input border-border"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Contract Type</Label>
                              <Select
                                value={newTransaction.contractType || ""}
                                onValueChange={(value) =>
                                  setNewTransaction((prev) => ({ ...prev, contractType: value }))
                                }
                              >
                                <SelectTrigger className="w-full bg-input border-border">
                                  <SelectValue placeholder="Select contract type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {contractTypeOptions.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Contract Start Date</Label>
                              <Input
                                type="date"
                                value={newTransaction.contractStartDate || ""}
                                onChange={(e) =>
                                  setNewTransaction((prev) => ({ ...prev, contractStartDate: e.target.value }))
                                }
                                className="w-full bg-input border-border"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Contract End Date</Label>
                              <Input
                                type="date"
                                value={newTransaction.contractEndDate || ""}
                                onChange={(e) =>
                                  setNewTransaction((prev) => ({ ...prev, contractEndDate: e.target.value }))
                                }
                                className="w-full bg-input border-border"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Sign Date</Label>
                              <Input
                                type="date"
                                value={newTransaction.signDate || ""}
                                onChange={(e) => setNewTransaction((prev) => ({ ...prev, signDate: e.target.value }))}
                                className="w-full bg-input border-border"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Notes</Label>
                            <Textarea
                              value={newTransaction.notes || ""}
                              onChange={(e) => setNewTransaction((prev) => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional notes..."
                              className="bg-input border-border min-h-[60px]"
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowAddTransaction(false)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddTransaction}
                          disabled={!newTransaction.action || !newTransaction.effectiveDate}
                        >
                          Add Transaction
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Transactions Timeline */}
                  {(formData.transactions || []).length === 0 && !showAddTransaction ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No transaction history</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-2">
                        {(formData.transactions || [])
                          .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                          .map((txn) => {
                            const isEditing = editingTransactionId === txn.id

                            return (
                              <Collapsible
                                key={txn.id}
                                open={expandedTransactions.has(txn.id)}
                                onOpenChange={() => toggleTransactionExpand(txn.id)}
                              >
                                <div className="relative pl-10">
                                  <div
                                    className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-card ${actionBadgeColors[txn.action].replace("/20", "").replace("text-", "bg-")}`}
                                  />

                                  <CollapsibleTrigger asChild>
                                    <div className="rounded-lg border border-border bg-card hover:bg-secondary/20 cursor-pointer transition-colors">
                                      <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          {expandedTransactions.has(txn.id) ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                          )}
                                          <Badge variant="secondary" className={actionBadgeColors[txn.action]}>
                                            {transactionActionLabels[txn.action]}
                                          </Badge>
                                          <span className="text-sm text-card-foreground">{txn.text}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">
                                            {formatDate(txn.effectiveDate)}
                                          </span>
                                          {!readOnly && (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  startEditTransaction(txn)
                                                }}
                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                              >
                                                <Pencil className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  removeTransaction(txn.id)
                                                }}
                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      <CollapsibleContent>
                                        <div className="px-4 pb-4 pt-0 border-t border-border mt-2">
                                          {isEditing && editingTransaction ? (
                                            <div className="space-y-4 pt-4">
                                              <div className="grid gap-3 sm:grid-cols-3">
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Action *</Label>
                                                  <Select
                                                    value={editingTransaction.action}
                                                    onValueChange={(value: TransactionAction) =>
                                                      setEditingTransaction((prev) =>
                                                        prev
                                                          ? { ...prev, action: value, reason: "", subReason: undefined }
                                                          : null,
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="w-full bg-input border-border">
                                                      <SelectValue placeholder="Select action" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {Object.entries(transactionActionLabels).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                          {label}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Reason *</Label>
                                                  <Select
                                                    value={editingTransaction.reason || ""}
                                                    onValueChange={(value) =>
                                                      setEditingTransaction((prev) =>
                                                        prev ? { ...prev, reason: value, subReason: undefined } : null,
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="w-full bg-input border-border">
                                                      <SelectValue placeholder="Select reason" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {(transactionReasons[editingTransaction.action] || []).map(
                                                        (reason) => (
                                                          <SelectItem key={reason} value={reason}>
                                                            {reason}
                                                          </SelectItem>
                                                        ),
                                                      )}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">
                                                    Effective Date *
                                                  </Label>
                                                  <Input
                                                    type="date"
                                                    value={editingTransaction.effectiveDate}
                                                    onChange={(e) =>
                                                      setEditingTransaction((prev) =>
                                                        prev ? { ...prev, effectiveDate: e.target.value } : null,
                                                      )
                                                    }
                                                    className="w-full bg-input border-border"
                                                  />
                                                </div>
                                              </div>

                                              {/* Sub-reason for resignation */}
                                              {editingTransaction.action === "resignation" &&
                                                editingTransaction.reason &&
                                                resignationSubReasons[editingTransaction.reason] && (
                                                  <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Sub-Reason</Label>
                                                    <Select
                                                      value={editingTransaction.subReason || ""}
                                                      onValueChange={(value) =>
                                                        setEditingTransaction((prev) =>
                                                          prev ? { ...prev, subReason: value } : null,
                                                        )
                                                      }
                                                    >
                                                      <SelectTrigger className="w-full bg-input border-border">
                                                        <SelectValue placeholder="Select sub-reason" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {resignationSubReasons[editingTransaction.reason].map(
                                                          (subReason) => (
                                                            <SelectItem key={subReason} value={subReason}>
                                                              {subReason}
                                                            </SelectItem>
                                                          ),
                                                        )}
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                )}

                                              {/* Transfer specific fields */}
                                              {editingTransaction.action === "transfer" &&
                                                (txn.fromTeamName || txn.toTeamName) && (
                                                  <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-muted-foreground">
                                                        From Team/Department
                                                      </Label>
                                                      <Select
                                                        value={editingTransaction.fromTeamId || ""}
                                                        onValueChange={(value) => {
                                                          const unit = organizationalUnits.find((u) => u.id === value)
                                                          setEditingTransaction((prev) =>
                                                            prev
                                                              ? {
                                                                  ...prev,
                                                                  fromTeamId: value,
                                                                  fromTeamName: unit?.name || "",
                                                                }
                                                              : null,
                                                          )
                                                        }}
                                                      >
                                                        <SelectTrigger className="w-full bg-input border-border">
                                                          <SelectValue placeholder="Select from" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          {departmentUnits.map((unit) => (
                                                            <SelectItem key={unit.id} value={unit.id}>
                                                              {unit.name}
                                                            </SelectItem>
                                                          ))}
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-muted-foreground">
                                                        To Team/Department
                                                      </Label>
                                                      <Select
                                                        value={editingTransaction.toTeamId || ""}
                                                        onValueChange={(value) => {
                                                          const unit = organizationalUnits.find((u) => u.id === value)
                                                          setEditingTransaction((prev) =>
                                                            prev
                                                              ? {
                                                                  ...prev,
                                                                  toTeamId: value,
                                                                  toTeamName: unit?.name || "",
                                                                }
                                                              : null,
                                                          )
                                                        }}
                                                      >
                                                        <SelectTrigger className="w-full bg-input border-border">
                                                          <SelectValue placeholder="Select to" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          {departmentUnits.map((unit) => (
                                                            <SelectItem key={unit.id} value={unit.id}>
                                                              {unit.name}
                                                            </SelectItem>
                                                          ))}
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                  </div>
                                                )}

                                              {/* Optional contract fields */}
                                              <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">
                                                    Contract Number
                                                  </Label>
                                                  <Input
                                                    value={editingTransaction.contractNumber || ""}
                                                    onChange={(e) =>
                                                      setEditingTransaction((prev) =>
                                                        prev ? { ...prev, contractNumber: e.target.value } : null,
                                                      )
                                                    }
                                                    placeholder="CT-2024-001"
                                                    className="bg-input border-border"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-xs text-muted-foreground">Contract Type</Label>
                                                  <Select
                                                    value={editingTransaction.contractType || ""}
                                                    onValueChange={(value) =>
                                                      setEditingTransaction((prev) =>
                                                        prev ? { ...prev, contractType: value } : null,
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="w-full bg-input border-border">
                                                      <SelectValue placeholder="Select contract type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {contractTypeOptions.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                          {type}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>

                                              <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Notes</Label>
                                                <Textarea
                                                  value={editingTransaction.notes || ""}
                                                  onChange={(e) =>
                                                    setEditingTransaction((prev) =>
                                                      prev ? { ...prev, notes: e.target.value } : null,
                                                    )
                                                  }
                                                  placeholder="Additional notes..."
                                                  className="bg-input border-border min-h-[60px]"
                                                />
                                              </div>

                                              <div className="flex justify-end gap-2 pt-2">
                                                <Button variant="outline" size="sm" onClick={cancelEditTransaction}>
                                                  Cancel
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  onClick={saveEditTransaction}
                                                  disabled={
                                                    !editingTransaction.action || !editingTransaction.effectiveDate
                                                  }
                                                >
                                                  Save Changes
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            /* View Mode */
                                            <div className="grid gap-3 sm:grid-cols-2 pt-4 text-sm">
                                              {/* Contract Information - only show if exists */}
                                              {txn.contractNumber && (
                                                <div className="sm:col-span-2">
                                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                                    Contract Information
                                                  </p>
                                                  <div className="grid gap-2 sm:grid-cols-3 bg-secondary/30 rounded-md p-3">
                                                    <div>
                                                      <span className="text-muted-foreground">Number:</span>{" "}
                                                      <span className="text-card-foreground font-mono">
                                                        {txn.contractNumber}
                                                      </span>
                                                    </div>
                                                    {txn.contractType && (
                                                      <div>
                                                        <span className="text-muted-foreground">Type:</span>{" "}
                                                        <span className="text-card-foreground">{txn.contractType}</span>
                                                      </div>
                                                    )}
                                                    {txn.signDate && (
                                                      <div>
                                                        <span className="text-muted-foreground">Signed:</span>{" "}
                                                        <span className="text-card-foreground">
                                                          {formatDate(txn.signDate)}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Work Information */}
                                              {(txn.positionTitle || txn.organizationalUnitName) && (
                                                <div className="sm:col-span-2">
                                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                                    Work Information
                                                  </p>
                                                  <div className="grid gap-2 sm:grid-cols-2 bg-secondary/30 rounded-md p-3">
                                                    {txn.positionTitle && (
                                                      <div>
                                                        <span className="text-muted-foreground">Position:</span>{" "}
                                                        <span className="text-card-foreground">
                                                          {txn.positionTitle}
                                                        </span>
                                                      </div>
                                                    )}
                                                    {txn.organizationalUnitName && (
                                                      <div>
                                                        <span className="text-muted-foreground">Department:</span>{" "}
                                                        <span className="text-card-foreground">
                                                          {txn.organizationalUnitName}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Transfer specific */}
                                              {txn.action === "transfer" && (txn.fromTeamName || txn.toTeamName) && (
                                                <div className="sm:col-span-2">
                                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                                    Transfer Details
                                                  </p>
                                                  <div className="flex items-center gap-2 bg-secondary/30 rounded-md p-3">
                                                    <span className="text-card-foreground">
                                                      {txn.fromTeamName || "—"}
                                                    </span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="text-card-foreground">
                                                      {txn.toTeamName || "—"}
                                                    </span>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Notes */}
                                              {txn.notes && (
                                                <div className="sm:col-span-2">
                                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Notes
                                                  </p>
                                                  <p className="text-card-foreground">{txn.notes}</p>
                                                </div>
                                              )}

                                              {/* Meta info */}
                                              <div className="sm:col-span-2 text-xs text-muted-foreground pt-2 border-t border-border">
                                                Created by {txn.createdBy} on {formatDate(txn.createdAt)}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </div>
                                  </CollapsibleTrigger>
                                </div>
                              </Collapsible>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {formData.status === "resigned" && (
              <TabsContent value="resignation" className="space-y-4 m-0">
                <Card className="bg-secondary/30 border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                      <UserX className="h-4 w-4" />
                      Resignation Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-card-foreground">Resignation Action</Label>
                        <Select
                          value={formData.resignationInfo?.resignationAction || ""}
                          onValueChange={(value) =>
                            handleNestedChange(
                              "resignationInfo",
                              "resignationAction",
                              value as "Voluntary" | "Involuntary",
                            )
                          }
                          disabled={readOnly}
                        >
                          <SelectTrigger className="w-full bg-input border-border">
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Voluntary">Voluntary</SelectItem>
                            <SelectItem value="Involuntary">Involuntary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-card-foreground">Resignation Reason</Label>
                        <Select
                          value={formData.resignationInfo?.resignationReason || ""}
                          onValueChange={(value) => handleNestedChange("resignationInfo", "resignationReason", value)}
                          disabled={readOnly || !formData.resignationInfo?.resignationAction}
                        >
                          <SelectTrigger className="w-full bg-input border-border">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.resignationInfo?.resignationAction &&
                              resignationSubReasons[formData.resignationInfo.resignationAction]?.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                  {reason}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-card-foreground">Last Working Date</Label>
                        <Input
                          type="date"
                          value={formData.resignationInfo?.lastWorkingDate || ""}
                          onChange={(e) => handleNestedChange("resignationInfo", "lastWorkingDate", e.target.value)}
                          className="w-full bg-input border-border"
                          readOnly={readOnly}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="exitInterview"
                          checked={formData.resignationInfo?.exitInterviewCompleted || false}
                          onChange={(e) =>
                            handleNestedChange("resignationInfo", "exitInterviewCompleted", e.target.checked)
                          }
                          disabled={readOnly}
                          className="rounded border-border"
                        />
                        <Label htmlFor="exitInterview" className="text-card-foreground">
                          Exit Interview Completed
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="assetsReturned"
                          checked={formData.resignationInfo?.assetsReturned || false}
                          onChange={(e) => handleNestedChange("resignationInfo", "assetsReturned", e.target.checked)}
                          disabled={readOnly}
                          className="rounded border-border"
                        />
                        <Label htmlFor="assetsReturned" className="text-card-foreground">
                          Assets Returned
                        </Label>
                      </div>
                    </div>

                    {/* Rehire Eligibility */}
                    <Card className="bg-warning/5 border-warning/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          Rehire Eligibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Label className="text-card-foreground">Eligible for rehire in the future?</Label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="rehireEligible"
                                checked={formData.resignationInfo?.rehireEligible === true}
                                onChange={() => handleNestedChange("resignationInfo", "rehireEligible", true)}
                                disabled={readOnly}
                                className="text-primary"
                              />
                              <span className="text-card-foreground">Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="rehireEligible"
                                checked={formData.resignationInfo?.rehireEligible === false}
                                onChange={() => handleNestedChange("resignationInfo", "rehireEligible", false)}
                                disabled={readOnly}
                                className="text-primary"
                              />
                              <span className="text-card-foreground">No (Blacklisted)</span>
                            </label>
                          </div>
                        </div>

                        {formData.resignationInfo?.rehireEligible === false && (
                          <div className="space-y-2">
                            <Label className="text-card-foreground">Blacklist Reason</Label>
                            <Textarea
                              value={formData.resignationInfo?.blacklistReason || ""}
                              onChange={(e) => handleNestedChange("resignationInfo", "blacklistReason", e.target.value)}
                              placeholder="Enter reason for blacklisting..."
                              className="bg-input border-border min-h-[80px]"
                              readOnly={readOnly}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
