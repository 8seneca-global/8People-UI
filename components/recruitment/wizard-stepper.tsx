import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
    id: number
    label: string
    description?: string
}

interface WizardStepperProps {
    steps: Step[]
    currentStep: number
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
    return (
        <nav aria-label="Progress">
            <ol className="flex items-center justify-center gap-2 md:gap-8">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const isCompleted = stepNumber < currentStep
                    const isCurrent = stepNumber === currentStep
                    const isUpcoming = stepNumber > currentStep

                    return (
                        <li key={step.id} className="flex items-center gap-2">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                                        isCompleted && "border-primary bg-primary text-primary-foreground",
                                        isCurrent && "border-primary bg-background text-primary",
                                        isUpcoming && "border-muted-foreground/30 bg-background text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{stepNumber}</span>
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="flex flex-col items-center">
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            isCurrent && "text-foreground",
                                            (isCompleted || isUpcoming) && "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    {step.description && (
                                        <span className="hidden text-xs text-muted-foreground md:block">{step.description}</span>
                                    )}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "hidden h-0.5 w-12 md:block lg:w-24",
                                        stepNumber < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                                    )}
                                />
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
