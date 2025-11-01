import React, { useState } from 'react';

import AdminHome from '../../../pages/admin/adminhome/AdminHome';
import Users from '../../../pages/admin/users/Users';
import Content from '../Content/Content';
import ViewPage from '../Content/view-content/viewPage';
import ViewNotification from '../Content/view-notification/viewNotification';
import ViewMedia from '../Content/view-media/viewMedia';
import SuccessStory from '../Content/success-story-content/SuccessStory';
import ViewStory from '../Content/success-story-content/ViewStory';

import './MainContent.css';

const MainContent = ({ activeMenuItem = 'content', onNavigate }) => {
  const [viewParams, setViewParams] = useState({}); // Store additional params for views
  
  // Enhanced navigation handler to receive additional params
  const handleNavigation = (target, params = {}) => {
    console.log("Navigation called with target:", target, "and params:", params);
    setViewParams(params);
    onNavigate(target);
  };
  
  const renderContent = () => {
    switch (activeMenuItem) {
      case 'home':
        return <AdminHome />;
      case 'users':
        return <Users />;
      case 'content':
        return <Content onNavigate={handleNavigation} />;
      case 'view':
        if (viewParams.pageType === 'Notification') {
          return <ViewNotification pageId={viewParams.pageId} onNavigateBack={() => handleNavigation('content')} />;
        } else if (viewParams.pageType === 'Media') {
          return <ViewMedia pageId={viewParams.pageId} onNavigateBack={() => handleNavigation('content')} />;
        } else if (viewParams.pageType === 'Success-Story') {
          return <SuccessStory pageId={viewParams.pageId} onNavigateBack={handleNavigation} />;
        } else {
          return <ViewPage pageId={viewParams.pageId} onNavigateBack={() => handleNavigation('content')} />;
        }
      case 'view-story':
        return <ViewStory section={viewParams.section} onNavigateBack={() => handleNavigation('view', { pageId: viewParams.pageId, pageType: 'Success-Story' })} />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <main className="main-content">
      <div className="content-wrapper">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContent;
