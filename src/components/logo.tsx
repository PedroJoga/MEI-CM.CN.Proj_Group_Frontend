"use client"
import { cn } from '@/lib/utils'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-10 w-10', className)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            >
            <rect x="3" y="10" width="4" height="4" rx="1" strokeWidth="1" />
            <rect x="9" y="8" width="4" height="6" rx="1" strokeWidth="1" />
            <rect x="15" y="6" width="4" height="8" rx="1" strokeWidth="1" />
            <path
                d="M3 18h18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1z"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}




