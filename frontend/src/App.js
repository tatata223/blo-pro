import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import NotesApp from './components/NotesApp';
import UserProfile from './components/Profile/UserProfile';
import ProfileEdit from './components/Profile/ProfileEdit';
import StatisticsDashboard from './components/Statistics/StatisticsDashboard';
import DailyTasks from './components/Tasks/DailyTasks';
import FirefliesSystem from './components/Fireflies/FirefliesSystem';
import AccountSettings from './components/Settings/AccountSettings';
import ChatInterface from './components/Chat/ChatInterface';
import PrivateRoute from './components/PrivateRoute';
import FloatingMenuButtons from './components/Header/FloatingMenuButtons';
import './App.css';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <FloatingMenuButtons />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:user_id" element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } />
              <Route path="/profile/edit" element={
                <PrivateRoute>
                  <ProfileEdit />
                </PrivateRoute>
              } />
              <Route path="/statistics" element={
                <PrivateRoute>
                  <StatisticsDashboard />
                </PrivateRoute>
              } />
              <Route path="/tasks" element={
                <PrivateRoute>
                  <DailyTasks />
                </PrivateRoute>
              } />
              <Route path="/fireflies" element={
                <PrivateRoute>
                  <FirefliesSystem />
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute>
                  <AccountSettings />
                </PrivateRoute>
              } />
              <Route path="/chat" element={
                <PrivateRoute>
                  <ChatInterface />
                </PrivateRoute>
              } />
              <Route path="/" element={<NotesApp />} />
              <Route path="/*" element={<NotesApp />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-neumorphic-out)',
                  padding: '16px 20px',
                  fontSize: '15px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--primary-color)',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--danger-color)',
                    secondary: 'white',
                  },
                },
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
