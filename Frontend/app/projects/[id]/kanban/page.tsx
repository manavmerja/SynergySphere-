"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Plus, MoreHorizontal, Lock, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Task {
  id: number
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee: {
    id: number
    name: string
    avatar: string
  }
  assigneeId: number
  dueDate: string
}

const currentUser = {
  id: 1,
  name: "Alice Johnson",
  role: "admin" as "owner" | "admin" | "member",
}

const projectData = {
  id: 1,
  name: "Website Redesign",
  ownerId: 2, // Different from current user to test admin permissions
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Design mockups",
    description: "Create initial design mockups for the homepage",
    status: "done",
    priority: "high",
    assignee: { id: 2, name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" },
    assigneeId: 2,
    dueDate: "2024-01-15",
  },
  {
    id: 2,
    title: "Frontend development",
    description: "Implement responsive design components",
    status: "in-progress",
    priority: "high",
    assignee: { id: 1, name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    assigneeId: 1, // Current user's task
    dueDate: "2024-02-01",
  },
  {
    id: 3,
    title: "Backend integration",
    description: "Connect frontend with API endpoints",
    status: "in-progress",
    priority: "medium",
    assignee: { id: 4, name: "David Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    assigneeId: 4,
    dueDate: "2024-02-05",
  },
  {
    id: 4,
    title: "Testing & QA",
    description: "Comprehensive testing of all features",
    status: "todo",
    priority: "medium",
    assignee: { id: 5, name: "Eva Brown", avatar: "/placeholder.svg?height=32&width=32" },
    assigneeId: 5,
    dueDate: "2024-02-10",
  },
  {
    id: 5,
    title: "Deployment",
    description: "Deploy to production environment",
    status: "todo",
    priority: "low",
    assignee: { id: 1, name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    assigneeId: 1, // Current user's task
    dueDate: "2024-02-15",
  },
]

const columns = [
  { id: "todo", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900" },
]

export default function ProjectKanbanPage({ params }: { params: { id: string } }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const { toast } = useToast()

  const canMoveTask = (task: Task) => {
    // Owner can move any task
    if (currentUser.id === projectData.ownerId) return true
    // Admin can move any task in the project
    if (currentUser.role === "admin") return true
    // Members can only move their own tasks
    return task.assigneeId === currentUser.id
  }

  const canDeleteTask = () => {
    // Only project owner can delete tasks
    return currentUser.id === projectData.ownerId
  }

  const canAddTask = () => {
    // Only project owner can add tasks
    return currentUser.id === projectData.ownerId
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleDragStart = (task: Task) => {
    if (canMoveTask(task)) {
      setDraggedTask(task)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: "todo" | "in-progress" | "done") => {
    e.preventDefault()
    if (draggedTask && canMoveTask(draggedTask)) {
      setTasks((prev) => prev.map((task) => (task.id === draggedTask.id ? { ...task, status: newStatus } : task)))
      setDraggedTask(null)
      toast({
        title: "Task Updated",
        description: "Task status has been updated successfully.",
      })
    }
  }

  const handleDeleteTask = (taskId: number) => {
    if (canDeleteTask() && window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully.",
      })
    }
  }

  const getTasksByStatus = (status: "todo" | "in-progress" | "done") => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="flex h-screen bg-background">

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href={`/projects/${params.id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Project Kanban</h1>
                  <p className="text-muted-foreground">Manage tasks with drag and drop</p>
                </div>
              </div>
              {canAddTask() ? (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              ) : (
                <Button disabled variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Add Task (Owner Only)
                </Button>
              )}
            </div>

            {/* Permission Info */}
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Your Role:</strong> {currentUser.role} |<strong> Permissions:</strong>{" "}
                {currentUser.role === "owner"
                  ? "Full access"
                  : currentUser.role === "admin"
                    ? "Can move any task"
                    : "Can only move your own tasks"}
              </p>
            </div>
          </motion.div>

          {/* Kanban Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {columns.map((column) => (
              <div
                key={column.id}
                className={`${column.color} rounded-lg p-4 min-h-[600px]`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as "todo" | "in-progress" | "done")}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <Badge variant="secondary">
                    {getTasksByStatus(column.id as "todo" | "in-progress" | "done").length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {getTasksByStatus(column.id as "todo" | "in-progress" | "done").map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      draggable={canMoveTask(task)}
                      onDragStart={() => handleDragStart(task)}
                      className={`${canMoveTask(task) ? "cursor-move" : "cursor-not-allowed opacity-75"}`}
                    >
                      <Card className="hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                              {!canMoveTask(task) && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                              {canDeleteTask() && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-3">{task.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                {task.priority}
                              </Badge>
                              {task.assigneeId === currentUser.id && (
                                <Badge variant="outline" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{task.assignee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">Due: {task.dueDate}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
