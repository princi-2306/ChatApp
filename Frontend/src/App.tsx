import React from 'react'
import HomePage from '@/Pages/LoginPage/HomePage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import ChatPage from './Pages/chatpage/ChatPage';

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" richColors/>
    <Routes>
     <Route path="/" element={<HomePage/>}/>
     <Route path="/main" element={<ChatPage/>}/>
    </Routes>
   </Router>
  )
}

export default App
