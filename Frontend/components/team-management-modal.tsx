"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, X, Mail } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  projectRole: string
  avatar?: string
}

interface TeamManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: string) => void
  onRemove: (memberId: number) => void
  members: TeamMember[]
  isOwner: boolean
  projectName: string
}

const projectRoles = ["Project Manager", "Designer", "Developer", "QA Tester", "Business Analyst", "DevOps Engineer"]

export function TeamManagementModal({
  isOpen,
  onClose,
  onInvite,
  onRemove,
  members,
  isOwner,
  projectName,
}: TeamManagementModalProps) {
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState("Developer")
  const [isInviting, setIsInviting] = useState(false)

  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newMemberEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Check if member already exists
    if (members.some((member) => member.email === newMemberEmail)) {
      toast({
        title: "Member already exists",
        description: "This user is already a member of the project.",
        variant: "destructive",
      })
      return
    }

    setIsInviting(true)

    // Simulate API call delay
    setTimeout(() => {
      onInvite(newMemberEmail, selectedRole)
      setNewMemberEmail("")
      setSelectedRole("Developer")
      setIsInviting(false)
    }, 500)
  }

  const handleRemoveMember = (memberId: number) => {
    const memberToRemove = members.find((m) => m.id === memberId)
    if (!memberToRemove) return

    // Prevent removing project owner
    if (memberToRemove.role === "admin" && memberToRemove.projectRole === "Project Manager") {
      toast({
        title: "Cannot remove owner",
        description: "Project owners cannot be removed from their own projects.",
        variant: "destructive",
      })
      return
    }

    onRemove(memberId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Team - {projectName}</DialogTitle>
          <DialogDescription>Add or remove team members from this project.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new member */}
          {isOwner && (
            <div className="space-y-3">
              <Label htmlFor="email">Invite Team Member</Label>
              <div className="space-y-3">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleInviteMember()}
                />
                <div className="space-y-2">
                  <Label htmlFor="role">Project Role</Label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {projectRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleInviteMember} disabled={isInviting || !newMemberEmail.trim()} className="w-full">
                  {isInviting ? (
                    "Inviting..."
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite as {selectedRole}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Current members */}
          <div className="space-y-3">
            <Label>Current Members ({members.length})</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {member.role === "admin" ? "Owner" : "Member"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {member.projectRole}
                      </Badge>
                    </div>
                    {isOwner && member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
