import { createContext, useContext, useState, useEffect } from 'react';
import API from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('orgToken');
      if (token) {
        const response = await API.getProfile();
        if (response.success) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('orgToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('orgToken');
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const response = await API.login(email, password);
      if (response.success) {
        localStorage.setItem('orgToken', response.data.token);
        setUser(response.data.organization);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async function register(orgData) {
    try {
      const response = await API.register(orgData);
      if (response.success) {
        localStorage.setItem('orgToken', response.data.token);
        setUser(response.data.organization);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  function logout() {
    localStorage.removeItem('orgToken');
    setUser(null);
    setIsAuthenticated(false);
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
