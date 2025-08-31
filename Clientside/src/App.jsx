import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/pages/Profile';
import Dashboard from './components/pages/Dashboard';
import AIChat from './components/pages/Aichat';
import KanbanBoard from './components/pages/Kanbanboard';
import DocumentEditor from './components/pages/Documenteditor';
import DocumentList from './components/pages/Documentlist';
import Board from './components/pages/Board';
import Realtimechat from './components/pages/Realtimechat';
import Mindmapboard from './components/pages/Midmapboard';
import { ThemeProvider } from './components/theme/Themecontext';   // ✅ use ThemeProvider

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/doc" element={<DocumentList />} />
          <Route path="/realtimechat" element={<Realtimechat />} />
          <Route path="/editor" element={<DocumentEditor />} />
          <Route path="/editor/:id" element={<DocumentEditor />} />
          <Route path="/board" element={<Board/>} />
          <Route path="/midmap" element={<Mindmapboard/>}/>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App;
