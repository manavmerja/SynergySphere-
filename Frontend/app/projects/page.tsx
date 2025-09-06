"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Calendar, Users, Search, Filter, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRequireAuth } from "@/app/utils/auth"
import axios from "axios"

// const initialProjects = [
//   {
//     id: 1,
//     name: "RD Services",
//     description: "Complete overhaul of company website",
//     progress: 75,
//     dueDate: "21/03/22",
//     tags: ["Services", "Customer Care"],
//     taskCount: 10,
//     image: "/placeholder.svg?key=8igeg",
//     members: [
//       { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
//       { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Member", avatar: "/letter-j-typography.png" },
//       {
//         id: "3",
//         name: "Mike Johnson",
//         email: "mike@example.com",
//         role: "Member",
//         avatar: "/letter-m-typography.png",
//       },
//       {
//         id: "4",
//         name: "Sarah Wilson",
//         email: "sarah@example.com",
//         role: "Member",
//         avatar: "/abstract-letter-s.png",
//       },
//       { id: "5", name: "Tom Brown", email: "tom@example.com", role: "Member", avatar: "/letter-t-typography.png" },
//     ],
//     status: "active",
//     priority: "high",
//   },
//   {
//     id: 2,
//     name: "RD Sales",
//     description: "iOS and Android app for customer portal",
//     progress: 45,
//     dueDate: "21/03/22",
//     tags: ["Sales", "Customer Care"],
//     taskCount: 8,
//     image: "/placeholder.svg?key=ukh2j",
//     members: [
//       { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
//       { id: "6", name: "Alex Davis", email: "alex@example.com", role: "Member", avatar: "/letter-a-abstract.png" },
//       { id: "7", name: "Lisa Garcia", email: "lisa@example.com", role: "Member", avatar: "/letter-L-nature.png" },
//     ],
//     status: "active",
//     priority: "medium",
//   },
//   {
//     id: 3,
//     name: "RD Upgrade",
//     description: "Q1 digital marketing strategy implementation",
//     progress: 90,
//     dueDate: "21/03/22",
//     tags: ["Upgrade", "Migration"],
//     taskCount: 5,
//     image: "/placeholder.svg?key=uveqo",
//     members: [
//       { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
//       { id: "8", name: "Emma Taylor", email: "emma@example.com", role: "Member", avatar: "/letter-e-abstract.png" },
//       { id: "9", name: "Chris Lee", email: "chris@example.com", role: "Member", avatar: "/letter-c-typography.png" },
//     ],
//     status: "review",
//     priority: "high",
//   },
//   {
//     id: 4,
//     name: "Database Migration",
//     description: "Migrate legacy systems to cloud infrastructure",
//     progress: 20,
//     dueDate: "21/03/22",
//     tags: ["Database", "Migration"],
//     taskCount: 3,
//     image: "/placeholder.svg?key=db123",
//     members: [
//       { id: "1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "/letter-j-typography.png" },
//       { id: "10", name: "David Kim", email: "david@example.com", role: "Member", avatar: "/letter-d-floral.png" },
//     ],
//     status: "planning",
//     priority: "low",
//   },
// ]

export default function ProjectsPage() {
  useRequireAuth()
  const [projects, setProjects] = useState([])
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    dueDate: "",
  })

  const getStatusColor = (status) => {
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

  const getPriorityColor = (priority) => {
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

 const handleCreateProject = async () => {
  try {
    const token = localStorage.getItem("token"); // get JWT stored after login
    const res = await axios.post(
      "http://localhost:5000/api/project/createProject",
      {
        name: newProject.name,
        description: newProject.description,
        dueDate: newProject.dueDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // pass token for auth
        },
      }
    );

    // Project created successfully
    setProjects([...projects, res.data]);
    setIsNewProjectOpen(false);
    setNewProject({ name: "", description: "", dueDate: "" });
  } catch (err) {
    console.error("Project creation failed:", err);
  }
};


  const handleManageTeam = (e, project) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProject(project)
    setTeamModalOpen(true)
  }

  const handleMembersUpdate = (updatedMembers) => {
    if (selectedProject) {
      setProjects(projects.map((p) => (p.id === selectedProject.id ? { ...p, members: updatedMembers } : p)))
      setSelectedProject({ ...selectedProject, members: updatedMembers })
    }
  }
  useEffect(()=>{
    const token = localStorage.getItem('token');
    const fetchdata = async () =>{
      const res = await axios.get("http://localhost:5000/api/project/getProject",{
        headers: {
          Authorization: `Bearer ${token}`, // pass token for auth
        },
      })
      console.log(res.data);
      setProjects(res.data);
      
    }
    fetchdata();
  },[]);
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
            <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0">
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
    key={project._id} // <-- use _id
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 * index }}
    whileHover={{ y: -2 }}
    className="group"
  >
    <Link href={`/projects/${project._id}`}> {/* <-- use _id */}
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
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleManageTeam(e, project)}
              >
                <UserPlus className="h-3 w-3" />
              </Button>
              <Badge className={getStatusColor(project.status || "planning")}>
                {project.status || "planning"}
              </Badge>
              <Badge className={getPriorityColor(project.priority || "medium")}>
                {project.priority || "medium"}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-base font-semibold leading-tight">{project.name}</CardTitle>
          <CardDescription className="text-sm mt-1">{project.description}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-4">
          <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <img
              src={project.image || "/placeholder.svg"}
              alt={project.name}
              className="w-full h-24 object-cover"
            />
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress ?? 0}%</span>
            </div>
            <Progress value={project.progress ?? 0} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {project.dueDate}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-muted-foreground">
                <span className="text-xs">{project.taskCount ?? 0} tasks</span>
              </div>
              <div className="flex -space-x-1">
                {(project.members || []).slice(0, 3).map((member) => (
                  <Avatar key={member._id || member.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {(project.members || []).length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{(project.members?.length ?? 0) - 3}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Team Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Managing team for: {selectedProject.name}
            </p>
            <div className="space-y-2">
              {selectedProject.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded border">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setTeamModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}