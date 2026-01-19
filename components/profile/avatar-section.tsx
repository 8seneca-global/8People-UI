"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Eye, Upload, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface AvatarSectionProps {
  userName: string
  profileImage?: string
  onImageChange?: (imageData: string) => void
}

export function AvatarSection({ userName, profileImage, onImageChange }: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const initials =
    userName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setSelectedImage(imageData)
        setCropDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropConfirm = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const size = Math.min(canvas.width, canvas.height)
      const x = (canvas.width - size) / 2
      const y = (canvas.height - size) / 2

      const finalCanvas = document.createElement("canvas")
      finalCanvas.width = 200
      finalCanvas.height = 200
      const finalCtx = finalCanvas.getContext("2d")
      if (!finalCtx) return

      finalCtx.translate(100, 100)
      finalCtx.rotate((rotation * Math.PI) / 180)
      finalCtx.translate(-100, -100)

      finalCtx.drawImage(
        imageRef.current,
        (100 - 100 / zoom) * (zoom > 1 ? zoom : 1),
        (100 - 100 / zoom) * (zoom > 1 ? zoom : 1),
        200 * zoom,
        200 * zoom,
      )

      const croppedImageData = finalCanvas.toDataURL()
      onImageChange?.(croppedImageData)
      setCropDialogOpen(false)
      setSelectedImage(null)
      setZoom(1)
      setRotation(0)
    }
  }

  const handleDeleteImage = () => {
    setSelectedImage(null)
    setCropDialogOpen(false)
    onImageChange?.("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative cursor-pointer group">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary transition-all group-hover:ring-2 group-hover:ring-primary/50">
              {profileImage ? (
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt={userName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold">{initials}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-48">
          {profileImage && (
            <DropdownMenuItem
              onClick={() => {
                window.open(profileImage, "_blank")
              }}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Profile Picture
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Change Profile Picture
          </DropdownMenuItem>
          {profileImage && (
            <DropdownMenuItem onClick={handleDeleteImage} variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Profile Picture
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>Adjust the zoom and rotation to crop your profile picture</DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-center bg-secondary rounded-lg p-4 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="max-h-64 max-w-64"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
                <img
                  ref={imageRef}
                  src={selectedImage || "/placeholder.svg"}
                  alt="Crop preview"
                  className="hidden"
                  onLoad={() => {
                    if (canvasRef.current && imageRef.current) {
                      const canvas = canvasRef.current
                      const ctx = canvas.getContext("2d")
                      const img = imageRef.current

                      if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                        ctx.save()
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.rotate((rotation * Math.PI) / 180)
                        ctx.scale(zoom, zoom)
                        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height)
                        ctx.restore()
                      }
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <Slider
                  value={[zoom]}
                  onValueChange={(val) => {
                    const newZoom = val[0]
                    setZoom(newZoom)
                    if (canvasRef.current && imageRef.current) {
                      const canvas = canvasRef.current
                      const ctx = canvas.getContext("2d")
                      const img = imageRef.current
                      if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                        ctx.save()
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.rotate((rotation * Math.PI) / 180)
                        ctx.scale(newZoom, newZoom)
                        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height)
                        ctx.restore()
                      }
                    }
                  }}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rotation</label>
                <Slider
                  value={[rotation]}
                  onValueChange={(val) => {
                    const newRotation = val[0]
                    setRotation(newRotation)
                    if (canvasRef.current && imageRef.current) {
                      const canvas = canvasRef.current
                      const ctx = canvas.getContext("2d")
                      const img = imageRef.current
                      if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                        ctx.save()
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.rotate((newRotation * Math.PI) / 180)
                        ctx.scale(zoom, zoom)
                        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height)
                        ctx.restore()
                      }
                    }
                  }}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCropDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm}>Save Picture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
