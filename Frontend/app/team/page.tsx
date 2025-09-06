"use client"

import { motion } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, MessageSquare, MoreHorizontal } from "lucide-react"

const teamMembers = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Project Manager",
    email: "alice@synergysphere.com",
    avatar: "/placeholder.svg?height=64&width=64",
    status: "online",
    projects: ["Website Redesign", "Mobile App"],
    joinDate: "Jan 2023",
  },
  {
    id: 2,
    name: "Bob Smith",
    role: "UI/UX Designer",
    email: "bob@synergysphere.com",
    avatar: "/placeholder.svg?height=64&width=64",
    status: "online",
    projects: ["Website Redesign", "Marketing Campaign"],
    joinDate: "Mar 2023",
  },
  {
    id: 3,
    name: "Carol Davis",
    role: "Frontend Developer",
    email: "carol@synergysphere.com",
    avatar: "/placeholder.svg?height=64&width=64",
    status: "away",
    projects: ["Website Redesign", "Mobile App"],
    joinDate: "Feb 2023",
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Backend Developer",
    email: "david@synergysphere.com",
    avatar: "/placeholder.svg?height=64&width=64",
    status: "offline",
    projects: ["Mobile App", "Database Migration"],
    joinDate: "Apr 2023",
  },
  {
    id: 5,
    name: "Eva Brown",
    role: "QA Engineer",
    email: "eva@synergysphere.com",
    avatar: "/placeholder.svg?height=64&width=64",
    status: "online",
    projects: ["Website Redesign", "Marketing Campaign"],
    joinDate: "May 2023",
  },
  {
    id: 6,
    name: "Frank Miller",
    role: "DevOps Engineer",
    email: "frank@synergysphere.com",
    avatar: "/placeholder.svg?height=64&width=64",
    status: "away",
    projects: ["Database Migration"],
    joinDate: "Jun 2023",
  },
]

export default function TeamPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

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
              <h1 className="text-3xl font-bold text-foreground mb-2">Team Members</h1>
              <p className="text-muted-foreground">Manage your team and collaborate effectively.</p>
            </div>
            <Button className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search team members..." className="pl-10" />
            </div>
          </motion.div>

          {/* Team Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="relative mx-auto mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                      />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Projects:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.projects.slice(0, 2).map((project) => (
                          <Badge key={project} variant="secondary" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                        {member.projects.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.projects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">Joined {member.joinDate}</div>

                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
