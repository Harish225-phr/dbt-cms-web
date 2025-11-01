import React from 'react';
import { 
  FaHome, 
  FaBuilding, 
  FaList, 
  FaUsers, 
  FaChartBar, 
  FaPlus,
  FaBars,
  FaSignOutAlt,
  FaEdit   // <-- added this for Manage Content
} from 'react-icons/fa';


<li>
  <FaEdit /> Manage Content
</li>

import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/userAuth';
import './Sidebar.css';

const Sidebar = ({ activeMenuItem = 'content', onMenuItemClick, isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    // { id: 'home', label: 'Home', icon: FaHome },
    // { id: 'departments', label: 'Manage Departments', icon: FaBuilding },
    { id: 'content', label: 'Manage Content', icon: FaEdit },
    // { id: 'users', label: 'Manage Users', icon: FaUsers },
    // { id: 'newpage', label: 'New Page', icon: FaPlus },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`sidebar  primary-color ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={onToggle}>
          <FaBars />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activeMenuItem === item.id ? 'active' : ''}`}
                  onClick={() => onMenuItemClick(item.id)}
                  title={isCollapsed ? item.label : ''}
                >
                  <IconComponent className="nav-icon" />
                  {!isCollapsed && <span className="nav-text">{item.label}</span>}
                </button>
              </li>
            );
          })}
          
          {/* Logout Button */}
          <li className="nav-item logout-item">
            <button
              className="nav-link logout-btn"
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : ''}
            >
              <FaSignOutAlt className="nav-icon" />
              {!isCollapsed && <span className="nav-text">Logout</span>}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
