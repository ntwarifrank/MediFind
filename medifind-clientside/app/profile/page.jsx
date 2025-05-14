"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Nav from "../nav/page";
import Footer from "../homepage/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faPhone, faHome, faEdit, faLock, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const token = localStorage.getItem('mediToken');
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.patch(
        `${baseURL}/api/users/me`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.status === "success") {
        setMessage({ 
          type: "success", 
          text: "Profile updated successfully!" 
        });
        setIsEditing(false);
        
        // Update user data in auth context (this would depend on how your AuthContext is set up)
        // refreshUserData(); // You'll need to implement this in AuthContext
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update profile" 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading or redirect if not authenticated
  if (authLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-mainBlue"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="w-full bg-mainWhite min-h-screen">
      <Nav />
      
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-DarkBlue mb-8 text-center">
            My Profile
          </h1>
          
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-mainBlue to-deepBlue p-6 flex items-center">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-mainBlue text-3xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="ml-6 text-white">
                <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
                <p className="opacity-80">{user?.role || "Patient"}</p>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6">
              {/* Messages */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === "success" 
                    ? "bg-green-100 border-l-4 border-green-500 text-green-700" 
                    : "bg-red-100 border-l-4 border-red-500 text-red-700"
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FontAwesomeIcon 
                        icon={message.type === "success" ? faLock : faExclamationCircle} 
                        className="h-5 w-5" 
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {isEditing ? (
                    // Editable Mode
                    <>
                      <div>
                        <label className="block text-gray-700 mb-2">Full Name</label>
                        <div className="flex items-center border border-gray-300 rounded-lg p-3">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-3" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="flex-1 focus:outline-none"
                            placeholder="Your full name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">Email Address</label>
                        <div className="flex items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                          <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-3" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="flex-1 focus:outline-none bg-gray-50"
                            placeholder="Your email address"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">Phone Number</label>
                        <div className="flex items-center border border-gray-300 rounded-lg p-3">
                          <FontAwesomeIcon icon={faPhone} className="text-gray-400 mr-3" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="flex-1 focus:outline-none"
                            placeholder="Your phone number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">Address</label>
                        <div className="flex items-center border border-gray-300 rounded-lg p-3">
                          <FontAwesomeIcon icon={faHome} className="text-gray-400 mr-3" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="flex-1 focus:outline-none"
                            placeholder="Your address"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex border-b border-gray-200 py-3">
                        <div className="w-1/3 text-gray-600">
                          <FontAwesomeIcon icon={faUser} className="mr-2" />
                          Full Name
                        </div>
                        <div className="w-2/3 font-medium">{user?.name || "Not provided"}</div>
                      </div>
                      
                      <div className="flex border-b border-gray-200 py-3">
                        <div className="w-1/3 text-gray-600">
                          <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                          Email
                        </div>
                        <div className="w-2/3 font-medium">{user?.email || "Not provided"}</div>
                      </div>
                      
                      <div className="flex border-b border-gray-200 py-3">
                        <div className="w-1/3 text-gray-600">
                          <FontAwesomeIcon icon={faPhone} className="mr-2" />
                          Phone
                        </div>
                        <div className="w-2/3 font-medium">{user?.phone || "Not provided"}</div>
                      </div>
                      
                      <div className="flex border-b border-gray-200 py-3">
                        <div className="w-1/3 text-gray-600">
                          <FontAwesomeIcon icon={faHome} className="mr-2" />
                          Address
                        </div>
                        <div className="w-2/3 font-medium">{user?.address || "Not provided"}</div>
                      </div>
                      
                      <div className="flex border-b border-gray-200 py-3">
                        <div className="w-1/3 text-gray-600">
                          Account Type
                        </div>
                        <div className="w-2/3 font-medium capitalize">{user?.role || "Patient"}</div>
                      </div>
                    </>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-mainBlue to-deepBlue text-white rounded-lg hover:shadow-md transition-all flex items-center justify-center"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-gradient-to-r from-mainBlue to-deepBlue text-white rounded-lg hover:shadow-md transition-all flex items-center"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/my-appointments">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-bold text-DarkBlue mb-2">My Appointments</h3>
                <p className="text-gray-600">View and manage your upcoming and past appointments</p>
              </div>
            </Link>
            
            <Link href="/change-password">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-bold text-DarkBlue mb-2">Security Settings</h3>
                <p className="text-gray-600">Update your password and security preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
