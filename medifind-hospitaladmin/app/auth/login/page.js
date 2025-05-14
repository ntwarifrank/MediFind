'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate password length
    if (credentials.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Attempting to login with backend at ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/admin`);
      // Connect to the Express.js backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      // Store hospital ID if hospital_admin
      if (data.user.role === 'hospital_admin' && data.user.hospital) {
        // Handle both populated and unpopulated responses
        const hospitalId = typeof data.user.hospital === 'object' ? 
          data.user.hospital._id : data.user.hospital;
        localStorage.setItem('hospitalId', hospitalId);
        console.log('Hospital ID stored:', hospitalId);
      }
      
      // Set cookie for middleware authentication
      document.cookie = `authToken=${data.token}; path=/; max-age=${60*60*24*30}`; // 30 days expiry
      
      // Add a small delay before redirect to ensure cookie is set
      setTimeout(() => {
        // Redirect to dashboard
        router.push('/');
      }, 300);
    } catch (err) {
      console.error('Login error details:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError(`Could not connect to the server. Please make sure the backend is running at ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mainBlue to-deepBlue p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full opacity-70"></div>
        <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-mainBlue to-deepBlue rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-DarkBlue mb-2">MediFind</h1>
          <p className="text-mainGray">Hospital Administration Portal</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-DarkBlue mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-mainGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent bg-gray-50"
                placeholder="hospital@example.com"
              />
            </div>
          </div>
          
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-DarkBlue">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-mainBlue hover:text-deepBlue">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-mainGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent bg-gray-50"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-mainBlue border-gray-300 rounded focus:ring-mainBlue"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-mainGray">
              Remember me
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-mainBlue to-deepBlue hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainBlue"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-mainGray">Or</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-mainGray">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-mainBlue hover:text-deepBlue">
              Register now
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
