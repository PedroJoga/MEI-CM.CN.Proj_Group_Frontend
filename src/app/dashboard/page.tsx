"use client"

import { useEffect, useState } from "react"
import { api } from "@/services/api"

import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SidebarInset } from "@/components/ui/sidebar"

type Container = {
  id: number
  name: string
  subDomain: string
  dockerImage: string
  exposedPort: number
  status: string
}

export default function Page() {
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContainers = async () => {
    api.get("/containers/user")
    .then((res) => {
      setContainers(res.data)
      setError(null)
    })
    .catch((err) => {
      setError("Erro ao carregar os containers." + (err.response?.data?.message || ""))
      setContainers([])
    })
    .finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    loadContainers()
  }, [])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full pt-10">
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />

                {loading && (
                  <p className="text-sm text-muted-foreground">Carregando containers...</p>
                )}

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                {!loading && !error && (
                  <DataTable data={containers} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </div>
  )
}
