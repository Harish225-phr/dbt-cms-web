import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useAuthCleanup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to clear authentication tokens
  const clearAuthTokens = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenType');
    console.log('Authentication tokens cleared due to navigation away from admin');
  };

  // Function to check if current path is admin-related
  const isAdminPath = (pathname) => {
    return pathname.startsWith('/admin') || pathname === '/login';
  };

  useEffect(() => {
    // Store previous path in sessionStorage to track navigation
    const previousPath = sessionStorage.getItem('currentPath');
    const currentPath = location.pathname;
    
    // Update current path
    sessionStorage.setItem('currentPath', currentPath);

    // If we were on an admin path and now we're not, clear tokens
    if (previousPath && isAdminPath(previousPath) && !isAdminPath(currentPath)) {
      clearAuthTokens();
    }

    // Handle browser back/forward navigation
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const wasOnAdmin = isAdminPath(sessionStorage.getItem('currentPath') || '');
      
      if (wasOnAdmin && !isAdminPath(newPath)) {
        clearAuthTokens();
      }
      sessionStorage.setItem('currentPath', newPath);
    };

    // Handle page refresh/close
    const handleBeforeUnload = () => {
      if (isAdminPath(currentPath)) {
        // Don't clear tokens on page refresh within admin
        return;
      }
      clearAuthTokens();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  return {
    clearAuthTokens,
    isAdminPath: () => isAdminPath(location.pathname)
  };
};

export default useAuthCleanup;