// TS DONE

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Loader2, Ban } from "lucide-react";
import { User } from "@/components/store/userStore";
import userPost from "@/components/store/userStore";
import { getBlockedUsers, unblockUser } from "@/lib/blockUserApi";
import { toast } from "sonner";

interface BlockedUsersListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BlockedUsersList: React.FC<BlockedUsersListProps> = ({
  open,
  onOpenChange,
}) => {
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null);

  const currentUser = userPost((state) => state.currentUser);
  const removeBlockedUser = userPost((state) => state.removeBlockedUser);
  const setBlockedUsersInStore = userPost((state) => state.setBlockedUsers);

  useEffect(() => {
    if (open && currentUser?.token) {
      fetchBlockedUsers();
    }
  }, [open, currentUser?.token]);

  const fetchBlockedUsers = async () => {
    if (!currentUser?.token) return;

    setIsLoading(true);
    try {
      const response = await getBlockedUsers(currentUser.token);
      setBlockedUsers(response.data.blockedUsers || []);
      setBlockedUsersInStore(response.data.blockedUsers || []);
    } catch (error: any) {
      console.error("Error fetching blocked users:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch blocked users"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!currentUser?.token) return;

    setUnblockingUserId(userId);
    try {
      const response = await unblockUser(userId, currentUser.token);
      
      // Remove from local state
      setBlockedUsers((prev) => prev.filter((u) => u._id.toString() !== userId));
      
      // Update store
      removeBlockedUser(userId);
      
      toast.success(response.message || "User unblocked successfully");
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      toast.error(
        error.response?.data?.message || "Failed to unblock user"
      );
    } finally {
      setUnblockingUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Ban className="h-5 w-5 text-orange-600" />
            Blocked Users
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Ban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No blocked users</p>
              <p className="text-sm text-muted-foreground mt-1">
                Users you block will appear here
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {blockedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(user._id.toString())}
                      disabled={unblockingUserId === user._id.toString()}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      {unblockingUserId === user._id.toString() ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Unblock
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="text-center text-xs text-muted-foreground">
            {blockedUsers.length > 0 && (
              <p>{blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockedUsersList;