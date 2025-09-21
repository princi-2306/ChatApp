import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { Loader, MessageCircleMore, Search, UserPlus, X } from "lucide-react";
import { Button } from '@/components/ui/button';
import ChatListCard from '../Cards/ChatListCard';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AddUser from '../Cards/AddUser';
import userPost, { User } from '@/components/store/userStore';
import axios from 'axios';
import { toast } from 'sonner';
import useChatStore from '@/components/store/chatStore';
import { Chat } from '@/components/store/chatStore';

const ChatList = ({onChatSelect, selectedChat}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
 

  const currentUser = userPost((state) => state.currentUser)
  const setChats = useChatStore((state) => state.setChats)
  const chats = useChatStore((state) => state.chats)
  const deleteChats = useChatStore((state) => state.deleteChat)
  const currentChat = useChatStore((state) => state.currentChat)

  const handleChatClick = (chat : Chat) => {
    onChatSelect(chat);
    markAsRead(chat._id);
  }
 
  const filteredChats = chats.filter(chat => {
    const username = chat.users?.[0]?.username || "";
    return (
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.chatName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  });

  const togglePin = (id: string) => {
    setChats(chats.map(chat =>
      chat._id === id ? { ...chat, isPinned: !chat.pinned } : chat
    ));
  }
  const toggleMute = (id: string) => {
    setChats(chats.map(chat =>
      chat._id === id ? { ...chat, mute: true } : chat
    ));
  }
  const markAsRead = (id: string) => {
    setChats(chats.map(chat =>
      chat._id === id ? {...chat, unreadCount : 0} : chat
    ))
  }

  const deleteChat = async(chatId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      };

      setLoading(true);

      const response = await axios.delete(`http://localhost:8000/api/v1/chats/delete-chat/${chatId}`, config)
      deleteChats(chatId);

      if (currentChat?._id === chatId) {
        onChatSelect(null); // if user in chat-section when chat gets deleted
      }

      console.log("chat deleted : ", response.data)
      setLoading(false);
    } catch (error) {
      toast.error("chats cannot be deleted");
      console.log(error)
    }
  }
useEffect(() => {
  setLoggedUser(currentUser);
}, [currentUser]);

useEffect(() => {
  if (currentUser) fetchChats();
}, [currentUser]);
  
  
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      };

      const reponse = await axios.get(
        "http://localhost:8000/api/v1/chats/fetch-chats", config
      );
      setChats(reponse.data.data);
      // console.log(reponse.data.data)
    } catch (error) {
      toast.error("unable to find chats")
      console.log(error)
    }
  }
  if (loading) return <Loader/>

  return (
    <div className="flex flex-col h-full border-r bg-muted/40">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b ">
        {/* Chats Title */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">Chats</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAddPanel(true)}
          >
            <UserPlus />
          </Button>
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
                        selectedChat?.id === chat._id
                          ? "bg-accent rounded-lg"
                          : ""
                      }
                    >
                      <ChatListCard
                        chat={chat}
                        loggedUser={currentUser} // pass the logged-in user
                        onPin={() => togglePin(chat._id)}
                        onMute={() => toggleMute(chat._id)}
                        onMarkAsRead={() => markAsRead(chat._id)}
                        deleteChat={() => deleteChat(chat._id)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* All Chats */}

          <div className="p-2">
            {filteredChats.filter((chats) => chats.pinned !== true).length >
              0 && (
              <h3 className="text-xs font-medium text-muted-foreground px-2 py-1">
                All Chats
              </h3>
            )}
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleChatClick(chat)}
                  className={
                    selectedChat?.id === chat._id ? "bg-accent rounded-lg" : ""
                  }
                >
                  <ChatListCard
                    chat={chat}
                    loggedUser={currentUser} // pass the logged-in user
                    onPin={() => togglePin(chat._id)}
                    onMute={() => toggleMute(chat._id)}
                    onMarkAsRead={() => markAsRead(chat._id)}
                    deleteChat={()=>deleteChat(chat._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
      {showAddPanel && <AddUser onClose={() => setShowAddPanel(false)} />}
    </div>
  );
}

export default ChatList
