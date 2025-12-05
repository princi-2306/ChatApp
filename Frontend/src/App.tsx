import React from 'react'
import HomePage from '@/Pages/LoginPage/HomePage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import ChatPage from './Pages/chatpage/ChatPage';
import LandingPage from './Pages/LoginPage/LandingPage';

const App = () => {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<ChatPage />} />
        <Route path="/login" element={<HomePage />} />
        {/* <Route path="/main1" element={ <LandingPage/>} /> */}
      </Routes>
    </Router>
  );
}

export default App
