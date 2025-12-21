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
  Mail,
  Calendar,
  UserCircle,
  MessageSquare,
  Ban,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { User } from "@/components/store/userStore";
import userPost from "@/components/store/userStore";
import useChatStore from "@/components/store/chatStore";
import { blockUser, unblockUser, checkIfUserBlocked } from "@/lib/blockUserApi";
import { toast } from "sonner";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  formatTime: (date: Date | string) => string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onOpenChange,
  user,
  formatTime,
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const currentUser = userPost((state) => state.currentUser);
  const addBlockedUser = userPost((state) => state.addBlockedUser);
  const removeBlockedUser = userPost((state) => state.removeBlockedUser);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const chats = useChatStore((state) => state.chats);

  // Check if user is blocked when modal opens
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (open && user && currentUser?.token) {
        setIsCheckingStatus(true);
        try {
          const response = await checkIfUserBlocked(
            user._id.toString(),
            currentUser.token
          );
          setIsBlocked(response.data.isBlocked || false);
        } catch (error) {
          console.error("Error checking block status:", error);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    };

    checkBlockStatus();
  }, [open, user, currentUser?.token]);

  // Clean up body styles when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Ensure body is clickable when modal closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!user) return null;

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

  const handleBlockUnblock = async () => {
    if (!currentUser?.token || !user) return;

    setIsLoading(true);
    try {
      if (isBlocked) {
        // Unblock user
        const response = await unblockUser(user._id.toString(), currentUser.token);
        removeBlockedUser(user._id.toString());
        setIsBlocked(false);
        toast.success(response.message || "User unblocked successfully");
      } else {
        // Block user
        const response = await blockUser(user._id.toString(), currentUser.token);
        addBlockedUser(user);
        setIsBlocked(true);
        
        // Delete the chat with this user if it exists
        const chatToDelete = chats.find(
          (chat) =>
            !chat.isGroupChat &&
            chat.users?.some((u) => u._id.toString() === user._id.toString())
        );
        
        if (chatToDelete) {
          deleteChat(chatToDelete._id);
        }
        
        toast.success(response.message || "User blocked successfully");
        
        // Close modal after blocking
        handleClose();
      }
    } catch (error: any) {
      console.error("Error blocking/unblocking user:", error);
      toast.error(
        error.response?.data?.message || 
        `Failed to ${isBlocked ? "unblock" : "block"} user`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-center">Profile Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24 border-4 border-primary/10">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-2xl">
                {user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                {user.status === "online" ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Online
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                    Last seen {formatTime(user.lastSeen || new Date())}
                  </>
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Information
            </h3>

            {user.email && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
            )}

            {user.bio && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Bio</p>
                  <p className="text-sm font-medium">{user.bio}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">
                  {formatDate(user.createdAt || new Date())}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isBlocked && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleClose}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            )}

            <Button
              variant="outline"
              className={`w-full justify-start ${
                isBlocked
                  ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
              }`}
              onClick={handleBlockUnblock}
              disabled={isLoading || isCheckingStatus}
            >
              {isLoading || isCheckingStatus ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isBlocked ? (
                <ShieldCheck className="h-4 w-4 mr-2" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              {isCheckingStatus 
                ? "Checking..." 
                : isLoading 
                ? (isBlocked ? "Unblocking..." : "Blocking...") 
                : isBlocked 
                ? "Unblock User" 
                : "Block User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;