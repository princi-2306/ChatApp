import React from 'react'
import Header from './Header'
import ChatList from './ChatList'
import Chats from './Chats'
const Chat = () => {
  return (
    <div>
      <Header/>
      <div className='flex'>
        <ChatList/>
        <Chats/>
      </div>
    </div>
  )
}

export default Chat
