"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, UserPlus } from "lucide-react"
import Link from "next/link"
import { TeamManagementModal } from "@/components/team-management-modal"

const initialProjects = [
  {
    id: 1,
    name: "RD Services",
    description: "Complete overhaul of company website",
    progress: 75,
    dueDate: "21/03/22",
    tags: ["Services", "Customer Care"],
    taskCount: 10,
    image: "/placeholder.svg?key=8igeg",
    members: [
      { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Member", avatar: "/letter-j-typography.png" },
      {
        id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        role: "Member",
        avatar: "/letter-m-typography.png",
      },
      {
        id: "4",
        name: "Sarah Wilson",
        email: "sarah@example.com",
        role: "Member",
        avatar: "/abstract-letter-s.png",
      },
      { id: "5", name: "Tom Brown", email: "tom@example.com", role: "Member", avatar: "/letter-t-typography.png" },
    ],
  },
  {
    id: 2,
    name: "RD Sales",
    description: "iOS and Android app for customer portal",
    progress: 45,
    dueDate: "21/03/22",
    tags: ["Sales", "Customer Care"],
    taskCount: 8,
    image: "/placeholder.svg?key=ukh2j",
    members: [
      { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
      { id: "6", name: "Alex Davis", email: "alex@example.com", role: "Member", avatar: "/letter-a-abstract.png" },
      { id: "7", name: "Lisa Garcia", email: "lisa@example.com", role: "Member", avatar: "/letter-L-nature.png" },
    ],
  },
  {
    id: 3,
    name: "RD Upgrade",
    description: "Q1 digital marketing strategy implementation",
    progress: 90,
    dueDate: "21/03/22",
    tags: ["Upgrade", "Migration"],
    taskCount: 5,
    image: "/placeholder.svg?key=uveqo",
    members: [
      { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
      { id: "8", name: "Emma Taylor", email: "emma@example.com", role: "Member", avatar: "/letter-e-abstract.png" },
      { id: "9", name: "Chris Lee", email: "chris@example.com", role: "Member", avatar: "/letter-c-typography.png" },
    ],
  },
  {
    id: 4,
    name: "Database Migration",
    description: "Migrate legacy systems to cloud infrastructure",
    progress: 20,
    dueDate: "21/03/22", // Updated date format and added missing properties
    tags: ["Database", "Migration"],
    taskCount: 3,
    image: "/placeholder.svg?key=db123",
    members: [
      { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
      { id: "10", name: "David Kim", email: "david@example.com", role: "Member", avatar: "/letter-d-floral.png" },
    ],
  },
]

export default function DashboardPage() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    dueDate: "",
  })
  const [projects, setProjects] = useState(initialProjects)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<(typeof initialProjects)[0] | null>(null)

  const handleCreateProject = () => {
    const newProjectData = {
      id: projects.length + 1,
      name: newProject.name,
      description: newProject.description,
      progress: 0,
      dueDate: new Date(newProject.dueDate)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .replace(/\//g, "/"),
      tags: ["New", "Project"],
      taskCount: 0,
      image: "/placeholder.svg?key=8igeg",
      members: [
        { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
      ],
    }
    setProjects([...projects, newProjectData])
    setIsNewProjectOpen(false)
    setNewProject({ name: "", description: "", dueDate: "" })
  }

  const handleManageTeam = (e: React.MouseEvent, project: (typeof initialProjects)[0]) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProject(project)
    setTeamModalOpen(true)
  }

  const handleMembersUpdate = (updatedMembers: (typeof initialProjects)[0]["members"]) => {
    if (selectedProject) {
      setProjects(projects.map((p) => (p.id === selectedProject.id ? { ...p, members: updatedMembers } : p)))
      setSelectedProject({ ...selectedProject, members: updatedMembers })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-auto md:ml-0 ml-0">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:pt-6 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your team projects</p>
            </div>
            <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="self-start sm:self-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Add a new project to your workspace. Fill in the details below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Enter project description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newProject.dueDate}
                      onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateProject} disabled={!newProject.name.trim()}>
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -2 }}
                className="group"
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-border/50 hover:border-primary/20 bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-1 flex-wrap">
                          {(project.tags || []).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-2 py-1 text-xs font-medium rounded-md ${
                                tagIndex === 0
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleManageTeam(e, project)}
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </div>
                      <CardTitle className="text-base font-semibold leading-tight">{project.name}</CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0 pb-4">
                      <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.name}
                          className="w-full h-24 object-cover"
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {project.dueDate}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-muted-foreground">
                            <span className="text-xs">{project.taskCount || 0} tasks</span>
                          </div>
                          <div className="flex -space-x-1">
                            {project.members.slice(0, 3).map((member, memberIndex) => (
                              <img
                                key={member.id}
                                src={member.avatar || "/placeholder.svg"}
                                alt={member.name}
                                className="w-6 h-6 rounded-full border-2 border-background object-cover"
                                style={{ zIndex: 10 - memberIndex }}
                              />
                            ))}
                            {project.members.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                  +{project.members.length - 3}
                                </span>
                              </div>
                            )}
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

      {selectedProject && (
        <TeamManagementModal
          isOpen={teamModalOpen}
          onClose={() => setTeamModalOpen(false)}
          projectId={selectedProject.id.toString()}
          projectName={selectedProject.name}
          members={selectedProject.members}
          isOwner={true}
          onMembersUpdate={handleMembersUpdate}
        />
      )}
    </div>
  )
}
