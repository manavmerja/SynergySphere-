"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TaskCard } from "@/components/task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/app/kanban/page"

interface KanbanBoardProps {
  tasks: Task[]
  onMoveTask: (taskId: string, newStatus: Task["status"]) => void
  onTaskClick: (task: Task) => void
  currentUser: {
    id: number
    name: string
    role: "owner" | "admin" | "member"
  }
  projectOwnerId: number
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900" },
] as const

export function KanbanBoard({ tasks, onMoveTask, onTaskClick, currentUser, projectOwnerId }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [draggedOver, setDraggedOver] = useState<string | null>(null)

  const canMoveTask = (task: Task) => {
    // Owner can move any task
    if (currentUser.id === projectOwnerId) return true
    // Admin can move any task in the project
    if (currentUser.role === "admin") return true
    // Members can only move their own tasks
    return task.assigneeId === currentUser.id
  }

  const handleDragStart = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task && canMoveTask(task)) {
      setDraggedTask(taskId)
    }
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDraggedOver(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDraggedOver(columnId)
  }

  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: Task["status"]) => {
    e.preventDefault()
    if (draggedTask) {
      const task = tasks.find((t) => t.id === draggedTask)
      if (task && canMoveTask(task)) {
        onMoveTask(draggedTask, columnId)
      }
    }
    setDraggedTask(null)
    setDraggedOver(null)
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id as Task["status"])
        const isDraggedOver = draggedOver === column.id

        return (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card
              className={`h-full transition-all duration-200 ${isDraggedOver ? "ring-2 ring-primary shadow-lg" : ""}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id as Task["status"])}
            >
              <CardHeader className={`${column.color} rounded-t-lg`}>
                <CardTitle className="flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="secondary" className="bg-white/20">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 min-h-[500px]">
                <AnimatePresence>
                  {columnTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <TaskCard
                        task={task}
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onTaskClick(task)}
                        isDragging={draggedTask === task.id}
                        canMove={canMoveTask(task)}
                        canDelete={currentUser.id === projectOwnerId}
                        currentUser={currentUser}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
