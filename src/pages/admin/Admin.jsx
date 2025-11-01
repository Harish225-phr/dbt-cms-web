import React, { useState } from 'react';
import Sidebar from '../../components/admin/Sidebar/Sidebar';
import MainContent from '../../components/admin/MainContent/MainContent';
import './Admin.css';

const Admin = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('content');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="admin-dashboard">
      <Sidebar 
        activeMenuItem={activeMenuItem}
        onMenuItemClick={handleMenuItemClick}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className={`main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <MainContent 
          activeMenuItem={activeMenuItem} 
          onNavigate={handleMenuItemClick} 
        />
      </div>
    </div>
  );
};

export default Admin;
