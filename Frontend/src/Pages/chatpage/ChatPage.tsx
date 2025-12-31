// TS DONE

import { useEffect, useState } from 'react'
import Header from './Header'
import ChatList from './ChatList'
import ChatSection from './ChatSection';
import { User } from '../../components/store/userStore'
import useChatStore from '@/components/store/chatStore';

export interface Chat {
    _id: string,
    chatName: string,
    users?: User[],
    isGroupChat?: boolean,
    groupAdmin?: any;
    unreadCount: number | 2 ;
    mute: boolean | false;
    isMuted?: boolean; // NEW: Support both naming conventions
    pinned: boolean | false;
    latestMessage: string;
    groupAvatar: string;
}

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024)

  const setCurrentChat = useChatStore((state) => state.setCurrentChat)
  const currentChat = useChatStore((state) => state.currentChat)

  useEffect(() => {
    const handleSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    }

    window.addEventListener('resize', handleSize)
    return () => window.removeEventListener('resize', handleSize)
  }, [])
  
  const handleChatSelect = (chat : any) => {
    setSelectedChat(chat)
    setCurrentChat(chat);
  }

  const handleBackToChatList = () => {
    setSelectedChat(null)
    setCurrentChat(null)
  }

  // Sync selectedChat with currentChat from store
  // This allows notifications to change the active chat
  useEffect(() => {
    if (currentChat && currentChat._id !== selectedChat?._id) {
      setSelectedChat(currentChat);
    }
  }, [currentChat]);
  
  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`w-full lg:w-90 border-r ${
            isMobileView && selectedChat ? "hidden" : "block"
          }`}
        >
          <ChatList
            onChatSelect={handleChatSelect}
            selectedChat={selectedChat}
          />
        </div>
        <div
          className={`flex-1 ${
            isMobileView && !selectedChat ? "hidden" : "flex"
          }`}
        > 
          {selectedChat ? (
            <ChatSection
              onBack={isMobileView ? handleBackToChatList : undefined}
            />
          ) : (
            <div className="flex-1 hidden lg:flex items-center justify-center bg-muted/30">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">
                  Select a chat to start messaging
                </p>
                <p className="text-sm">Or start a new conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage