'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if user is logged in on page load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token is valid
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('authToken');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Fetch SuperAdmin user data from dedicated endpoint
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me/superadmin`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // SuperAdmin endpoint response format differs slightly
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // SuperAdmin login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the dedicated SuperAdmin login endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/superadmin`,
        { email, password }
      );
      
      // Check if response has token and user data in the expected format
      const { token, user } = response.data;
      
      // All users from this endpoint are super_admins by default due to our backend design
      // But we double-check for extra security
      if (!user.role || user.role !== 'super_admin') {
        setError('You do not have permission to access this area. Only super admins can access.');
        setLoading(false);
        return false;
      }
      
      localStorage.setItem('authToken', token);
      setUser(user);
      router.push('/');
      return true;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Login failed. Please check your credentials.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/auth/login');
  };

  // Clear any error messages
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
