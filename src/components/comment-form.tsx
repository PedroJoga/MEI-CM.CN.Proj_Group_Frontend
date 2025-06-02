"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

type CommentFormProps = {
  onSubmit: (text: string, anonymous: boolean) => Promise<void>
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      setError("Comment cannot be empty.")
      return
    }

    setLoading(true)
    setError("")
    try {
      await onSubmit(text, anonymous)
      setText("")
      setAnonymous(false)
    } catch {
      setError("Error sending your comment.") // TODO , mensagens de erro não funcionais via props
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
    >
      <Card className="p-6 shadow-md mt-10">
        <div>
          <Label className="text-xl font-semibold pb-4" htmlFor="msg">Your Comment</Label>
          <Textarea
            id="msg"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write something..."
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
          {loading ? "Sending..." : "Send a comment"}
        </Button>
      </Card>
    </motion.form>
  )
}
