"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle } from "lucide-react"
import { useStore } from "@/lib/store"

export function OnboardingChecklistModal() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { onboardingSteps } = useStore()
    const isPersonalComplete = onboardingSteps.personalInfo

    useEffect(() => {
        // Open immediately on mount to simulate "After log in successful"
        setOpen(true)
    }, [])

    useEffect(() => {
        if (isPersonalComplete && open) {
            const timer = setTimeout(() => {
                setOpen(false)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isPersonalComplete, open])

    const handleCompletePersonalInfo = () => {
        setOpen(false)
        router.push("/my-profile?edit=true")
    }

    // If complete, we might want to not show it at all if it was valid on mount?
    // But requirement says "check the step as complete and hide the modal".
    // This implies we show it checked first.

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome to 8People!</DialogTitle>
                    <DialogDescription>
                        {isPersonalComplete
                            ? "Great job! You've started your journey."
                            : "Please complete the following usage checklist to get started."}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-3 rounded-lg border ${isPersonalComplete ? 'bg-green-500/10 border-green-500/20' : 'bg-secondary/20'}`}>
                            {isPersonalComplete ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                                <p className={`font-medium text-sm ${isPersonalComplete ? 'text-green-900 dark:text-green-100' : ''}`}>
                                    Complete personal info
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isPersonalComplete ? "Completed" : "Update your details in My Profile"}
                                </p>
                            </div>
                            {!isPersonalComplete && (
                                <Button size="sm" onClick={handleCompletePersonalInfo}>
                                    Go to Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
