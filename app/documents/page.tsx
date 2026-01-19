"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, Calendar, ChevronDown, ChevronRight, Edit, Trash2, Upload } from "lucide-react"
import { useStore } from "@/lib/store"

interface Document {
    id: string
    title: string
    category: "policy" | "benefits" | "handbook" | "guide" | "form"
    description: string
    uploadedDate: string
    fileSize: string
    fileType: string
}

const documents: Document[] = [
    {
        id: "doc-001",
        title: "Employee Handbook 2026",
        category: "handbook",
        description: "Complete guide to company policies, culture, and expectations for all employees.",
        uploadedDate: "2026-01-01",
        fileSize: "2.4 MB",
        fileType: "PDF",
    },
    {
        id: "doc-002",
        title: "Benefits Guide",
        category: "benefits",
        description: "Comprehensive overview of health insurance, retirement plans, and other employee benefits.",
        uploadedDate: "2026-01-01",
        fileSize: "1.8 MB",
        fileType: "PDF",
    },
    {
        id: "doc-010",
        title: "Wellness Program Guide",
        category: "benefits",
        description: "Information about company wellness initiatives, fitness reimbursements, and mental health resources.",
        uploadedDate: "2026-01-05",
        fileSize: "1.3 MB",
        fileType: "PDF",
    },
    {
        id: "doc-003",
        title: "Code of Conduct",
        category: "policy",
        description: "Professional standards and ethical guidelines for workplace behavior.",
        uploadedDate: "2025-12-15",
        fileSize: "856 KB",
        fileType: "PDF",
    },
    {
        id: "doc-004",
        title: "Remote Work Policy",
        category: "policy",
        description: "Guidelines and requirements for remote and hybrid work arrangements.",
        uploadedDate: "2025-11-20",
        fileSize: "645 KB",
        fileType: "PDF",
    },
    {
        id: "doc-005",
        title: "Leave Policy",
        category: "policy",
        description: "Detailed information about vacation, sick leave, parental leave, and other time-off policies.",
        uploadedDate: "2026-01-01",
        fileSize: "1.2 MB",
        fileType: "PDF",
    },
    {
        id: "doc-006",
        title: "Data Security Guidelines",
        category: "policy",
        description: "Best practices for protecting company and customer data, including password policies and device security.",
        uploadedDate: "2025-10-30",
        fileSize: "980 KB",
        fileType: "PDF",
    },
    {
        id: "doc-007",
        title: "IT Support Guide",
        category: "guide",
        description: "How to request IT support, troubleshoot common issues, and access technical resources.",
        uploadedDate: "2025-12-01",
        fileSize: "1.5 MB",
        fileType: "PDF",
    },
    {
        id: "doc-009",
        title: "Performance Review Guidelines",
        category: "guide",
        description: "Framework and best practices for conducting employee performance reviews.",
        uploadedDate: "2025-11-10",
        fileSize: "1.1 MB",
        fileType: "PDF",
    },
    {
        id: "doc-008",
        title: "Expense Reimbursement Form",
        category: "form",
        description: "Template for submitting business expense reimbursement requests.",
        uploadedDate: "2025-09-15",
        fileSize: "245 KB",
        fileType: "PDF",
    },
]

export default function DocumentsPage() {
    const { currentRole } = useStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedSections, setExpandedSections] = useState<string[]>(["handbook", "benefits", "policy", "guide", "form"])
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
    const [uploadForm, setUploadForm] = useState({
        title: "",
        description: "",
        category: "policy" as Document["category"],
        fileUrl: "",
    })
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        category: "policy" as Document["category"],
        fileUrl: "",
    })


    // Check if user can manage documents (admin or hr role)
    const canManageDocuments = currentRole === "admin" || currentRole === "hr"

    // Debug logging
    console.log("Current Role:", currentRole)
    console.log("Can Manage Documents:", canManageDocuments)

    const toggleSection = (section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
        )
    }

    const handleUploadDocument = () => {
        // TODO: Add document to store
        console.log("Upload document:", uploadForm)
        setIsUploadDialogOpen(false)
        setUploadForm({ title: "", description: "", category: "policy", fileUrl: "" })
    }

    const handleEditDocument = (doc: Document) => {
        setSelectedDocument(doc)
        setEditForm({
            title: doc.title,
            description: doc.description,
            category: doc.category,
            fileUrl: "", // Reset file url for new upload
        })
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = () => {
        console.log("Update document:", selectedDocument?.id, editForm)
        setIsEditDialogOpen(false)
        setSelectedDocument(null)
    }

    const handleDeleteDocument = (doc: Document) => {
        setSelectedDocument(doc)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        console.log("Delete document:", selectedDocument?.id)
        setIsDeleteDialogOpen(false)
        setSelectedDocument(null)
    }

    const categoryInfo = {
        handbook: { title: "Employee Handbook", icon: "📖" },
        benefits: { title: "Benefits & Wellness", icon: "💚" },
        policy: { title: "Company Policies", icon: "📋" },
        guide: { title: "Guides & Resources", icon: "📚" },
        form: { title: "Forms & Templates", icon: "📄" },
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    }

    // Filter documents by search query
    const filteredDocuments = documents.filter(
        (doc) =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Group documents by category
    const groupedDocuments = filteredDocuments.reduce(
        (acc, doc) => {
            if (!acc[doc.category]) {
                acc[doc.category] = []
            }
            acc[doc.category].push(doc)
            return acc
        },
        {} as Record<string, Document[]>
    )

    const renderDocument = (doc: Document) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{doc.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{doc.description}</p>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(doc.uploadedDate)}</span>
                                <span>•</span>
                                <span>{doc.fileSize}</span>
                            </div>
                            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                                <Download className="h-3 w-3" />
                                Download
                            </button>
                        </div>
                        {canManageDocuments && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleEditDocument(doc)}
                                >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteDocument(doc)}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <AdminLayout title="Documents" subtitle="Company policies, benefits, and resources">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Search Bar and Upload Button */}
                <div className="flex gap-4">
                    <Card className="flex-1">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search documents..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    {canManageDocuments && (
                        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 shrink-0">
                                    <Upload className="h-4 w-4" />
                                    Upload Document
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Upload New Document</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="doc-title">Title</Label>
                                        <Input
                                            id="doc-title"
                                            placeholder="Document title"
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="doc-description">Description</Label>
                                        <Textarea
                                            id="doc-description"
                                            placeholder="Brief description of the document"
                                            value={uploadForm.description}
                                            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="doc-category">Category</Label>
                                        <Select
                                            value={uploadForm.category}
                                            onValueChange={(v) => setUploadForm({ ...uploadForm, category: v as Document["category"] })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="handbook">Employee Handbook</SelectItem>
                                                <SelectItem value="benefits">Benefits & Wellness</SelectItem>
                                                <SelectItem value="policy">Company Policy</SelectItem>
                                                <SelectItem value="guide">Guide & Resource</SelectItem>
                                                <SelectItem value="form">Form & Template</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="doc-file">Upload File</Label>
                                        <Input
                                            id="doc-file"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    console.log("Selected file:", file.name, file.size, file.type)
                                                    setUploadForm({ ...uploadForm, fileUrl: file.name })
                                                }
                                            }}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Supported formats: PDF, Word, Excel, PowerPoint (Max 10MB)
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUploadDocument}>Upload</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Document Sections */}
                <div className="space-y-4">
                    {Object.entries(categoryInfo).map(([category, info]) => {
                        const categoryDocs = groupedDocuments[category as Document["category"]] || []
                        const isExpanded = expandedSections.includes(category)

                        if (categoryDocs.length === 0) return null

                        return (
                            <Card key={category}>
                                <CardHeader
                                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                                    onClick={() => toggleSection(category)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{info.icon}</span>
                                            <div>
                                                <CardTitle className="text-lg">{info.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {categoryDocs.length} {categoryDocs.length === 1 ? "document" : "documents"}
                                                </p>
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {isExpanded && (
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categoryDocs.map(renderDocument)}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        )
                    })}
                </div>

                {/* Empty State */}
                {filteredDocuments.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No documents found matching your search</p>
                        </CardContent>
                    </Card>
                )}
                {/* Edit Document Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Document</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    placeholder="Document title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Brief description of the document"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Select
                                    value={editForm.category}
                                    onValueChange={(v) => setEditForm({ ...editForm, category: v as Document["category"] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="handbook">Employee Handbook</SelectItem>
                                        <SelectItem value="benefits">Benefits & Wellness</SelectItem>
                                        <SelectItem value="policy">Company Policy</SelectItem>
                                        <SelectItem value="guide">Guide & Resource</SelectItem>
                                        <SelectItem value="form">Form & Template</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-file">Replace File (Optional)</Label>
                                <Input
                                    id="edit-file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            console.log("Selected file for edit:", file.name, file.size, file.type)
                                            setEditForm({ ...editForm, fileUrl: file.name })
                                        }
                                    }}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Current file will be kept if no new file is selected
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveEdit}>Save Changes</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Document Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Document</DialogTitle>
                        </DialogHeader>
                        <div className="pt-4 space-y-4">
                            <p className="text-muted-foreground">
                                Are you sure you want to delete the document <span className="font-semibold text-foreground">"{selectedDocument?.title}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleConfirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
