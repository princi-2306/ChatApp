// TS DONE

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";

interface DeleteChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Chat;
  otherUser: User | null;
  currentUser: User | null;
  onChatDeleted: () => void;
}

const DeleteChatModal: React.FC<DeleteChatModalProps> = ({
  open,
  onOpenChange,
  chat,
  otherUser,
  currentUser,
  onChatDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.delete(
        `${import.meta.env.VITE_URL}/chats/delete-chat/${chat._id}`,
        config
      );

      if (response.data.success) {
        toast.success("Chat deleted successfully!");
        onChatDeleted();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error deleting chat:", error);
      
      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this chat");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete chat. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Delete Chat?
              </AlertDialogTitle>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-left space-y-4 pt-2">
          {/* Show other user info */}
          {otherUser && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser.avatar} alt={otherUser.username} />
                <AvatarFallback>
                  {otherUser.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{otherUser.username}</p>
                <p className="text-sm text-muted-foreground">
                  {otherUser.email}
                </p>
              </div>
            </div>
          )}

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              What will be deleted:
            </h4>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-400">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>All messages in this conversation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>All shared files and attachments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Entire chat history permanently</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                This will permanently delete the chat for you only. The other person will still have access to their copy.
              </span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this chat? This action cannot be undone.
          </p>
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={loading} className="mt-0">
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteChatModal;