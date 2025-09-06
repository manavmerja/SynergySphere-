"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, Hash, Users, MessageSquare } from "lucide-react"
import { useRequireAuth } from "@/app/utils/auth"

// Ensure useRequireAuth returns { user, token }
type AuthResult = { user: User | null; token: string | null }

// You'll need to install and use a library like `socket.io-client`
import { io, Socket } from "socket.io-client"

// Define a base URL for your backend API
const API_BASE_URL = "http://localhost:3000/api"

interface User {
  _id: string
  name: string
  avatar: string
  email: string
}

interface Message {
  _id: string
  from: {
    _id: string
    name: string
    avatar: string
  }
  to: {
    _id: string
    name: string
    avatar: string
  }
  content: string
  createdAt: string
    readAt: string | null
    deliveredAt: string
  }

export default function DiscussionsPage() {
  const authResult = useRequireAuth() as unknown as AuthResult // ensure correct type
  const user = authResult?.user
  const token = authResult?.token

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({})
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // --- API Calls ---
  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const users: User[] = await res.json()
        setAllUsers(users)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }, [token])

  const fetchMessages = useCallback(async (peerId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${peerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const msgs: Message[] = await res.json()
        setMessages(msgs)
        // Mark messages as read after fetching
        if (msgs.length > 0) {
          await fetch(`${API_BASE_URL}/messages/${peerId}/read`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          })
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    }
  }, [token])

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const { unreadByUser } = await res.json()
        setUnreadCounts(unreadByUser)
      }
    } catch (err) {
      console.error("Failed to fetch unread counts:", err)
    }
  }, [token])

  // --- Socket.io Handlers ---
  useEffect(() => {
    if (!token) return

    const socket = io(API_BASE_URL.replace("/api", ""), {
      auth: { token },
    })

    socket.on("connect", () => console.log("Socket connected!"))
    socket.on("disconnect", () => console.log("Socket disconnected!"))
    socket.on("connect_error", (err) => console.error("Socket connection error:", err.message))

    // Real-time message receiver
    socket.on("chat:receive", (msg: Message) => {
      setMessages((prev) => [...prev, msg])
      // If the message is for the currently selected user, mark it as read
      if (selectedUser && msg.from._id === selectedUser._id && !msg.readAt) {
        socket.emit("chat:read", { messageIds: [msg._id] })
        fetchUnreadCounts()
      } else {
        fetchUnreadCounts()
      }
    })

    // Online presence updates
    socket.on("presence:update", ({ userId, online }: { userId: string; online: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        online ? next.add(userId) : next.delete(userId)
        return next
      })
    })

    // Typing indicators
    socket.on("chat:typing", ({ from, typing }: { from: string; typing: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev)
        typing ? next.add(from) : next.delete(from)
        return next
      })
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [token, selectedUser, fetchUnreadCounts])

  useEffect(() => {
    if (token) {
      fetchAllUsers()
      fetchUnreadCounts()
    }
  }, [token, fetchAllUsers, fetchUnreadCounts])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id)
    }
  }, [selectedUser, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, selectedUser])

  // --- Event Handlers ---
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return

    socketRef.current?.emit(
      "chat:send",
      {
        to: selectedUser._id,
        content: newMessage,
      },
      (response: any) => {
        if (response.ok) {
          setNewMessage("")
        } else {
          console.error("Message send failed:", response.error)
          // Handle blocked user case
          if (response.error === "USER_BLOCKED") {
            alert("You cannot send messages to this user because you are blocked or have blocked them.")
          }
        }
      },
    )
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (e.target.value.length > 0) {
      socketRef.current?.emit("chat:typing", { to: selectedUser?._id, typing: true })
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("chat:typing", { to: selectedUser?._id, typing: false })
      }, 3000)
    } else {
      socketRef.current?.emit("chat:typing", { to: selectedUser?._id, typing: false })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }))
    setSearchQuery("")
  }

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Users Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-80 border-r bg-card flex flex-col"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {filteredUsers.map((chatUser) => (
              <motion.div
                key={chatUser._id}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleUserSelect(chatUser)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?._id === chatUser._id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={chatUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{chatUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chatUser.name}</p>
                      <p className="text-sm opacity-70 truncate">{
                        onlineUsers.has(chatUser._id) ? "Online" : "Offline"
                      }</p>
                    </div>
                  </div>
                  {unreadCounts[chatUser._id] > 0 && (
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      {unreadCounts[chatUser._id]}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="p-6 border-b bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl font-semibold">{selectedUser.name}</h1>
                      <p className="text-sm text-muted-foreground">
                        {onlineUsers.has(selectedUser._id) ? "Online" : "Offline"}
                        {typingUsers.has(selectedUser._id) && " | Typing..."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex items-start space-x-3 ${
                        message.from._id === user?._id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`flex items-start space-x-3 ${message.from._id === user?._id ? "flex-row-reverse space-x-reverse" : ""}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.from.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{message.from.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center space-x-2 mb-1 ${message.from._id === user?._id ? "justify-end" : ""}`}>
                            <span className="font-semibold text-sm">{message.from.name}</span>
                            <span className="text-xs text-muted-foreground">{
                              new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            }</span>
                          </div>
                          <div className={`bg-muted rounded-lg p-3 max-w-2xl ${
                            message.from._id === user?._id ? "bg-primary text-primary-foreground" : ""
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
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
                      placeholder={`Message ${selectedUser.name}...`}
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      className="min-h-[44px] resize-none"
                    />
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a user to start a conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}