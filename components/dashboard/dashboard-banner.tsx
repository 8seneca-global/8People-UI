"use client"

import { useStore } from "@/lib/store"

export function DashboardBanner() {
    const { banners } = useStore()

    // Find the first active banner, sorted by order
    const activeBanner = banners
        .filter((b) => b.isActive)
        .sort((a, b) => a.order - b.order)[0]

    if (!activeBanner) {
        return null
    }

    return (
        <div className="w-full aspect-[3/1] rounded-lg overflow-hidden relative mb-6">
            <img
                src={activeBanner.url}
                alt={activeBanner.name}
                className="w-full h-full object-cover"
            />
            {/* Optional overlay for better text contrast if we had text over it, 
          but requirements just requested the image with minimal styling */}
        </div>
    )
}
