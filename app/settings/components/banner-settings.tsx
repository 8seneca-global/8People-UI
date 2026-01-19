"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Upload, X, Eye, GripVertical, Trash2, Image as ImageIcon, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { useStore, type Banner } from "@/lib/store"
import Cropper from "react-easy-crop"
import getCroppedImg from "@/lib/canvas-utils"

// Extended Banner type for local handling including File for upload
interface LocalBanner extends Banner {
    file?: File
}

export function BannerSettings() {
    const { banners: storeBanners, setBanners: setStoreBanners } = useStore()

    // Local buffer state
    const [banners, setBanners] = useState<LocalBanner[]>([])
    // Track if we have unsaved changes
    const [isDirty, setIsDirty] = useState(false)

    const [isDragOver, setIsDragOver] = useState(false)
    const [draggedBannerId, setDraggedBannerId] = useState<string | null>(null)

    // Modal states
    const [previewBanner, setPreviewBanner] = useState<Banner | null>(null)
    const [croppingImage, setCroppingImage] = useState<string | null>(null)

    // Cropper states
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const [isSaving, setIsSaving] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Initialize local state from store on mount
    useEffect(() => {
        setBanners(storeBanners)
    }, [storeBanners])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            handleFiles(files)
            // Reset input to allow same file selection again
            e.target.value = ""
        }
    }

    const handleFiles = (files: File[]) => {
        const validFiles = files.filter((file) => file.type.startsWith("image/"))

        if (validFiles.length === 0) {
            if (files.length > 0) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload image files only.",
                    variant: "destructive",
                })
            }
            return
        }

        // For cropping flow, we process one image at a time
        // If multiple dragged, we'll just take the first one or queue them in a real app
        // Here we take the first valid file to crop
        const file = validFiles[0]
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            setCroppingImage(reader.result as string)
            setZoom(1)
            setCrop({ x: 0, y: 0 })
        })
        reader.readAsDataURL(file)
    }

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleCropSave = async () => {
        if (!croppingImage || !croppedAreaPixels) return

        try {
            const croppedFile = await getCroppedImg(croppingImage, croppedAreaPixels)

            if (!croppedFile) {
                throw new Error("Failed to crop image")
            }

            const newBanner: LocalBanner = {
                id: `temp-${Math.random().toString(36).substr(2, 9)}`,
                url: URL.createObjectURL(croppedFile),
                name: `Banner ${banners.length + 1}`,
                isActive: true,
                order: banners.length,
                file: croppedFile,
            }

            setBanners((prev) => [...prev, newBanner])
            setIsDirty(true)
            setCroppingImage(null) // Close modal

            toast({
                title: "Banner Added",
                description: "Don't forget to save your changes.",
            })
        } catch (e) {
            console.error(e)
            toast({
                title: "Error",
                description: "Failed to crop image.",
                variant: "destructive",
            })
        }
    }

    const handleDelete = (id: string) => {
        setBanners((prev) => prev.filter((b) => b.id !== id))
        setIsDirty(true)
    }

    const handleToggleActive = (id: string) => {
        setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)))
        setIsDirty(true)
    }

    // Sorting Drag & Drop handlers
    const handleSortDragStart = (e: React.DragEvent, id: string) => {
        setDraggedBannerId(id)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleSortDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        if (!draggedBannerId || draggedBannerId === targetId) return

        const draggedIndex = banners.findIndex((b) => b.id === draggedBannerId)
        const targetIndex = banners.findIndex((b) => b.id === targetId)

        if (draggedIndex === -1 || targetIndex === -1) return

        const newBanners = [...banners]
        const [draggedItem] = newBanners.splice(draggedIndex, 1)
        newBanners.splice(targetIndex, 0, draggedItem)

        // Update orders
        const reordered = newBanners.map((b, idx) => ({ ...b, order: idx }))
        setBanners(reordered)
        setDraggedBannerId(null)
        setIsDirty(true)
    }

    const handleSortDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = (error) => reject(error)
        })
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Process any banners that have files attached (convert to Base64)
            const processedBanners = await Promise.all(
                banners.map(async (banner) => {
                    if (banner.file) {
                        // Convert to base64 for persistent "URL" simulation
                        try {
                            const base64 = await convertFileToBase64(banner.file)
                            const { file, ...rest } = banner
                            return { ...rest, url: base64, id: banner.id.startsWith("temp-") ? `bn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : banner.id }
                        } catch (e) {
                            console.error("Failed to convert file", e)
                            throw new Error(`Failed to process image: ${banner.name}`)
                        }
                    }
                    const { file, ...rest } = banner
                    return rest
                })
            )

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // Update global store
            setStoreBanners(processedBanners)
            setIsDirty(false)

            toast({
                title: "Settings Saved",
                description: "Banner configurations have been updated successfully."
            })
        } catch (error) {
            toast({
                title: "Save Failed",
                description: error instanceof Error ? error.message : "An error occurred while saving.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Derived state for display - sort by order
    // Note: we use local 'banners' state for display to reflect immediate changes
    const displayBanners = [...banners].sort((a, b) => a.order - b.order)

    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="text-card-foreground flex justify-between items-center">
                    <span>Banner & Branding Management</span>
                    {isDirty && <Badge variant="secondary" className="text-xs">Unsaved Changes</Badge>}
                </CardTitle>
                <CardDescription>Upload and manage banners for the Employee Dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        // multiple - disabled for crop flow simplicity, one at a time
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-secondary">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium">Click to upload or drag and drop</div>
                        <p className="text-xs text-muted-foreground">Required aspect ratio: 3:1 (e.g., 1500x500px)</p>
                    </div>
                </div>

                {/* Banner List */}
                <div className="space-y-3">
                    <Label>Uploaded Banners</Label>
                    {displayBanners.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg border-border border-dashed">
                            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No banners uploaded yet</p>
                        </div>
                    ) : (
                        displayBanners.map((banner) => (
                            <div
                                key={banner.id}
                                draggable
                                onDragStart={(e) => handleSortDragStart(e, banner.id)}
                                onDragOver={handleSortDragOver}
                                onDrop={(e) => handleSortDrop(e, banner.id)}
                                className={`flex items-center gap-4 rounded-lg border p-3 bg-card transition-all ${draggedBannerId === banner.id ? "opacity-50" : ""
                                    } ${banner.id.startsWith('temp-') ? "border-l-4 border-l-warning" : ""}`}
                            >
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />

                                {/* Thumbnail */}
                                <div className="h-16 w-32 relative rounded overflow-hidden bg-secondary flex-shrink-0">
                                    <img
                                        src={banner.url || "/placeholder.svg"}
                                        alt={banner.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium truncate">{banner.name}</p>
                                        {banner.id.startsWith('temp-') && <Badge variant="outline" className="text-[10px] h-5">New</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Original Size: 3:1 Ratio</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 mr-2">
                                        <Label htmlFor={`active-${banner.id}`} className="text-xs font-normal text-muted-foreground">
                                            {banner.isActive ? "Active" : "Inactive"}
                                        </Label>
                                        <Switch
                                            id={`active-${banner.id}`}
                                            checked={banner.isActive}
                                            onCheckedChange={() => handleToggleActive(banner.id)}
                                        />
                                    </div>

                                    <Button variant="ghost" size="icon" onClick={() => setPreviewBanner(banner)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(banner.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !isDirty}
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </CardContent>

            {/* Crop Modal */}
            <Dialog open={!!croppingImage} onOpenChange={(open) => !open && setCroppingImage(null)}>
                <DialogContent className="max-w-3xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Crop Banner</DialogTitle>
                    </DialogHeader>

                    <div className="relative h-[400px] w-full bg-black rounded-md overflow-hidden">
                        {croppingImage && (
                            <Cropper
                                image={croppingImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={3 / 1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-4">
                            <ZoomOut className="h-4 w-4 text-muted-foreground" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(vals) => setZoom(vals[0])}
                                className="flex-1"
                            />
                            <ZoomIn className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCroppingImage(null)}>Cancel</Button>
                        <Button onClick={handleCropSave}>Set Banner</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Modal */}
            <Dialog open={!!previewBanner} onOpenChange={(open) => !open && setPreviewBanner(null)}>
                <DialogContent className="max-w-4xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Banner Preview</DialogTitle>
                    </DialogHeader>
                    {previewBanner && (
                        <div className="space-y-4">
                            <div className="w-full h-[300px] bg-secondary rounded-lg overflow-hidden relative group">
                                <img
                                    src={previewBanner.url}
                                    alt={previewBanner.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay simulating dashboard context */}
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                                    <h3 className="text-2xl font-bold">Good Morning, Employee</h3>
                                    <p>Welcome back to the dashboard.</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <p>{previewBanner.name}</p>
                                <Badge variant={previewBanner.isActive ? "default" : "secondary"}>
                                    {previewBanner.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
