"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Smile, Paperclip } from "lucide-react"

interface Message {
  id: number
  author: string
  authorId: number
  message: string
  timestamp: string
  avatar?: string
}

interface ProjectChatProps {
  projectId: string
  projectName: string
  currentUser: any
  initialMessages?: Message[]
}

export function ProjectChat({ projectId, projectName, currentUser, initialMessages = [] }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now(),
      author: currentUser.name,
      authorId: currentUser.id,
      message: newMessage.trim(),
      timestamp: "Just now",
      avatar: currentUser.avatar || "/placeholder.svg",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate typing indicator for other users (in real app this would be via websocket)
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        // Simulate a response (in real app this would come from other users)
        if (Math.random() > 0.7) {
          const responses = [
            "Great point!",
            "I agree with that approach.",
            "Let me check on that.",
            "Thanks for the update!",
            "Looks good to me.",
          ]
          const responseMessage: Message = {
            id: Date.now() + 1,
            author: "Team Member",
            authorId: 999,
            message: responses[Math.floor(Math.random() * responses.length)],
            timestamp: "Just now",
            avatar: "/placeholder.svg",
          }
          setMessages((prev) => [...prev, responseMessage])
        }
      }, 2000)
    }, 1000)
  }

  const formatTimestamp = (timestamp: string) => {
    if (timestamp === "Just now") return timestamp
    // In real app, format actual timestamps
    return timestamp
  }

  return (
    <div className="flex flex-col h-[600px] bg-background border rounded-lg">
      {/* Chat Header */}
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold">Project Discussion</h3>
        <p className="text-sm text-muted-foreground">{projectName}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.authorId === currentUser.id ? "flex-row-reverse" : "flex-row"}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.avatar || "/placeholder.svg"} />
                <AvatarFallback>{message.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${message.authorId === currentUser.id ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{message.author}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                </div>
                <Card
                  className={`max-w-[70%] ${
                    message.authorId === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <CardContent className="p-3">
                    <p className="text-sm">{message.message}</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-3"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
            <Card className="bg-muted">
              <CardContent className="p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/50">
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
