"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is already logged in (on page load)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('mediToken');
        
        if (token) {
          // Verify token with backend
          const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
          const response = await axios.get(`${baseURL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.status === 'success') {
            setUser(response.data.data.user);
          } else {
            // Invalid token
            localStorage.removeItem('mediToken');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error verifying authentication:', err);
        localStorage.removeItem('mediToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      // Set the base URL for the API
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
      const response = await axios.post(`${baseURL}/api/auth/login`, { email, password });
      
      if (response.data.status === 'success') {
        localStorage.setItem('mediToken', response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null); // Clear any previous errors
      
      // Ensure we're using the correct API URL
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log('Registering user with API:', `${baseURL}/api/auth/register`);
      console.log('Registration data:', { ...userData, password: '[REDACTED]' });
      
      const response = await axios.post(`${baseURL}/api/auth/register`, userData);
      console.log('Registration response:', response.data);
      
      if (response.data.status === 'success') {
        return true;
      } else {
        setError(response.data.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Extract error message from response if available
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'An error occurred during registration. Please try again.';
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('mediToken');
    
    // Clear user data
    setUser(null);
    
    // Clear any errors
    setError(null);
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
