"use client"

import { use, useState } from "react"   // <-- add `use` here
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamManagementModal } from "@/components/team-management-modal"
import { TaskCreationModal } from "@/components/task-creation-modal"
import { ProjectSettingsModal } from "@/components/project-settings-modal"
import {useRequireAuth} from "@/app/utils/auth"
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  MoreHorizontal,
  UserPlus,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// Mock current user - in real app this would come from auth context
const currentUser = {
  id: 1,
  name: "Alice Johnson",
  email: "alice@example.com",
  role: "admin",
  projectRole: "Project Manager",
}

// Mock data - in real app this would come from API
const projectData = {
  id: 1,
  name: "Website Redesign",
  description: "Complete overhaul of company website with modern design and improved user experience",
  progress: 75,
  status: "active",
  dueDate: "2024-02-15",
  createdDate: "2024-01-01",
  owner: 1, // Alice is the owner
  members: [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "admin",
      projectRole: "Project Manager",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      role: "member",
      projectRole: "Designer",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol@example.com",
      role: "member",
      projectRole: "Developer",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david@example.com",
      role: "member",
      projectRole: "Developer",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 5,
      name: "Eva Brown",
      email: "eva@example.com",
      role: "member",
      projectRole: "QA Tester",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ],
  tasks: [
    {
      id: 1,
      title: "Design mockups",
      status: "completed",
      assignee: "Bob Smith",
      assigneeId: 2,
      dueDate: "2024-01-15",
      priority: "high",
    },
    {
      id: 2,
      title: "Frontend development",
      status: "in-progress",
      assignee: "Carol Davis",
      assigneeId: 3,
      dueDate: "2024-02-01",
      priority: "high",
    },
    {
      id: 3,
      title: "Backend integration",
      status: "in-progress",
      assignee: "David Wilson",
      assigneeId: 4,
      dueDate: "2024-02-05",
      priority: "medium",
    },
    {
      id: 4,
      title: "Testing & QA",
      status: "pending",
      assignee: "Eva Brown",
      assigneeId: 5,
      dueDate: "2024-02-10",
      priority: "medium",
    },
    {
      id: 5,
      title: "Deployment",
      status: "pending",
      assignee: "Alice Johnson",
      assigneeId: 1,
      dueDate: "2024-02-15",
      priority: "low",
    },
  ],
  discussions: [
    {
      id: 1,
      author: "Alice Johnson",
      authorId: 1,
      message: "Great progress on the frontend! The new design looks amazing.",
      timestamp: "2 hours ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      author: "Bob Smith",
      authorId: 2,
      message: "Thanks! I've updated the color scheme based on the feedback.",
      timestamp: "1 hour ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      author: "Carol Davis",
      authorId: 3,
      message: "The responsive design is working well on mobile devices.",
      timestamp: "30 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ],
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // ✅ unwraps the params safely
  useRequireAuth();
  const [activeTab, setActiveTab] = useState("tasks");
  const [project, setProject] = useState(projectData);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { toast } = useToast();

  // Permission checking functions
  const isProjectOwner = currentUser.id === project.owner
  const isProjectAdmin = currentUser.role === "admin" || isProjectOwner
  const canManageTeam = isProjectOwner || currentUser.role === "admin"
  const canEditTasks = isProjectAdmin || project.members.some((m) => m.id === currentUser.id)

  const handleInviteMember = (email: string, role: string) => {
    const newMember = {
      id: Date.now(),
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      email,
      role: "member",
      projectRole: role,
      avatar: `/placeholder.svg?height=32&width=32`,
    }

    setProject((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }))

    toast({
      title: "Member invited successfully",
      description: `${email} has been invited to the project as ${role}`,
    })
  }

  const handleRemoveMember = (memberId: number) => {
    if (!canManageTeam) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to remove team members",
        variant: "destructive",
      })
      return
    }

    setProject((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }))

    toast({
      title: "Member removed",
      description: "Team member has been removed from the project",
    })
  }

  const handleCreateTask = (newTask: any) => {
    setProject((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }))

    toast({
      title: "Task created successfully",
      description: `"${newTask.title}" has been added to the project`,
    })
  }

  const handleUpdateProject = (updatedProject: any) => {
    setProject(updatedProject)
    toast({
      title: "Project updated successfully",
      description: "Your project settings have been saved",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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
            className="mb-8"
          >
            <div className="flex items-center mb-4">
              <Link href="/projects">
                <Button variant="ghost" size="icon" className="mr-4">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex gap-2">
                {canEditTasks && (
                  <Button onClick={() => setIsTaskModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                )}
                {canManageTeam && (
                  <Button variant="outline" onClick={() => setIsTeamModalOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                )}
                {isProjectOwner && (
                  <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                )}
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">{project.progress}%</p>
                    </div>
                    <div className="relative h-16 w-16">
                      <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-muted stroke-current"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <motion.path
                          className="text-primary stroke-current"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: project.progress / 100 }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                      <p className="text-2xl font-bold">{project.members.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                      <p className="text-2xl font-bold">{project.tasks.length}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                      <p className="text-lg font-semibold">{project.dueDate}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Tabbed Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
  {/* Tasks Tab */}
  <TabsContent key="tasks" value="tasks" className="space-y-4">
    <motion.div
      key="tasks-motion"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {project.tasks.map((task, index) => (
        <motion.div
          key={task.id ?? `task-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Assigned to {task.assignee}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {task.dueDate}
                  </span>
                  {canEditTasks && (
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </TabsContent>

  {/* Kanban Tab */}
  <TabsContent key="kanban" value="kanban" className="space-y-4">
    <motion.div
      key="kanban-motion"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Kanban Board</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop tasks to manage workflow
        </p>
        <Link href={`/projects/${id}/kanban`}>
          <Button>Open Kanban Board</Button>
        </Link>
      </div>
    </motion.div>
  </TabsContent>

  {/* Discussions Tab */}
  <TabsContent key="discussions" value="discussions" className="space-y-4">
    <motion.div
      key="discussions-motion"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {project.discussions.map((discussion, index) => (
        <motion.div
          key={discussion.id ?? `discussion-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage
                    src={discussion.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {discussion.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{discussion.author}</h4>
                    <span className="text-sm text-muted-foreground">
                      {discussion.timestamp}
                    </span>
                  </div>
                  <p className="text-sm">{discussion.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </TabsContent>

  {/* Members Tab */}
  <TabsContent key="members" value="members" className="space-y-4">
    <motion.div
      key="members-motion"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">
          Team Members ({project.members.length})
        </h3>
        {canManageTeam && (
          <Button onClick={() => setIsTeamModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.members.map((member, index) => (
          <motion.div
            key={member.id ?? `member-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarImage
                    src={member.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-lg">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {member.projectRole}
                </p>
                <div className="flex justify-center gap-2">
                  <Badge
                    variant={
                      member.id === project.owner ? "default" : "secondary"
                    }
                  >
                    {member.id === project.owner ? "Owner" : "Member"}
                  </Badge>
                  {canManageTeam &&
                    member.id !== project.owner &&
                    member.id !== currentUser.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </TabsContent>
</AnimatePresence>

            </Tabs>
          </motion.div>
        </div>

        <TaskCreationModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onCreateTask={handleCreateTask}
          projectMembers={project.members}
          projectName={project.name}
        />

        {/* Project-specific team management modal */}
        <TeamManagementModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          onInvite={handleInviteMember}
          onRemove={handleRemoveMember}
          members={project.members}
          isOwner={isProjectOwner}
          projectName={project.name}
        />

        {/* Project settings modal */}
        <ProjectSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onUpdateProject={handleUpdateProject}
          project={project}
          isOwner={isProjectOwner}
        />
      </main>
    </div>
  )
}
