import React from 'react'
import HomePage from '@/Pages/LoginPage/HomePage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import Chat from './Pages/chatpage/Chat';
const App = () => {
  return (
    <Router>
      <Toaster/>
    <Routes>
     <Route path="/" element={<HomePage/>}/>
     <Route path="/main" element={<Chat/>}/>
    </Routes>
   </Router>
  )
}

export default App
