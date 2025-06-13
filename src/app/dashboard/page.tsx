import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-stretch justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6 pt-20">
        <h1 className="text-2xl font-bold">Your Applications</h1>
        <p>No applications yet</p>
        <Button>Create Application</Button>
      </div>
    </div>
  )
}



