'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // API base URL
  const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Initialize auth state on mount
  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (err) {
        console.error('Error parsing user info:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your connection and try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Registering user with data:', userData);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please check your connection and try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    
    // Clear the authentication cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Reset user state
    setUser(null);
    
    // Redirect to login page
    router.push('/auth/login');
  };
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Get authorization header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Admin login function
  const adminLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/login/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }
      
      // Store token, user data, and hospital ID in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      // Store hospital ID if available
      if (data.user.role === 'hospital_admin' && data.hospital && data.hospital._id) {
        localStorage.setItem('hospitalId', data.hospital._id);
      } else if (data.user.hospital && data.user.hospital._id) {
        localStorage.setItem('hospitalId', data.user.hospital._id);
      }
      
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Admin login failed. Please check your credentials and try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function for API requests
  const apiRequest = async (endpoint, method = 'GET', data = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };
      
      const config = {
        method,
        headers,
        credentials: 'include'
      };
      
      if (data) {
        config.body = JSON.stringify(data);
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }
      
      return responseData;
    } catch (err) {
      console.error('API request error:', err);
      throw err;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        adminLogin,
        register,
        logout,
        loading,
        error,
        isAuthenticated: !!user,
        getAuthHeader
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
