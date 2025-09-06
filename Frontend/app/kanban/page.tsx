"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskModal } from "@/components/task-modal"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  assignee: {
    id: string
    name: string
    avatar: string
  }
  dueDate: string
  priority: "low" | "medium" | "high"
  labels: string[]
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create wireframes and high-fidelity mockups for the new homepage design",
    status: "todo",
    assignee: { id: "1", name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    dueDate: "2024-02-20",
    priority: "high",
    labels: ["design", "frontend"],
  },
  {
    id: "2",
    title: "Implement user authentication",
    description: "Set up login/signup functionality with JWT tokens",
    status: "in-progress",
    assignee: { id: "2", name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" },
    dueDate: "2024-02-18",
    priority: "high",
    labels: ["backend", "security"],
  },
  {
    id: "3",
    title: "Write API documentation",
    description: "Document all REST API endpoints with examples",
    status: "todo",
    assignee: { id: "3", name: "Carol Davis", avatar: "/placeholder.svg?height=32&width=32" },
    dueDate: "2024-02-25",
    priority: "medium",
    labels: ["documentation"],
  },
  {
    id: "4",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: "done",
    assignee: { id: "4", name: "David Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    dueDate: "2024-02-15",
    priority: "medium",
    labels: ["devops"],
  },
  {
    id: "5",
    title: "Mobile responsive design",
    description: "Ensure all pages work well on mobile devices",
    status: "in-progress",
    assignee: { id: "1", name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    dueDate: "2024-02-22",
    priority: "high",
    labels: ["design", "mobile"],
  },
]

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleCreateTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    }
    setTasks([...tasks, task])
    setIsCreateModalOpen(false)
  }

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setSelectedTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    setSelectedTask(null)
  }

  const handleMoveTask = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-screen bg-background">

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Task Board</h1>
              <p className="text-muted-foreground">Manage your tasks with drag-and-drop Kanban board.</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </motion.div>

          {/* Kanban Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <KanbanBoard tasks={filteredTasks} onMoveTask={handleMoveTask} onTaskClick={setSelectedTask} />
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <TaskModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateTask}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
