'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Image from 'next/image';

export default function SettingsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState('');
  
  // Hospital profile data
  const [hospitalProfile, setHospitalProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      province: '',
      country: 'Rwanda'
    },
    location: {
      type: 'Point',
      coordinates: [30.0588, -1.9547] // Default to Kigali coordinates
    },
    website: '',
    description: '',
    founded: '',
    beds: '',
    logo: '/images/default-hospital-logo.png',
    services: [],
    specialties: [],
    facilities: [],
    insurances: [],
    workingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: { open: '', close: '' }
    }
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    appointmentReminders: true,
    systemUpdates: true,
    marketingEmails: false,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);
  
  // Fetch hospital data
  useEffect(() => {
    const fetchHospitalData = async () => {
      if (!user || !token) return;
      
      setLoading(true);
      setErrorMessage('');
      
      try {
        // First, find the hospital associated with this admin
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            // This assumes the API can filter hospitals by admin
            admin: user.id
          }
        });
        
        if (response.data.data.hospitals && response.data.data.hospitals.length > 0) {
          const hospital = response.data.data.hospitals[0];
          setHospitalId(hospital._id);
          
          // Update the hospital profile with fetched data
          setHospitalProfile({
            name: hospital.name || '',
            email: hospital.email || '',
            phone: hospital.phone || '',
            address: hospital.address || {
              street: '',
              city: '',
              province: '',
              country: 'Rwanda'
            },
            location: hospital.location || {
              type: 'Point',
              coordinates: [30.0588, -1.9547] // Default to Kigali coordinates
            },
            website: hospital.website || '',
            description: hospital.description || '',
            founded: hospital.founded?.toString() || '',
            beds: hospital.beds?.toString() || '',
            logo: hospital.logo || '/images/default-hospital-logo.png',
            services: hospital.services || [],
            specialties: hospital.specialties || [],
            facilities: hospital.facilities || [],
            insurances: hospital.insurances || [],
            workingHours: hospital.workingHours || {
              monday: { open: '08:00', close: '17:00' },
              tuesday: { open: '08:00', close: '17:00' },
              wednesday: { open: '08:00', close: '17:00' },
              thursday: { open: '08:00', close: '17:00' },
              friday: { open: '08:00', close: '17:00' },
              saturday: { open: '09:00', close: '13:00' },
              sunday: { open: '', close: '' }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching hospital data:', error);
        setErrorMessage('Failed to load hospital data. Please try again.');
        // Fall back to default data if API fails
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      fetchHospitalData();
    }
  }, [isAuthenticated, user, token]);
  
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }
  
  // Sample security settings
  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
  });
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage('');
    setErrorMessage('');
    
    try {
      if (!hospitalId) {
        throw new Error('Hospital ID not found');
      }
      
      // Make API call to update hospital profile
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${hospitalId}`, 
        hospitalProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        // Update local state with the response data
        setHospitalProfile(response.data.data.hospital);
        setSavedMessage('Hospital settings updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSavedMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating hospital profile:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update settings. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Update hospital profile - handle nested objects
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties (e.g., address.street)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setHospitalProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setHospitalProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle services, specialties, and facilities (array fields)
  const handleArrayFieldChange = (field, value) => {
    // Convert comma-separated string to array
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
    
    setHospitalProfile(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };
  
  // Update notification settings
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Update security settings
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecurity(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  return (
    <MainLayout>
      <DashboardLayout title="Hospital Settings">
      <div className="space-y-6">
        {/* Messages */}
        {savedMessage && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{savedMessage}</span>
            </div>
            <button 
              onClick={() => setSavedMessage('')}
              className="text-green-700 hover:text-green-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage('')}
              className="text-red-700 hover:text-red-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainBlue"></div>
            <span className="ml-2 text-mainGray">Loading...</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Settings Tabs */}
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'profile' ? 'text-mainBlue border-b-2 border-mainBlue bg-blue-50' : 'text-mainGray hover:text-DarkBlue'}`}
            >
              Hospital Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-3 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'notifications' ? 'text-mainBlue border-b-2 border-mainBlue bg-blue-50' : 'text-mainGray hover:text-DarkBlue'}`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'security' ? 'text-mainBlue border-b-2 border-mainBlue bg-blue-50' : 'text-mainGray hover:text-DarkBlue'}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'users' ? 'text-mainBlue border-b-2 border-mainBlue bg-blue-50' : 'text-mainGray hover:text-DarkBlue'}`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-4 py-3 text-sm md:text-base font-medium whitespace-nowrap ${activeTab === 'integrations' ? 'text-mainBlue border-b-2 border-mainBlue bg-blue-50' : 'text-mainGray hover:text-DarkBlue'}`}
            >
              Integrations
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {/* Hospital Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-DarkBlue mb-2">Hospital Profile</h2>
                  <p className="text-mainGray text-sm">Update your hospital's profile information</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">Hospital Name</label>
                    <input
                      type="text"
                      name="name"
                      value={hospitalProfile.name}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={hospitalProfile.email}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={hospitalProfile.phone}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">Website</label>
                    <input
                      type="text"
                      name="website"
                      value={hospitalProfile.website}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={hospitalProfile.address}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={hospitalProfile.city}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={hospitalProfile.state}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-DarkBlue mb-1">ZIP/Postal Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={hospitalProfile.zip}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-DarkBlue mb-1">Hospital Description</label>
                    <textarea
                      name="description"
                      value={hospitalProfile.description}
                      onChange={handleProfileChange}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-mainBlue to-deepBlue text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            
            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-DarkBlue mb-2">Notification Settings</h2>
                  <p className="text-mainGray text-sm">Configure how and when you receive notifications</p>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-DarkBlue mb-3">Alert Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Email Alerts</p>
                          <p className="text-xs text-mainGray">Receive important notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emailAlerts"
                            checked={notifications.emailAlerts}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">SMS Alerts</p>
                          <p className="text-xs text-mainGray">Receive urgent notifications via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="smsAlerts"
                            checked={notifications.smsAlerts}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Appointment Reminders</p>
                          <p className="text-xs text-mainGray">Notifications about upcoming appointments</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="appointmentReminders"
                            checked={notifications.appointmentReminders}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">System Updates</p>
                          <p className="text-xs text-mainGray">Updates about the MediFind platform</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="systemUpdates"
                            checked={notifications.systemUpdates}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-DarkBlue mb-3">Report Subscriptions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Daily Reports</p>
                          <p className="text-xs text-mainGray">Receive daily operational reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="dailyReports"
                            checked={notifications.dailyReports}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Weekly Reports</p>
                          <p className="text-xs text-mainGray">Receive weekly summary reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="weeklyReports"
                            checked={notifications.weeklyReports}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Monthly Reports</p>
                          <p className="text-xs text-mainGray">Receive monthly performance reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="monthlyReports"
                            checked={notifications.monthlyReports}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-mainBlue to-deepBlue text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-DarkBlue mb-2">Security Settings</h2>
                  <p className="text-mainGray text-sm">Configure security settings for your hospital account</p>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-DarkBlue mb-3">Authentication Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Two-Factor Authentication</p>
                          <p className="text-xs text-mainGray">Require a security code in addition to password</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="twoFactorAuth"
                            checked={security.twoFactorAuth}
                            onChange={handleSecurityChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mainBlue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          name="sessionTimeout"
                          value={security.sessionTimeout}
                          onChange={handleSecurityChange}
                          min="5"
                          max="120"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                        />
                        <p className="text-xs text-mainGray mt-1">Automatically log out after inactivity</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Password Expiry (days)</label>
                        <input
                          type="number"
                          name="passwordExpiry"
                          value={security.passwordExpiry}
                          onChange={handleSecurityChange}
                          min="30"
                          max="365"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                        />
                        <p className="text-xs text-mainGray mt-1">Force password change after this many days</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Failed Login Attempts</label>
                        <input
                          type="number"
                          name="loginAttempts"
                          value={security.loginAttempts}
                          onChange={handleSecurityChange}
                          min="3"
                          max="10"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                        />
                        <p className="text-xs text-mainGray mt-1">Number of attempts before account is locked</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-mainBlue to-deepBlue text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            
            {/* User Management */}
            {activeTab === 'users' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-DarkBlue mb-2">User Management</h2>
                  <p className="text-mainGray text-sm">Manage staff accounts and access permissions</p>
                </div>
                
                <div className="text-center p-8">
                  <p className="text-mainGray">User management interface will be added in a future update.</p>
                </div>
              </div>
            )}
            
            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-DarkBlue mb-2">System Integrations</h2>
                  <p className="text-mainGray text-sm">Connect your MediFind system with other services</p>
                </div>
                
                <div className="text-center p-8">
                  <p className="text-mainGray">Integration settings will be available in a future update.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </DashboardLayout>
    </MainLayout>
  );
}
