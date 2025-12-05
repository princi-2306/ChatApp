
import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, UserPlus, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Chat } from "../store/chatStore";

interface UserType {
  _id: string;
  username: string;
  email: string;
  avatar: string;
}

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMembers: UserType[];
  allUsers: UserType[];
  onConfirm: (selected: UserType[], updatedGroup?: any) => void; // Updated to accept updated group
  currentUser?: UserType | null;
  currentChat?: Chat;
  onMembersAdded?: (updatedGroup: any) => void; // New callback for real-time updates
}

const AddMember: React.FC<AddMembersDialogProps> = ({
  open,
  onOpenChange,
  existingMembers,
  allUsers,
  onConfirm,
  currentUser,
  currentChat,
  onMembersAdded, // New prop
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserType[]>([]);
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [useServerSearch, setUseServerSearch] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const existingIds = new Set(existingMembers.map((m) => m._id));

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelected([]);
      setSearch("");
      setSearchResults([]);
      setUseServerSearch(false);
    }
  }, [open]);

  // Determine whether to use client-side filtering or server search
  useEffect(() => {
    if (search.trim().length > 2) {
      setUseServerSearch(true);
      handleServerSearch(search);
    } else {
      setUseServerSearch(false);
      setSearchResults([]);
    }
  }, [search]);

  // Server search function
  const handleServerSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const token = localStorage.getItem("tokens");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:8000/api/v1/users/search?search=${encodeURIComponent(
          query
        )}`,
        config
      );

      // Filter out current user and existing members
      const filteredResults = response.data.data.filter(
        (user: UserType) =>
          user._id !== currentUser?._id && !existingIds.has(user._id)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Client-side filtered users (fallback)
  const filteredUsers = useMemo(() => {
    if (useServerSearch) {
      return searchResults;
    }

    return allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(search.toLowerCase()) &&
        !existingIds.has(user._id) &&
        user._id !== currentUser?._id
    );
  }, [
    search,
    allUsers,
    existingIds,
    useServerSearch,
    searchResults,
    currentUser,
  ]);

  const toggleSelect = (user: UserType) => {
    if (existingIds.has(user._id)) return;

    setSelected((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  // Unified add function that handles both API call and parent callback
  const handleAdd = async () => {
    if (selected.length === 0) return;

    // If we have a currentChat, use the API approach
    if (currentChat && currentChat._id) {
      try {
        setAddingMember(true);
        const token = localStorage.getItem("tokens");

        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const userIds = selected.map((user) => user._id);

        // Make API call to add members
        const response = await axios.put(
          "http://localhost:8000/api/v1/chats/groupadd",
          {
            userIds: userIds,
            chatId: currentChat._id,
          },
          config
        );

        const updatedGroup = response.data.data?.currentChat; // Adjust based on your API response

        toast.success("Members added successfully");

        // Call the parent onConfirm with the selected users AND updated group
        onConfirm(selected, updatedGroup);

        // Also call the new callback for real-time updates
        if (onMembersAdded && updatedGroup) {
          onMembersAdded(updatedGroup);
        }

        // Reset and close
        setSelected([]);
        setSearch("");
        setSearchResults([]);
        onOpenChange(false);
      } catch (error: any) {
        console.error("Add member error:", error);
        const errorMessage =
          error.response?.data?.message || "Unable to add members";
        toast.error(errorMessage);
      } finally {
        setAddingMember(false);
      }
    } else {
      // Fallback to the original approach
      onConfirm(selected);
      setSelected([]);
      setSearch("");
      setSearchResults([]);
      onOpenChange(false);
    }
  };

  const displayUsers = useServerSearch ? searchResults : filteredUsers;
  const hasSearchResults = useServerSearch
    ? searchResults.length > 0
    : filteredUsers.length > 0;
  const showNoResults =
    !searchLoading && search.trim() !== "" && !hasSearchResults;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Search users by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Selected Users Preview */}
          {selected.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">
                Selected ({selected.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 text-xs"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-[8px]">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected((prev) =>
                          prev.filter((u) => u._id !== user._id)
                        );
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {searchLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            ) : showNoResults ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found matching "{search}"
              </p>
            ) : !search.trim() ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Start typing to search for users
              </p>
            ) : (
              displayUsers.map((user) => {
                const isSelected = selected.some((u) => u._id === user._id);

                return (
                  <div
                    key={user._id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleSelect(user)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <UserPlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={addingMember}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={selected.length === 0 || addingMember}
              onClick={handleAdd}
            >
              {addingMember ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                `Add ${selected.length} Member${selected.length > 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMember;