"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { api } from "@/services/api"

type Comment = {
  id: number
  text: string
  username: string
  userPhotoLink: string
  createdAt: string
}

type Response = {
  id: number
  text: string
  username: string
  userPhotoLink: string
  createdAt: string
}

export function CommentResponses({ comment }: { comment: Comment }) {
  const [responses, setResponses] = useState<Response[]>([])

  useEffect(() => {
    api.get(`/responses/comment/${comment.id}`)
      .then((res) => setResponses(res.data))
      .catch(() => setResponses([]))
  }, [comment.id])

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={comment.userPhotoLink} />
            <AvatarFallback>{comment.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{comment.username}</p>
            <p className="text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
            <p className="mt-2">{comment.text}</p>
          </div>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="responses">
            <AccordionTrigger>See responses ({responses.length})</AccordionTrigger>
            <AccordionContent>
              {responses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No response yet.</p>
              ) : (
                <div className="space-y-4 mt-2">
                  {responses.map((resp) => (
                    <div key={resp.id} className="flex items-start gap-3">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={resp.userPhotoLink} />
                        <AvatarFallback>{resp.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{resp.username}</p>
                        <p className="text-xs text-muted-foreground">{new Date(resp.createdAt).toLocaleString()}</p>
                        <p className="text-sm mt-1">{resp.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
