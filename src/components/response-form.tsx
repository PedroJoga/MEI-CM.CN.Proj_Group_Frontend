"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/services/api"

type ResponseFormProps = {
  onSubmit: (text: string, anonymous: boolean) => Promise<void>
}

export default function ResponseForm({ onSubmit }: ResponseFormProps) {
  const [text, setText] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      setError("A resposta não pode estar vazia.")
      return
    }

    setLoading(true)
    setError("")
    try {
      await onSubmit(text, anonymous)
      setText("")
      setAnonymous(false)
    } catch {
      setError("Error sending your response.")  // TODO , mensagens de erro não funcionais via props
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true)
    try {
      const response = await api.get("/comments/2/suggestions") 
      const data = response.data
      setSuggestions(data.map((item: { suggestion: string }) => item.suggestion))
    } catch (error) {
      setError("Error fetching suggestions. Error: " + error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
    >
      <Card className="p-6 shadow-md">
        <div>
          <Label className="text-xl font-semibold pb-4" htmlFor="msg">Your Response</Label>
          <Textarea
            id="msg"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer..."
            disabled={loading}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex items-stretch space-x-2">
          <Checkbox
            id="anonymous"
            checked={anonymous}
            onCheckedChange={(v) => setAnonymous(!!v)}
            disabled={loading}
          />
          <label htmlFor="anonymous" className="text-sm">
            Send anonymously
          </label>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send a response"}
        </Button>
     {/* Botão para buscar sugestões */}
     <div className="flex flex-col space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={fetchSuggestions}
            disabled={isLoadingSuggestions}
          >
            {isLoadingSuggestions ? "Loading suggestions..." : "Need inspiration?"}
          </Button>

          {/* Mostrar sugestões */}
          {isLoadingSuggestions && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {!isLoadingSuggestions && suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => setText(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.form>
  )
}