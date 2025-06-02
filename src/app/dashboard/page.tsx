"use client"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { CommentResponses } from "@/components/comment-responses"

type Comment = {
  id: number
  text: string
  username: string
  userPhotoLink: string
  createdAt: string
}

export default function Page() {
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    api.get("/comments/user")
      .then((res) => setComments(res.data))
      .catch(() => setComments([]))
  }, [])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6 pt-20">
        <h1 className="text-2xl font-bold">Your comments</h1>

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments found</p>
        ) : (
          comments.map((comment) => (
            <CommentResponses key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  )
}



