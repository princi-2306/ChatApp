import { useEffect, useState } from "react";
import {
  Loader,
  Search,
  UserPlus,
  Users,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatListCard from "../Cards/ChatListCard";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddUser from "../Cards/AddUser";
import CreateGroup from "../Cards/CreateGroup";
import BlockedUsersList from "../../components/ChatSection/BlockedUsersList"; // NEW IMPORT
import userPost, { User } from "@/components/store/userStore";
import axios from "axios";
import { toast } from "sonner";
import useChatStore from "@/components/store/chatStore";
import { Chat } from "@/components/store/chatStore";
import useNotificationStore from "@/components/store/notificationStore";
import { getMutedChats } from "@/lib/muteApi";


const ChatList = ({ onChatSelect, selectedChat }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false); // NEW STATE
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const currentUser = userPost((state) => state.currentUser);
  const blockedUsers = userPost((state) => state.blockedUsers); // NEW
  const setChats = useChatStore((state) => state.setChats);
  const chats = useChatStore((state) => state.chats);
  const deleteChats = useChatStore((state) => state.deleteChat);
  const currentChat = useChatStore((state) => state.currentChat);
  const updateChat = useChatStore((state) => state.updateChat);
  const muteChat = useChatStore((state) => state.muteChat);
  const setMutedChats = useChatStore((state) => state.setMutedChats);



  const fetchMutedChats = async () => {
  try {
    if (!currentUser?.token) return;
    
    const response = await getMutedChats(currentUser.token);
    const mutedChatIds = response.data.mutedChats.map((chat: any) => chat._id);
    setMutedChats(mutedChatIds);
    
    // Update chat objects with mute status
    setChats(chats.map(chat => ({
      ...chat,
      isMuted: mutedChatIds.includes(chat._id),
      mute: mutedChatIds.includes(chat._id)
    })));
  } catch (error) {
    console.error("Error fetching muted chats:", error);
  }
};


  // Notification store
  const unreadPerChat = useNotificationStore((state) => state.unreadPerChat);
  const setUnreadPerChat = useNotificationStore(
    (state) => state.setUnreadPerChat
  );
  const clearUnreadForChat = useNotificationStore(
    (state) => state.clearUnreadForChat
  );

  const handleChatClick = async (chat: Chat) => {
    onChatSelect(chat);
    markAsRead(chat._id);

    // Mark notifications as read for this chat
    if (unreadPerChat[chat._id]) {
      await markChatNotificationsAsRead(chat._id);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const username = chat.users?.[0]?.username || "";
    const chatName = chat.chatName || "";
    return (
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const togglePin = async (chatId: string) => {
    try {
      const token = localStorage.getItem("tokens");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        "http://localhost:8000/api/v1/chats/toggle-pin",
        { chatId },
        config
      );

      const { chat, action } = response.data.data;

      updateChat(chat);

      toast.success(`Chat ${action} successfully!`);
    } catch (error: any) {
      console.error("Error toggling pin:", error);
      toast.error(error.response?.data?.message || "Failed to toggle pin");
    }
  };

  const toggleMute = async (chatId: string) => {
    try {
      const updatedChats = chats.map((chat) =>
        chat._id === chatId ? { ...chat, mute: !chat.mute } : chat
      );
      setChats(updatedChats);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const markAsRead = (chatId: string) => {
    setChats(
      chats.map((chat) =>
        chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  const markChatNotificationsAsRead = async (chatId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      await axios.put(
        `http://localhost:8000/api/v1/notifications/read-chat/${chatId}`,
        {},
        config
      );

      clearUnreadForChat(chatId);
    } catch (error) {
      console.error("Error marking chat notifications as read:", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      setLoading(true);

      const response = await axios.delete(
        `http://localhost:8000/api/v1/chats/delete-chat/${chatId}`,
        config
      );

      deleteChats(chatId);

      if (currentChat?._id === chatId) {
        onChatSelect(null);
      }

      console.log("chat deleted : ", response.data);
      toast.success("Chat deleted successfully!");
      setLoading(false);
    } catch (error) {
      toast.error("Chat cannot be deleted");
      console.log(error);
    }
  };

  const clearChat = async (chatId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.delete(
        `http://localhost:8000/api/v1/chats/clear-chat/${chatId}`,
        config
      );

      toast.success(response.data.message || "Chat cleared successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to clear chat");
      console.error("Error clearing chat:", error);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.get(
        "http://localhost:8000/api/v1/notifications/unread-per-chat",
        config
      );

      setUnreadPerChat(response.data.data);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  useEffect(() => {
    setLoggedUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchChats();
      fetchUnreadCounts();
      fetchMutedChats();
    }
  }, [currentUser, currentChat]);

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.get(
        "http://localhost:8000/api/v1/chats/fetch-chats",
        config
      );
      setChats(response.data.data);
    } catch (error) {
      toast.error("Unable to fetch chats");
      console.log(error);
    }
  };
  

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full border-r bg-muted/40">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b ">
        {/* Chats Title */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateGroup(true)}
              title="Create Group"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddPanel(true)}
              title="Add User"
            >
              <UserPlus className="h-4 w-4" />
            </Button>

            {/* NEW: Blocked Users Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBlockedUsers(true)}
                title="Blocked Users"
                className="hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                <Ban className="h-4 w-4 text-orange-600" />
              </Button>
              {blockedUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {blockedUsers.length > 9 ? "9+" : blockedUsers.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Search Bar */}
        <div className="p-4 pt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden h-full">
        <ScrollArea className="h-full">
          {/* Pinned Chats */}
          {filteredChats.filter((chat) => chat.pinned).length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-medium text-muted-foreground px-2 py-1">
                Pinned
              </h3>
              <div className="space-y-1">
                {filteredChats
                  .filter((chat) => chat.pinned)
                  .map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => handleChatClick(chat)}
                      className={
                        selectedChat?._id === chat._id
                          ? "bg-accent rounded-lg"
                          : ""
                      }
                    >
                      <ChatListCard
                        chat={chat}
                        loggedUser={currentUser}
                        onPin={() => togglePin(chat._id)}
                        onMute={() => toggleMute(chat._id)}
                        onMarkAsRead={() => markAsRead(chat._id)}
                        deleteChat={() => deleteChat(chat._id)}
                        clearChat={() => clearChat(chat._id)}
                        unreadCount={unreadPerChat[chat._id]?.count || 0}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* All Chats */}
          <div className="p-2">
            {filteredChats.filter((chat) => !chat.pinned).length > 0 && (
              <h3 className="text-xs font-medium text-muted-foreground px-2 py-1">
                All Chats
              </h3>
            )}
            <div className="space-y-1">
              {filteredChats
                .filter((chat) => !chat.pinned)
                .map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => handleChatClick(chat)}
                    className={
                      selectedChat?._id === chat._id
                        ? "bg-accent rounded-lg"
                        : ""
                    }
                  >
                    <ChatListCard
                      chat={chat}
                      loggedUser={currentUser}
                      onPin={() => togglePin(chat._id)}
                      onMute={() => toggleMute(chat._id)}
                      onMarkAsRead={() => markAsRead(chat._id)}
                      deleteChat={() => deleteChat(chat._id)}
                      clearChat={() => clearChat(chat._id)}
                      unreadCount={unreadPerChat[chat._id]?.count || 0}
                    />
                  </div>
                ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Modals */}
      {showAddPanel && <AddUser onClose={() => setShowAddPanel(false)} />}
      {showCreateGroup && (
        <CreateGroup
          showCreateGroup={showCreateGroup}
          onClose={() => {
            setShowCreateGroup(false);
            useChatStore.getState().closeDialog();
          }}
        />
      )}

      {/* NEW: Blocked Users Modal */}
      <BlockedUsersList
        open={showBlockedUsers}
        onOpenChange={setShowBlockedUsers}
      />
    </div>
  );
};

export default ChatList;