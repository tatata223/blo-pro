import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header/Header';
import './Layout.css';

const Layout = ({ children, showSidebar = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateNote = () => {
    navigate('/');
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  return (
    <div className="app-layout">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCreateNote={handleCreateNote}
        onSidebarToggle={handleSidebarToggle}
        onSearchToggle={handleSearchToggle}
        isSidebarOpen={isSidebarOpen}
        isSearchOpen={isSearchOpen}
      />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
