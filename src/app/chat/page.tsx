"use client"

import { useEffect, useState } from "react"
import { api } from "@/services/api"
import CommentForm from "@/components/comment-form"
import ResponseForm from "@/components/response-form"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from "sonner";

type Comment = {
  id: number
  text: string
  userPhotoLink: string
  username: string
  createdAt: string
}

enum ChatStep {
  RESPONSE,
  COMMENT,
  SUCCESS,
}

export default function ChatPage() {
  const [comment, setComment] = useState<Comment | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [step, setStep] = useState<ChatStep.RESPONSE | ChatStep.COMMENT | ChatStep.SUCCESS>(ChatStep.RESPONSE)

  const loadComment = async () => {
    try {
      const res = await api.get<Comment>("/comments/random")
      setComment(res.data)
    } catch (err) {
      toast.error("Error to get comment. Error: " + err);
    }
  }

  useEffect(() => {
    loadComment()
  }, [])

  const handleSendResponse = async (text: string, isAnonymous: boolean) => {
    if (!comment) return
    try {
      await api.post("/responses", {
        text,
        commentId: comment.id,
        isAnonymous,
      })
      setShowDialog(true)
    } catch (err) {
      toast.error("Error to send a response. Error: " + err);
    }
  }

  const handleSendComment = async (text: string, anonymous: boolean) => {
    try {
      await api.post("/comments", { text, anonymous })
      setStep(ChatStep.SUCCESS)
    } catch (err) {
      toast.error("Error to send a comment. Error: " + err)
    }
  }

  const handleReset = () => {
    setComment(null)
    setStep(ChatStep.RESPONSE)
    loadComment()
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center px-6 py-10 md:px-10">
      <div className="w-full max-w-2xl space-y-10">

        
        {step === ChatStep.RESPONSE && comment && (
          <Card className="mb-8 mt-10">
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={comment.userPhotoLink} />
                  <AvatarFallback>{comment.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{comment.username}</h3>
                  <Label className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Label>
                  <p className="mt-2">{comment.text}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === ChatStep.RESPONSE && comment && (
          <ResponseForm onSubmit={handleSendResponse} />
        )}

        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Response sent</AlertDialogTitle>
              <AlertDialogDescription>
                Your response has been sent successfully. You can now leave a comment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setStep(ChatStep.COMMENT)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {step === ChatStep.COMMENT && (
          <CommentForm onSubmit={handleSendComment} />
        )}

        {step === ChatStep.SUCCESS && (
            <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 shadow-md space-y-6 text-center">
              <h2 className="text-xl font-semibold text-green-600">
                Comment sent successfully.
              </h2>
              <Button onClick={handleReset}>Reply to another user</Button>
            </Card>
          </motion.div>
          )}
      </div>
    </div>
  )
}
