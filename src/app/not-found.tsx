"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-6">
      <h1 className="text-4xl font-bold">404 - Page not found</h1>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  )
}
