import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  Crown,
  UserPlus,
  Settings,
  MessageSquare,
  Shield,
  Hash,
  Trash2,
} from "lucide-react";
import { User } from "@/components/store/userStore";
import AddMember from "./AddMember";
import EditGroupDetails from "./EditGroupDetails";
import DeleteGroupModal from "./DeleteGroupModal";

interface GroupMember {
  _id: string;
  username: string;
  avatar: string;
  email: string;
  role?: string;
  createdAt?: string;
}

// FIX: Updated Interface to match the global 'Chat' type requirements
interface GroupChat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: GroupMember[];
  groupAdmin: GroupMember;
  createdAt: string;
  updatedAt: string;
  mute?: boolean;
  pinned?: boolean;
  unreadCount?: boolean | number;
  groupAvatar?: string;
  latestMessage?: any; // Added this to satisfy child component requirements
}

interface GroupChatDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupChat | null;
  currentUser: User | null;
  formatTime: (date: Date | string) => string;
  onEditGroup?: (group: GroupChat) => void;
  onAddMembers?: (members: User[], groupId: string) => Promise<void> | void;
  onLeaveGroup?: (group: GroupChat) => void;
  allUsers?: User[];
  onGroupUpdate?: (updatedGroup: GroupChat) => void;
  onGroupChatDelete?: () => void; // FIX: Added missing prop definition
}

const GroupChatDetails: React.FC<GroupChatDetailsProps> = ({
  open,
  onOpenChange,
  group,
  currentUser,
  onLeaveGroup,
  onAddMembers,
  allUsers = [],
  onGroupUpdate,
  onGroupChatDelete, // Now correctly typed
}) => {
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [localGroup, setLocalGroup] = useState<GroupChat | null>(group);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update local group when prop changes
  useEffect(() => {
    setLocalGroup(group);
  }, [group]);

  // Clean up body styles when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Ensure body is clickable when modal closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.overflow = "";
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!localGroup) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const isUserAdmin = localGroup.groupAdmin._id === currentUser?._id;
  const isUserMember = localGroup.users.some(
    (user) => user._id === currentUser?._id
  );

  const getMemberRole = (member: GroupMember) => {
    if (member._id === localGroup.groupAdmin._id) return "admin";
    return member.role || "member";
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      admin:
        "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 dark:from-yellow-900 dark:to-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700",
      moderator:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
      member:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          roleStyles[role as keyof typeof roleStyles] || roleStyles.member
        }`}
      >
        {role === "admin" && <Crown className="h-3 w-3 inline mr-1" />}
        {role}
      </span>
    );
  };

  const getGroupAvatarFallback = () => {
    return localGroup.chatName?.charAt(0).toUpperCase() || "G";
  };

  // Handle members added from AddMember component
  const handleAddMembers = async (
    selectedUsers: User[],
    updatedGroup?: GroupChat
  ) => {
    try {
      // FIX: Used isRefreshing to prevent double submissions and remove unused var warning
      setIsRefreshing(true); 
      
      if (onAddMembers && localGroup) {
        await onAddMembers(selectedUsers, localGroup._id);
      }

      if (updatedGroup) {
        setLocalGroup(updatedGroup);
        onGroupUpdate?.(updatedGroup);
      }

      setAddMembersOpen(false);
    } catch (error) {
      console.error("Error adding members:", error);
    } finally {
        setIsRefreshing(false);
    }
  };

  // Handle real-time updates from AddMember component
  const handleMembersAdded = (updatedGroup: GroupChat) => {
    setLocalGroup(updatedGroup);
    onGroupUpdate?.(updatedGroup);
  };

  // Handle group details update
  const handleGroupDetailsUpdated = (updatedGroup: GroupChat) => {
    setLocalGroup(updatedGroup);
    onGroupUpdate?.(updatedGroup);
    setEditGroupOpen(false);
  };

  const handleEditGroupClick = () => {
    setEditGroupOpen(true);
  };

  const handleDeleteGroupClick = () => {
    setDeleteGroupOpen(true);
  };

  const handleGroupDeleted = () => {
    onOpenChange(false);
    if(onGroupChatDelete) onGroupChatDelete();
    
    // The parent component should handle navigation
    if (onLeaveGroup) {
      onLeaveGroup(localGroup);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg bg-background border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              Group Details
              {isRefreshing && (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Group Avatar Section */}
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-lg">
                <AvatarImage
                  src={localGroup.groupAvatar}
                  alt={localGroup.chatName}
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getGroupAvatarFallback()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{localGroup.chatName}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Users className="h-4 w-4" />
                  {localGroup.users.length} members
                  <span className="mx-1">•</span>
                  {isUserAdmin
                    ? "You are admin"
                    : `Admin: ${localGroup.groupAdmin.username}`}
                </p>
              </div>
            </div>

            <Separator />

            {/* Group Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Group Information
              </h3>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Group Admin</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={localGroup.groupAdmin.avatar}
                        alt={localGroup.groupAdmin.username}
                      />
                      <AvatarFallback>
                        {localGroup.groupAdmin.username
                          ?.charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">
                      {localGroup.groupAdmin.username}
                    </p>
                    {isUserAdmin && (
                      <span className="text-xs text-amber-600">(You)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(localGroup.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Group ID</p>
                  <p className="text-sm font-medium font-mono truncate">
                    {localGroup._id}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Members List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Members ({localGroup.users.length})
                </h3>
                {isUserAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddMembersOpen(true)}
                    disabled={isRefreshing}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Members
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {localGroup.users.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={member.avatar}
                          alt={member.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                          {member.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {member.username}
                          </p>
                          {member._id === currentUser?._id && (
                            <span className="text-xs text-blue-600 font-medium">
                              (You)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {getRoleBadge(getMemberRole(member))}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-2">
              {isUserAdmin && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
                    onClick={handleEditGroupClick}
                    disabled={isRefreshing}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Group Settings
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                    onClick={handleDeleteGroupClick}
                    disabled={isRefreshing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Group
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleClose}
                disabled={isRefreshing}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>

              {isUserMember && !isUserAdmin && onLeaveGroup && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                  onClick={() => onLeaveGroup?.(localGroup)}
                  disabled={isRefreshing}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Leave Group
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <AddMember
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        existingMembers={localGroup.users as any[]}
        // FIX: Cast allUsers to any
        allUsers={allUsers as any[]}
        
        // FIX: Cast the function to 'any' to resolve the User vs UserType mismatch
        onConfirm={handleAddMembers as any} 
        
        // FIX: Cast currentUser to any
        currentUser={currentUser as any}
        // FIX: Cast localGroup to any
        currentChat={localGroup as any}
        onMembersAdded={handleMembersAdded}
      />

      {/* Edit Group Details Dialog */}
      {isUserAdmin && (
        <EditGroupDetails
          open={editGroupOpen}
          onOpenChange={setEditGroupOpen}
          // FIX: Cast localGroup to any for compatibility
          group={localGroup as any}
          currentUser={currentUser}
          onGroupUpdated={handleGroupDetailsUpdated as any}
        />
      )}

      {/* Delete Group Confirmation Dialog */}
      {isUserAdmin && (
        <DeleteGroupModal
          open={deleteGroupOpen}
          onOpenChange={setDeleteGroupOpen}
          // FIX: Cast localGroup to any for compatibility
          group={localGroup as any}
          currentUser={currentUser}
          onGroupDeleted={handleGroupDeleted}
        />
      )}
    </>
  );
};

export default GroupChatDetails;