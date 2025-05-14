"use client"
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const MainLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [currentAdminData, setCurrentAdminData] = useState([]);
  const [HospitalData, setHospitalData] = useState([]);

  useEffect(() => {
    const fetchCurrentAdmin = async() => {

      const token = localStorage.getItem('authToken');
      
      console.log("token:", token);
      
      if(!token) {
        console.log("No auth token found");
        return;
      }
      
      try {
        const Decoded = jwtDecode(token);
        console.log("decoded token:", Decoded);


    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getCurrentUser/Admin/${Decoded.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if(response.status == 200){
        setCurrentAdminData(response.data.Admin);
        console.log("admin data" , response.data.Admin);
        localStorage.setItem("adminId", Decoded.id);
      }else{
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error.response?.data || error.message);
    }
    } catch (error) {
      console.error("Token decode error:", error);
    }
    }
    fetchCurrentAdmin();
  }, [])


  useEffect(() => {
      const fetchCurrentAdminHospital = async() => {
        if(!currentAdminData._id) {
          console.log("No admin ID available");
          return;
        }
        
        console.log("admin id" , currentAdminData._id);
        const token = localStorage.getItem('authToken');
        
        if(!token) {
          console.log("No auth token available");
          return;
        }

        try {
          // Notice: This endpoint doesn't need the admin ID in the URL
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/specificHospital`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if(response.status === 200){
            // Handle different response formats
            let hospitalData;
            
            if (response.data.Hospital && response.data.Hospital.hospital) {
              hospitalData = response.data.Hospital.hospital;
            } else if (response.data.hospital) {
              hospitalData = response.data.hospital;
            } else if (response.data.data && response.data.data.hospital) {
              hospitalData = response.data.data.hospital;
            }
            
            if (hospitalData) {
              console.log("Hospital data found:", hospitalData);
              setHospitalData(hospitalData);
              
              // Store hospital ID for use in other components
              localStorage.setItem('hospitalId', hospitalData._id);
              console.log("Hospital ID stored in localStorage:", hospitalData._id);
            } else {
              console.error("Could not extract hospital data from response:", response.data);
            }
          }
        } catch (error) {
          console.log(error)
        }
      }

      fetchCurrentAdminHospital()
  }, [currentAdminData])

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white shadow-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-DarkBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileOpen}
        onClose={toggleMobileMenu}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-DarkBlue">MediFind Admin</h1>
              <div className="hidden md:block">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-mainGray">Welcome,</span>
                    <span className="font-medium">{currentAdminData?.adminName}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" title="Notifications">
                <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  <svg className="w-5 h-5 text-mainGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
              <div className="relative" title="User settings">
                <button className="p-2 rounded-lg hover:bg-gray-100 flex items-center space-x-1" onClick={() => logout()}>
                  <svg className="w-5 h-5 text-mainGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden md:inline text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100">
          <div className="px-6 py-4 text-sm text-mainGray">
            <div className="flex justify-between items-center">
              <span>&copy; {new Date().getFullYear()} MediFind. All rights reserved.</span>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-mainBlue">Privacy</a>
                <a href="#" className="hover:text-mainBlue">Terms</a>
                <a href="#" className="hover:text-mainBlue">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
