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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";

interface DeleteGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Chat;
  currentUser: User | null;
  onGroupDeleted: () => void;
}

const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  open,
  onOpenChange,
  group,
  currentUser,
  onGroupDeleted,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isDeleteEnabled =
    confirmText.toLowerCase() === group.chatName.toLowerCase();

  const handleDelete = async () => {
    if (!isDeleteEnabled) {
      toast.error("Please type the group name correctly to confirm");
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.delete(
        `${import.meta.env.VITE_URL}/chats/delete-chat/${group._id}`,
        config
      );
     
      if (response.data.success) {
        toast.success("Group deleted successfully!");
        onGroupDeleted();
        onOpenChange(false);
        setConfirmText("");
        console.log(response.data);
      }
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onOpenChange(false);
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
                Delete Group?
              </AlertDialogTitle>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <AlertDialogDescription className="text-left space-y-4 pt-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                What will be deleted:
              </h4>
              <ul className="space-y-2 text-sm text-red-800 dark:text-red-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>All messages and their attachments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Group avatar and media files</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Chat history for all {group.users?.length || 0} members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>The group itself - permanently</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  All members will lose access to this group and its entire message history.
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Type <span className="font-bold text-red-600">"{group.chatName}"</span> to confirm:
              </label>
              <Input
                placeholder={`Type "${group.chatName}" here`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="border-red-300 focus-visible:ring-red-500"
                disabled={loading}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                This confirmation is case-insensitive
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={loading}
            className="mt-0"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isDeleteEnabled || loading}
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
                Delete Group
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGroupModal;