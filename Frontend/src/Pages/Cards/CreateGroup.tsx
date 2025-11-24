import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  UserPlus,
  Users,
  Upload,
  Image,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import userPost, { User } from "@/components/store/userStore";
import axios from "axios";
import { toast } from "sonner";
import useChatStore from "@/components/store/chatStore";

interface CreateGroupProps {
  onClose: () => void;
}

interface SelectedUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = userPost((state) => state.currentUser);
  const setChats = useChatStore((state) => state.setChats);
  const chats = useChatStore((state) => state.chats);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);

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

  // Remove selected avatar
  const removeAvatar = () => {
    setGroupAvatar(null);
    setAvatarPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tokens")}`,
        },
      };

      const response = await axios.get(
        `http://localhost:8000/api/v1/users/search?search=${encodeURIComponent(
          query
        )}`,
        config
      );

      // Filter out current user and already selected users
      const filteredResults = response.data.data.filter(
        (user: User) =>
          user._id !== currentUser?._id &&
          !selectedUsers.find((selected) => selected._id === user._id)
      );

      setSearchResults(filteredResults);
      setCurrentChat(response.data.data);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  };

  // Add user to selected list
  const addUser = (user: User) => {
    if (!selectedUsers.find((selected) => selected._id === user._id)) {
      setSelectedUsers((prev) => [
        ...prev,
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
      ]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };
  

  // Remove user from selected list
  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  // Create group chat with avatar support
  const createGroupChat = async () => {
     if (!groupName.trim()) {
       toast.error("Please enter a group name");
       return;
     }

     if (selectedUsers.length < 2) {
       toast.error("Please select at least 2 users for the group");
       return;
     }

     try {
       setLoading(true);

       const formData = new FormData();
       formData.append("name", groupName);
       formData.append(
         "users",
         JSON.stringify(selectedUsers.map((user) => user._id))
       );

       // Append avatar file if selected
       if (groupAvatar) {
         formData.append("groupAvatar", groupAvatar);
       }

       const config = {
         headers: {
           Authorization: `Bearer ${currentUser?.token}`,
           "Content-Type": "multipart/form-data",
         },
       };

       const response = await axios.post(
         "http://localhost:8000/api/v1/chats/group",
         formData,
         config
       );

       // Add new chat to store
       if (response.data.data) {
         setChats([response.data.data, ...chats]);
         setCurrentChat(response.data.data);
         console.log(response.data.data);
         toast.success("Group created successfully!");
         onClose();
       } else {
         throw new Error("No data returned from server");
       }
     } catch (error: any) {
       console.error("Error creating group:", error);

       // Enhanced error handling
       if (error.response?.data?.message) {
         toast.error(error.response.data.message);
       } else if (error.response?.data?.error) {
         toast.error(error.response.data.error);
       } else {
         toast.error("Failed to create group. Please try again.");
       }
     } finally {
       setLoading(false);
     }
  };

  // Handle Enter key press in search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchUsers(searchQuery);
    }
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Create New Group</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add users, set a group name and avatar
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Group Avatar Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Group Avatar (Optional)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground/25">
                  {avatarPreview ? (
                    <AvatarImage
                      src={avatarPreview}
                      alt="Group avatar preview"
                    />
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {avatarPreview && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                    onClick={removeAvatar}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex-1">
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
                  disabled={uploadingAvatar}
                  className="w-full"
                >
                  {uploadingAvatar ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {avatarPreview ? "Change Avatar" : "Upload Avatar"}
                    </div>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
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
            />
            <p className="text-xs text-muted-foreground mt-1">
              {groupName.length}/50 characters
            </p>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Selected Users ({selectedUsers.length})
                </label>
                <span className="text-xs text-muted-foreground">
                  Minimum 2 users required
                </span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/20">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.username}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeUser(user._id)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Users */}
          <div>
            <label className="text-sm font-medium mb-2 block">Add Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Found {searchResults.length} user(s)
              </p>
              <ScrollArea className="h-48 border rounded-lg">
                <div className="p-2 space-y-1">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors border"
                      onClick={() => addUser(user)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          addUser(user);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {searchLoading && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Searching...
              </div>
            </div>
          )}

          {searchQuery && !searchLoading && searchResults.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No users found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-muted/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading || uploadingAvatar}
          >
            Cancel
          </Button>
          <Button
            onClick={createGroupChat}
            disabled={
              loading ||
              uploadingAvatar ||
              !groupName.trim() ||
              selectedUsers.length < 2 ||
              groupName.length > 50
            }
            className="flex-1"
          >
            {loading || uploadingAvatar ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {uploadingAvatar ? "Uploading..." : "Creating..."}
              </div>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
