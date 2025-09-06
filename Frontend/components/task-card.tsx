"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Trash2, Lock } from "lucide-react"
import type { Task } from "../../_kanban/page"

interface TaskCardProps {
  task: Task
  onDragStart: () => void
  onDragEnd: () => void
  onClick: () => void
  isDragging: boolean
  canMove?: boolean
  canDelete?: boolean
  currentUser?: {
    id: number
    name: string
    role: "owner" | "admin" | "member"
  }
}

export function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onClick,
  isDragging,
  canMove = true,
  canDelete = false,
  currentUser,
}: TaskCardProps) {
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

  const isOverdue = new Date(task.dueDate) < new Date()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canDelete && window.confirm("Are you sure you want to delete this task?")) {
      // In real app, this would call an API to delete the task
      console.log("Deleting task:", task.id)
    }
  }

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} animate={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${!canMove ? "opacity-75" : ""}`}
        draggable={canMove}
        onDragStart={canMove ? onDragStart : undefined}
        onDragEnd={canMove ? onDragEnd : undefined}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Priority and Labels */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(task.priority)} variant="secondary">
                {task.priority}
              </Badge>
              {!canMove && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {task.labels.slice(0, 2).map((label) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
                {task.labels.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{task.labels.length - 2}
                  </Badge>
                )}
              </div>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-tight">{task.title}</h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{task.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
              {currentUser && task.assigneeId === currentUser.id && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
            </div>

            <div className={`flex items-center text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
              {isOverdue ? <Clock className="mr-1 h-3 w-3" /> : <Calendar className="mr-1 h-3 w-3" />}
              {task.dueDate}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
