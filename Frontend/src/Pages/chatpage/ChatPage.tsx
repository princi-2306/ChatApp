import React, { useEffect, useState } from 'react'
import Header from './Header'
import ChatList from './ChatList'
import ChatSection from './ChatSection';
import useChatStore from '@/components/store/chatStore';
const ChatPage = () => {

  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024)

  const setCurrentChat = useChatStore((state) => state.setCurrentChat)
  const setChats = useChatStore((state) => state.setChats)
  useEffect(() => {
    const handleSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    }

    window.addEventListener('resize', handleSize)
    return () => window.removeEventListener('resize', handleSize)
  }, [])
  
  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    setCurrentChat(chat);
    setChats(chat)
  }

  const handleBackToChatList = () => {
    setSelectedChat(null)
  }
  
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
              chat={selectedChat}
              onBack={isMobileView ? handleBackToChatList : null}
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
