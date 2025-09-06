"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Calendar, Users, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {useRequireAuth} from "@/app/utils/auth"

const projects = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design and improved user experience",
    progress: 75,
    dueDate: "2024-02-15",
    members: [
      { name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Carol Davis", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "active",
    priority: "high",
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "iOS and Android app for customer portal with real-time notifications",
    progress: 45,
    dueDate: "2024-03-20",
    members: [
      { name: "David Wilson", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Eva Brown", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "active",
    priority: "medium",
  },
  {
    id: 3,
    name: "Marketing Campaign",
    description: "Q1 digital marketing strategy implementation across all channels",
    progress: 90,
    dueDate: "2024-01-30",
    members: [
      { name: "Frank Miller", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Grace Lee", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Henry Chen", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "review",
    priority: "high",
  },
  {
    id: 4,
    name: "Database Migration",
    description: "Migrate legacy systems to cloud infrastructure for better performance",
    progress: 20,
    dueDate: "2024-04-10",
    members: [
      { name: "Ivy Rodriguez", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jack Thompson", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "planning",
    priority: "low",
  },
  {
    id: 5,
    name: "Security Audit",
    description: "Comprehensive security review and vulnerability assessment",
    progress: 60,
    dueDate: "2024-02-28",
    members: [{ name: "Kate Williams", avatar: "/placeholder.svg?height=32&width=32" }],
    status: "active",
    priority: "high",
  },
  {
    id: 6,
    name: "API Documentation",
    description: "Create comprehensive API documentation for developers",
    progress: 35,
    dueDate: "2024-03-15",
    members: [
      { name: "Liam Johnson", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Mia Davis", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "active",
    priority: "medium",
  },
]

export default function ProjectsPage() {
    useRequireAuth();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "review":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
              <p className="text-muted-foreground">Manage and track all your team projects in one place.</p>
            </div>
            <Button className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              New Project
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
              <Input placeholder="Search projects..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                          <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                        </div>
                      </div>
                      <CardDescription className="text-sm">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            {project.dueDate}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="flex -space-x-2">
                              {project.members.slice(0, 3).map((member, idx) => (
                                <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {project.members.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">+{project.members.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
