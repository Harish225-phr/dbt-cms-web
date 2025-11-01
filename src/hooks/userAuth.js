import { useState } from "react";
import { loginUser } from "../services/authService";

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    const response = await loginUser(credentials);
    setLoading(false);

    // API wrapper returns { error: true, message } on failures
    if (response?.error) {
      setError(response.message);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenType");
      return null;
    }

    // Debug: log raw response to help determine token shape
    console.log('useAuth login response:', response);

    const token =
      response?.response?.token
    const tokenType =
      response?.response?.tokenType 

    if (token) {
      sessionStorage.setItem("token", token);
    } else {
      console.warn('No token found in login response; sessionStorage not set.');
    }

    if (tokenType) {
      sessionStorage.setItem("tokenType", tokenType);
    }

    return response;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("tokenType");
    sessionStorage.removeItem("currentPath");
    console.log('User logged out successfully');
  };

  const isAuthenticated = () => {
    const token = sessionStorage.getItem('token');
    const tokenType = sessionStorage.getItem('tokenType');
    return token && tokenType;
  };

  return { login, logout, isAuthenticated, loading, error };
};

export default useAuth;
