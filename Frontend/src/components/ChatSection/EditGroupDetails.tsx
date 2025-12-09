import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Trash2, Image as ImageIcon, Edit3 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";

interface EditGroupDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Chat;
  currentUser: User | null;
  onGroupUpdated: (updatedGroup: Chat) => void;
}

const EditGroupDetails: React.FC<EditGroupDetailsProps> = ({
  open,
  onOpenChange,
  group,
  currentUser,
  onGroupUpdated,
}) => {
  const [groupName, setGroupName] = useState(group.chatName);
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    group.groupAvatar || ""
  );
  const [loading, setLoading] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when group changes
  useEffect(() => {
    setGroupName(group.chatName);
    setAvatarPreview(group.groupAvatar || "");
    setGroupAvatar(null);
  }, [group]);

  // Handle avatar file selection
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setGroupAvatar(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // Remove selected avatar (for new selection, not existing)
  const removeAvatarSelection = () => {
    setGroupAvatar(null);
    setAvatarPreview(group.groupAvatar || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove existing avatar from server
  const handleRemoveExistingAvatar = async () => {
    if (!group.groupAvatar) {
      toast.error("Group has no avatar to remove");
      return;
    }

    try {
      setRemovingAvatar(true);

      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.put(
        "http://localhost:8000/api/v1/chats/remove-group-avatar",
        { chatId: group._id },
        config
      );

      if (response.data.success) {
        toast.success("Group avatar removed successfully!");
        onGroupUpdated(response.data.data);
        setAvatarPreview("");
        setGroupAvatar(null);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to remove avatar. Please try again."
      );
    } finally {
      setRemovingAvatar(false);
    }
  };

  // Update group details
  const handleUpdateGroup = async () => {
    // Validate group name
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    // Check if anything changed
    if (groupName === group.chatName && !groupAvatar) {
      toast.info("No changes to update");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("chatId", group._id);

      // Add group name if changed
      if (groupName !== group.chatName) {
        formData.append("chatName", groupName.trim());
      }

      // Add avatar file if selected
      if (groupAvatar) {
        formData.append("groupAvatar", groupAvatar);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.put(
        "http://localhost:8000/api/v1/chats/update-group-details",
        formData,
        config
      );

      if (response.data.success) {
        toast.success("Group details updated successfully!");
        onGroupUpdated(response.data.data);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update group. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const getGroupAvatarFallback = () => {
    return groupName?.charAt(0).toUpperCase() || "G";
  };

  const hasChanges = groupName !== group.chatName || groupAvatar !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Group Details
          </DialogTitle>
          <DialogDescription>
            Update your group's name and avatar. Changes will be visible to all
            members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Group Avatar Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Group Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-dashed border-muted-foreground/25">
                  {avatarPreview ? (
                    <AvatarImage
                      src={avatarPreview}
                      alt="Group avatar preview"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                      {getGroupAvatarFallback()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {groupAvatar && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeAvatarSelection}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || removingAvatar}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {avatarPreview && !groupAvatar
                    ? "Change Avatar"
                    : "Upload New Avatar"}
                </Button>

                {group.groupAvatar && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveExistingAvatar}
                    disabled={loading || removingAvatar}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {removingAvatar ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        Removing...
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Current Avatar
                      </>
                    )}
                  </Button>
                )}

                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Group Name Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Group Name *
            </label>
            <Input
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full"
              maxLength={50}
              disabled={loading || removingAvatar}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {groupName.length}/50 characters
            </p>
          </div>

          {/* Info Box */}
          {hasChanges && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 Changes will be visible to all group members immediately
                after saving.
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading || removingAvatar}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateGroup}
            disabled={
              loading ||
              removingAvatar ||
              !groupName.trim() ||
              groupName.length > 50 ||
              !hasChanges
            }
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDetails;