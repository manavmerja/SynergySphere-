"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, Hash, Users, MessageSquare } from "lucide-react"

interface Message {
  id: string
  author: {
    id: string
    name: string
    avatar: string
  }
  content: string
  timestamp: string
  projectId?: string
}

interface Channel {
  id: string
  name: string
  type: "project" | "general"
  unreadCount: number
  lastMessage?: string
}

const mockChannels: Channel[] = [
  { id: "general", name: "General", type: "general", unreadCount: 0, lastMessage: "Welcome to the team!" },
  {
    id: "website-redesign",
    name: "Website Redesign",
    type: "project",
    unreadCount: 3,
    lastMessage: "The mockups look great!",
  },
  { id: "mobile-app", name: "Mobile App", type: "project", unreadCount: 1, lastMessage: "Testing on iOS devices" },
  {
    id: "marketing",
    name: "Marketing Campaign",
    type: "project",
    unreadCount: 0,
    lastMessage: "Campaign metrics are up",
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    author: { id: "1", name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    content: "Hey team! I've just uploaded the latest design mockups. Would love to get your feedback.",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    author: { id: "2", name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" },
    content: "Looking great! The color scheme really works well with our brand guidelines.",
    timestamp: "10:35 AM",
  },
  {
    id: "3",
    author: { id: "3", name: "Carol Davis", avatar: "/placeholder.svg?height=32&width=32" },
    content: "I agree with Bob. The responsive design looks solid too. How's the mobile experience?",
    timestamp: "10:42 AM",
  },
  {
    id: "4",
    author: { id: "1", name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    content: "Mobile looks great! I've tested it on various screen sizes. The navigation is smooth and intuitive.",
    timestamp: "10:45 AM",
  },
  {
    id: "5",
    author: { id: "4", name: "David Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    content: "Perfect! I'll start working on the frontend implementation this afternoon.",
    timestamp: "11:00 AM",
  },
]

export default function DiscussionsPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>("website-redesign")
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      author: { id: "current-user", name: "You", avatar: "/placeholder.svg?height=32&width=32" },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.author.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedChannelData = mockChannels.find((channel) => channel.id === selectedChannel)

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 overflow-hidden">
        {/* Channels Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-80 border-r bg-card flex flex-col"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Discussions</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {mockChannels.map((channel) => (
              <motion.div
                key={channel.id}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedChannel(channel.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChannel === channel.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {channel.type === "project" ? <Hash className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{channel.name}</p>
                      {channel.lastMessage && <p className="text-sm opacity-70 truncate">{channel.lastMessage}</p>}
                    </div>
                  </div>
                  {channel.unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 border-b bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedChannelData?.type === "project" ? (
                  <Hash className="h-5 w-5 text-primary" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-primary" />
                )}
                <div>
                  <h1 className="text-xl font-semibold">{selectedChannelData?.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedChannelData?.type === "project" ? "Project Discussion" : "General Chat"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                View Members
              </Button>
            </div>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start space-x-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{message.author.name}</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <div className="bg-muted rounded-lg p-3 max-w-2xl">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 border-t bg-card"
          >
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Input
                  placeholder={`Message #${selectedChannelData?.name.toLowerCase().replace(/\s+/g, "-")}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[44px] resize-none"
                />
              </div>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
