'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function DoctorsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState(null);
  const [doctorToSchedule, setDoctorToSchedule] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [hospitalId, setHospitalId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  
  // State for image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // New doctor form state aligned with MongoDB schema
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'Cardiology',
    qualifications: [{ degree: '', institution: '', year: '' }],
    experience: 0,
    bio: '',
    languages: [''],
    availableDays: [{ day: 'monday', startTime: '', endTime: '', slots: 0 }],
    status: 'active',
    photo: '/images/default-avatar.png', // Using a local fallback image path
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    const fetchHospital = async() => {
      try {
        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        // First check if hospital ID is already in localStorage
        const storedHospitalId = localStorage.getItem('hospitalId');
        if (storedHospitalId) {
          console.log("Using stored hospital ID:", storedHospitalId);
          setHospitalId(storedHospitalId);
          return; // Use the existing ID
        }

        console.log("Fetching hospital with token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/specificHospital`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Handle different response formats
        let fetchedHospitalId;
        
        if (response.status === 200) {
          if (response.data.Hospital && response.data.Hospital.hospital) {
            fetchedHospitalId = response.data.Hospital.hospital._id;
          } else if (response.data.hospital && response.data.hospital._id) {
            fetchedHospitalId = response.data.hospital._id;
          } else if (response.data.data && response.data.data.hospital && response.data.data.hospital._id) {
            fetchedHospitalId = response.data.data.hospital._id;
          }
          
          if (fetchedHospitalId) {
            console.log("Hospital ID retrieved:", fetchedHospitalId);
            setHospitalId(fetchedHospitalId);
            localStorage.setItem('hospitalId', fetchedHospitalId);
          } else {
            console.error("Could not extract hospital ID from response:", response.data);
            setError("Failed to extract hospital ID from response");
          }
        } else {
          console.error("Unexpected hospital data format:", response.data);
          setError("Failed to process hospital data");
        }
      } catch (error) {
        console.error("Hospital fetch error:", error.response?.data || error.message);
        setError(error.response?.data?.message || "Failed to fetch hospital data");
        
        // Try to get hospital ID from user data as fallback
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            const userData = JSON.parse(userInfo);
            
            // Try to extract hospital ID from user data if available
            if (userData.hospital && typeof userData.hospital === 'string') {
              console.log("Using hospital ID from user data:", userData.hospital);
              setHospitalId(userData.hospital);
              localStorage.setItem('hospitalId', userData.hospital);
            } else if (userData.hospital && userData.hospital._id) {
              console.log("Using hospital ID from user data object:", userData.hospital._id);
              setHospitalId(userData.hospital._id);
              localStorage.setItem('hospitalId', userData.hospital._id);
            }
          } catch (parseError) {
            console.error("Error parsing user info:", parseError);
          }
        }
      }
    };
    
    fetchHospital()
  }, [])

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("authToken");
        setError(null); // Clear previous errors

        const currentHospitalId = hospitalId || localStorage.getItem('hospitalId');
        
        if (!currentHospitalId) {
          console.log('No hospital ID available');
          return; // Exit early if no hospital ID available
        }

        console.log(`Fetching doctors for hospital ${currentHospitalId}`);
        // Using environment variable for backend URL
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${currentHospitalId}/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error('Failed to fetch doctors');
        }

        const doctorsData = response.data?.data?.doctors || [];
        console.log('Doctors data:', doctorsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error.response?.data || error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch doctors');
      }
    };

    fetchDoctors();
  }, [hospitalId]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for email to ensure proper format
    if (name === 'email') {
      // Remove any spaces that might be entered
      const cleanedEmail = value.trim();
      setNewDoctor({
        ...newDoctor,
        [name]: cleanedEmail,
      });
    } else {
      setNewDoctor({
        ...newDoctor,
        [name]: value,
      });
    }
  };
  
  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image drop
  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Prevent default for drag events
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleQualificationChange = (index, field, value) => {
    const updatedQualifications = [...newDoctor.qualifications];
    updatedQualifications[index][field] = value;
    setNewDoctor({
      ...newDoctor,
      qualifications: updatedQualifications,
    });
  };

  const addQualification = () => {
    setNewDoctor({
      ...newDoctor,
      qualifications: [...newDoctor.qualifications, { degree: '', institution: '', year: '' }],
    });
  };

  const handleLanguageChange = (index, value) => {
    const updatedLanguages = [...newDoctor.languages];
    updatedLanguages[index] = value;
    setNewDoctor({
      ...newDoctor,
      languages: updatedLanguages,
    });
  };

  const addLanguage = () => {
    setNewDoctor({
      ...newDoctor,
      languages: [...newDoctor.languages, ''],
    });
  };

  const handleAvailableDayChange = (index, field, value) => {
    const updatedDays = [...newDoctor.availableDays];
    updatedDays[index][field] = value;
    setNewDoctor({
      ...newDoctor,
      availableDays: updatedDays,
    });
  };

  const addAvailableDay = () => {
    setNewDoctor({
      ...newDoctor,
      availableDays: [...newDoctor.availableDays, { day: 'monday', startTime: '', endTime: '', slots: 0 }],
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      let finalPhoto = newDoctor.photo;

      // Upload image if one was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        // Using a more generic preset name that's likely to exist
        formData.append('upload_preset', 'ml_default');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dsp6s9hxe/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();
        console.log('Cloudinary upload response:', data);
        if (data.secure_url) {
          finalPhoto = data.secure_url;
        }
      }

      // Prepare the doctor data with the image URL
      const doctorWithPhoto = {
        ...newDoctor,
        photo: finalPhoto,
      };

      console.log('Submitting doctor data:', doctorWithPhoto);
      
      // Get hospital ID from state or localStorage
      const currentHospitalId = hospitalId || localStorage.getItem('hospitalId');
      console.log('Hospital ID for submission:', currentHospitalId);
      
      // Validation - don't proceed if no hospital ID
      if (!currentHospitalId) {
        throw new Error('No hospital ID available. Please try reloading the page or logging in again.');
      }

      // Make the API call to create the doctor using environment variable for backend URL
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${currentHospitalId}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(doctorWithPhoto),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(result.message || 'Failed to add doctor');
      }

      console.log('Doctor added successfully:', result);

      // Reset form and close modal
      setNewDoctor({
        name: '',
        email: '',
        phone: '',
        specialty: 'Cardiology',
        qualifications: [{ degree: '', institution: '', year: '' }],
        experience: 0,
        bio: '',
        languages: [''],
        availableDays: [{ day: 'monday', startTime: '', endTime: '', slots: 0 }],
        status: 'active',
        photo: '/images/default-avatar.png',
      });
      setImageFile(null);
      setImagePreview(null);
      setShowAddDoctorModal(false);
      
      // Refresh doctors list
      // Use the existing fetchDoctors function that's defined in this component
      // or manually refetch the doctors here to avoid the reference error
      try {
        const token = localStorage.getItem("authToken");
        const currentHospitalId = hospitalId || localStorage.getItem('hospitalId');
        
        if (currentHospitalId) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${currentHospitalId}/doctors`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.status === 200) {
            const doctorsData = response.data?.data?.doctors || [];
            setDoctors(doctorsData);
            console.log('Doctors refreshed after adding new doctor');
          }
        }
      } catch (fetchError) {
        console.error('Error refreshing doctors list:', fetchError);
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle updating a doctor's profile
  const handleUpdateDoctor = async (e, doctorId) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      console.log('Updating doctor data:', doctorToEdit);
      console.log('Doctor ID:', doctorId);

      // Get current hospitalId from state or localStorage
      const currentHospitalId = hospitalId || localStorage.getItem('hospitalId');
      if (!currentHospitalId) {
        throw new Error('Hospital ID not found. Please refresh the page or login again.');
      }
      
      // Make the API call to update the doctor using hospital-specific endpoint
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${currentHospitalId}/doctors/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(doctorToEdit),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(result.message || 'Failed to update doctor');
      }

      console.log('Doctor updated successfully:', result);

      // Close modal and refresh doctors list
      setShowEditDoctorModal(false);
      setDoctorToEdit(null);
      fetchDoctors();

      // Show success message
      alert('Doctor profile updated successfully');
    } catch (error) {
      console.error('Error updating doctor:', error);
      setError(error.message);
      alert(`Error updating doctor: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle updating a doctor's schedule
  const handleUpdateSchedule = async (e, doctorId) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      console.log('Updating doctor schedule:', doctorToSchedule.availableDays);
      console.log('Doctor ID:', doctorId);

      // Get current hospitalId from state or localStorage
      const currentHospitalId = hospitalId || localStorage.getItem('hospitalId');
      if (!currentHospitalId) {
        throw new Error('Hospital ID not found. Please refresh the page or login again.');
      }
      
      // Make the API call to update the doctor's schedule using hospital-specific endpoint
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${currentHospitalId}/doctors/${doctorId}/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ availableDays: doctorToSchedule.availableDays }),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(result.message || 'Failed to update schedule');
      }

      console.log('Schedule updated successfully:', result);

      // Close modal and refresh doctors list
      setShowScheduleModal(false);
      setDoctorToSchedule(null);
      fetchDoctors();

      // Show success message
      alert('Doctor schedule updated successfully');
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError(error.message);
      alert(`Error updating schedule: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle deleting a doctor
  const handleDeleteDoctor = async (doctorId) => {
    setIsDeleting(true);
    setError(null);

    try {
      console.log('Deleting doctor:', doctorId);

      // Get current hospitalId from state or localStorage
      const currentHospitalId = hospitalId || localStorage.getItem('hospitalId');
      if (!currentHospitalId) {
        throw new Error('Hospital ID not found. Please refresh the page or login again.');
      }
      
      // Make the API call to delete the doctor using hospital-specific endpoint
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${currentHospitalId}/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Failed to delete doctor');
      }

      console.log('Doctor deleted successfully');

      // Close confirmation modal and refresh doctors list
      setShowDeleteConfirmation(false);
      setDoctorToDelete(null);
      fetchDoctors();

      // Show success message
      alert('Doctor deleted successfully');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setError(error.message);
      alert(`Error deleting doctor: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // List of specialties for filtering
  const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Ophthalmology'];

  // Filter doctors based on search term, specialty filter, and active tab
  const filteredDoctors = (doctors || []).filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty = filterSpecialty === 'all' || doctor.specialty === filterSpecialty;

    const matchesTab =
      (activeTab === 'active' && doctor.status === 'active') ||
      (activeTab === 'on_leave' && doctor.status === 'on_leave') ||
      activeTab === 'all';

    return matchesSearch && matchesSpecialty && matchesTab;
  });

  // Function to render the weekly schedule
  const renderSchedule = (availableDays) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="grid grid-cols-7 gap-1 mt-2">
        {days.map((day, index) => {
          const dayData = availableDays.find((d) => d.day === day);
          return (
            <div key={day} className="flex flex-col items-center">
              <span className="text-xs font-medium text-mainGray mb-1">{dayLabels[index]}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  dayData && dayData.slots > 0 ? 'bg-mainBlue/10 text-mainBlue' : 'bg-gray-100 text-mainGray'
                }`}
              >
                {dayData && dayData.slots > 0 ? dayData.slots : '-'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout title="Doctors Management">
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-medium">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-DarkBlue">Doctors</h2>
            <p className="text-mainGray">Manage doctor profiles, schedules, and assignments</p>
          </div>
          <button
            onClick={() => setShowAddDoctorModal(true)}
            className="bg-gradient-to-r from-mainBlue to-deepBlue text-white px-4 py-2 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Doctor
          </button>
        </div>

        {/* Filters and tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
            {/* Tabs */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                All Doctors
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'active' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('on_leave')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'on_leave' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                On Leave
              </button>
            </div>

            {/* Search and filter */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  className="bg-whiteGray py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mainBlue/50 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="w-5 h-5 text-mainGray absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                className="bg-whiteGray py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="all">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <img
                        src={doctor.photo && doctor.photo !== 'default-doctor.jpg' ? doctor.photo : '/images/default-avatar.png'}
                        alt={doctor.name}
                        className="h-16 w-16 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-avatar.png';
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-DarkBlue">{doctor.name}</h3>
                        <p className="text-mainBlue">{doctor.specialty}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500 mr-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                          <span className="text-xs text-mainGray">
                            {(doctor.rating || 0).toFixed(1)} • {doctor.experience || 0} years
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-mainGray">Languages</p>
                        <p className="font-medium text-DarkBlue">{doctor.languages.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Qualifications</p>
                        <p className="font-medium text-DarkBlue">
                          {doctor.qualifications.map((q) => q.degree).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-mainGray mb-1">Status</p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          doctor.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : doctor.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-6 flex justify-between">
                      <button
                        className="text-mainBlue hover:text-deepBlue text-sm font-medium transition-colors"
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        View Profile
                      </button>
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 text-mainBlue hover:bg-mainBlue/10 rounded" 
                          title="Edit"
                          onClick={() => {
                            setDoctorToEdit(doctor);
                            setShowEditDoctorModal(true);
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 text-mainGray hover:bg-mainBlue/10 rounded" 
                          title="Schedule"
                          onClick={() => {
                            setDoctorToSchedule(doctor);
                            setShowScheduleModal(true);
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 text-red-400 hover:bg-red-50 rounded"
                          title="Delete"
                          onClick={() => {
                            setDoctorToDelete(doctor);
                            setShowDeleteConfirmation(true);
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 text-center text-mainGray">
                No doctors found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-mainGray">Showing {filteredDoctors.length} of {doctors.length} doctors</p>
            <div className="flex space-x-1">
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">Previous</button>
              <button className="px-3 py-1 rounded-md bg-mainBlue/10 text-mainBlue font-medium">1</button>
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">2</button>
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Doctor Profile</h3>
              <button
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setSelectedDoctor(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Doctor Info */}
                <div className="w-full md:w-1/3">
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedDoctor.photo && selectedDoctor.photo !== 'default-doctor.jpg' ? selectedDoctor.photo : '/images/default-avatar.png'}
                      alt={selectedDoctor.name}
                      className="h-32 w-32 rounded-full object-cover mb-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-avatar.png';
                      }}
                    />
                    <h4 className="text-xl font-semibold text-DarkBlue text-center">{selectedDoctor.name}</h4>
                    <p className="text-mainBlue font-medium">{selectedDoctor.specialty}</p>
                    <p className="text-sm text-mainGray mt-1">
                      {selectedDoctor.qualifications.map((q) => q.degree).join(', ')}
                    </p>

                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500 mr-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                      <span className="text-sm text-DarkBlue font-medium">{(selectedDoctor.rating || 0).toFixed(1)}</span>
                    </div>

                    <div className="mt-4 w-full">
                      <span
                        className={`px-3 py-1 text-sm rounded-full w-full block text-center ${
                          selectedDoctor.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : selectedDoctor.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedDoctor.status.charAt(0).toUpperCase() + selectedDoctor.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-6 space-y-4 w-full">
                      <div>
                        <p className="text-xs text-mainGray mb-1">Phone</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedDoctor.phone}</p>
                      </div>

                      <div>
                        <p className="text-xs text-mainGray mb-1">Email</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedDoctor.email}</p>
                      </div>

                      <div>
                        <p className="text-xs text-mainGray mb-1">Experience</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedDoctor.experience} years</p>
                      </div>

                      <div>
                        <p className="text-xs text-mainGray mb-1">Languages</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedDoctor.languages.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="w-full md:w-2/3 space-y-6">
                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">About</h5>
                    <p className="text-sm text-mainGray">{selectedDoctor.bio || 'No bio available'}</p>
                  </div>

                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Weekly Schedule</h5>
                    <p className="text-xs text-mainGray mb-2">Available time slots per day</p>
                    {renderSchedule(selectedDoctor.availableDays)}

                    <div className="mt-4 space-y-2">
                      {selectedDoctor.availableDays.map((slot, index) => (
                        <div key={index} className="flex">
                          <span className="text-xs font-medium text-DarkBlue capitalize w-20">{slot.day}:</span>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-mainBlue/10 text-mainBlue px-2 py-1 rounded-full">
                              {slot.startTime} - {slot.endTime} ({slot.slots} slots)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Qualifications</h5>
                    <div className="space-y-2">
                      {selectedDoctor.qualifications.map((qual, index) => (
                        <div key={index} className="p-3 bg-whiteGray rounded-lg">
                          <p className="text-sm font-medium text-DarkBlue">{qual.degree}</p>
                          <p className="text-xs text-mainGray">{qual.institution} ({qual.year})</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Reviews</h5>
                    <div className="space-y-2">
                      {selectedDoctor.reviews && selectedDoctor.reviews.length > 0 ? (
                        selectedDoctor.reviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="p-3 bg-whiteGray rounded-lg">
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <svg key={i} className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </span>
                              <span className="text-xs text-mainGray">{review.createdAt.toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-DarkBlue mt-1">{review.review}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-mainGray">No reviews available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  onClick={() => setSelectedDoctor(null)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-deepBlue transition-colors"
                  onClick={() => {
                    setDoctorToEdit(selectedDoctor);
                    setShowEditDoctorModal(true);
                    setSelectedDoctor(null);
                  }}
                >
                  Edit Profile
                </button>
                <button 
                  className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-deepBlue transition-colors"
                  onClick={() => {
                    setDoctorToSchedule(selectedDoctor);
                    setShowScheduleModal(true);
                    setSelectedDoctor(null);
                  }}
                >
                  Manage Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {/* Edit Doctor Modal */}
      {showEditDoctorModal && doctorToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Edit Doctor: {doctorToEdit.name}</h3>
              <button
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setShowEditDoctorModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => handleUpdateDoctor(e, doctorToEdit._id)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={doctorToEdit.name}
                        onChange={(e) => setDoctorToEdit({...doctorToEdit, name: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={doctorToEdit.email}
                        onChange={(e) => setDoctorToEdit({...doctorToEdit, email: e.target.value.trim()})}
                        required
                        title="Please enter a valid email address (e.g., doctor@example.com)"
                        placeholder="doctor@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={doctorToEdit.phone}
                        onChange={(e) => setDoctorToEdit({...doctorToEdit, phone: e.target.value})}
                        required
                        placeholder="+250 7XX XXX XXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={doctorToEdit.status}
                        onChange={(e) => setDoctorToEdit({...doctorToEdit, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Specialty <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="specialty"
                        value={doctorToEdit.specialty}
                        onChange={(e) => setDoctorToEdit({...doctorToEdit, specialty: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      >
                        {specialties.map((specialty) => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Experience (Years) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={doctorToEdit.experience}
                        onChange={(e) => setDoctorToEdit({...doctorToEdit, experience: e.target.value})}
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Biography</h4>
                  <div>
                    <label className="block text-sm font-medium text-mainGray mb-1">Professional Bio</label>
                    <textarea
                      name="bio"
                      value={doctorToEdit.bio}
                      onChange={(e) => setDoctorToEdit({...doctorToEdit, bio: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      placeholder="Enter doctor's professional biography, specializations, and achievements..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditDoctorModal(false)}
                  className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors flex items-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && doctorToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-DarkBlue">Confirm Deletion</h3>
            </div>

            <div className="p-6">
              <p className="text-mainGray mb-4">
                Are you sure you want to delete Dr. {doctorToDelete.name}? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDoctor(doctorToDelete._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Doctor'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Management Modal */}
      {showScheduleModal && doctorToSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Manage Schedule: {doctorToSchedule.name}</h3>
              <button
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setShowScheduleModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => handleUpdateSchedule(e, doctorToSchedule._id)} className="p-6">
              <div className="space-y-6">
                <h4 className="font-medium text-DarkBlue">Available Days</h4>
                
                {doctorToSchedule.availableDays && doctorToSchedule.availableDays.map((day, index) => (
                  <div key={index} className="bg-whiteGray p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Day</label>
                        <select
                          value={day.day}
                          onChange={(e) => {
                            const updatedDays = [...doctorToSchedule.availableDays];
                            updatedDays[index].day = e.target.value;
                            setDoctorToSchedule({...doctorToSchedule, availableDays: updatedDays});
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => (
                            <option key={d} value={d}>
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Start Time</label>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => {
                            const updatedDays = [...doctorToSchedule.availableDays];
                            updatedDays[index].startTime = e.target.value;
                            setDoctorToSchedule({...doctorToSchedule, availableDays: updatedDays});
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">End Time</label>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => {
                            const updatedDays = [...doctorToSchedule.availableDays];
                            updatedDays[index].endTime = e.target.value;
                            setDoctorToSchedule({...doctorToSchedule, availableDays: updatedDays});
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Slots</label>
                        <input
                          type="number"
                          value={day.slots}
                          onChange={(e) => {
                            const updatedDays = [...doctorToSchedule.availableDays];
                            updatedDays[index].slots = e.target.value;
                            setDoctorToSchedule({...doctorToSchedule, availableDays: updatedDays});
                          }}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => {
                          const updatedDays = doctorToSchedule.availableDays.filter((_, i) => i !== index);
                          setDoctorToSchedule({...doctorToSchedule, availableDays: updatedDays});
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    const updatedDays = [...doctorToSchedule.availableDays, 
                      { day: 'monday', startTime: '', endTime: '', slots: 0 }
                    ];
                    setDoctorToSchedule({...doctorToSchedule, availableDays: updatedDays});
                  }}
                  className="text-mainBlue hover:text-deepBlue text-sm font-medium"
                >
                  + Add Another Day
                </button>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors flex items-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Save Schedule'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Add New Doctor</h3>
              <button
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setShowAddDoctorModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newDoctor.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newDoctor.email}
                        onChange={handleInputChange}
                        required
                        
                        title="Please enter a valid email address (e.g., doctor@example.com)"
                        placeholder="doctor@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newDoctor.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+250 7XX XXX XXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Specialty <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="specialty"
                        value={newDoctor.specialty}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      >
                        {specialties.map((specialty) => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">
                        Experience (Years) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={newDoctor.experience}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Status</label>
                      <select
                        name="status"
                        value={newDoctor.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Qualifications</h4>
                  {newDoctor.qualifications.map((qual, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Degree</label>
                        <input
                          type="text"
                          value={qual.degree}
                          onChange={(e) => handleQualificationChange(index, 'degree', e.target.value)}
                          placeholder="e.g. MBBS"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Institution</label>
                        <input
                          type="text"
                          value={qual.institution}
                          onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
                          placeholder="e.g. Harvard Medical School"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Year</label>
                        <input
                          type="number"
                          value={qual.year}
                          onChange={(e) => handleQualificationChange(index, 'year', e.target.value)}
                          placeholder="e.g. 2015"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addQualification}
                    className="text-mainBlue hover:text-deepBlue text-sm font-medium"
                  >
                    + Add Another Qualification
                  </button>
                </div>

                {/* Languages */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Languages</h4>
                  {newDoctor.languages.map((lang, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-mainGray mb-1">Language</label>
                      <input
                        type="text"
                        value={lang}
                        onChange={(e) => handleLanguageChange(index, e.target.value)}
                        placeholder="e.g. English"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="text-mainBlue hover:text-deepBlue text-sm font-medium"
                  >
                    + Add Another Language
                  </button>
                </div>

                {/* Available Days */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Available Days</h4>
                  {newDoctor.availableDays.map((slot, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Day</label>
                        <select
                          value={slot.day}
                          onChange={(e) => handleAvailableDayChange(index, 'day', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <option key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Start Time</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleAvailableDayChange(index, 'startTime', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">End Time</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleAvailableDayChange(index, 'endTime', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Slots</label>
                        <input
                          type="number"
                          value={slot.slots}
                          onChange={(e) => handleAvailableDayChange(index, 'slots', e.target.value)}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAvailableDay}
                    className="text-mainBlue hover:text-deepBlue text-sm font-medium"
                  >
                    + Add Another Day
                  </button>
                </div>

                {/* Profile Photo */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Profile Photo</h4>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-mainBlue/50 transition-colors"
                    onDragOver={preventDefaults}
                    onDragEnter={preventDefaults}
                    onDragLeave={preventDefaults}
                    onDrop={handleImageDrop}
                  >
                    <div className="flex flex-col items-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img 
                            src={imagePreview} 
                            alt="Doctor preview" 
                            className="w-32 h-32 object-cover rounded-full shadow-md"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <label className="flex flex-col items-center cursor-pointer">
                        <span className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors text-sm">
                          {imagePreview ? 'Change Photo' : 'Upload Photo'}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                          className="hidden"
                        />
                        <p className="text-xs text-mainGray mt-2">Drag & drop or click to select (max 5MB)</p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Biography</h4>
                  <div>
                    <label className="block text-sm font-medium text-mainGray mb-1">Professional Bio</label>
                    <textarea
                      name="bio"
                      value={newDoctor.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      placeholder="Enter doctor's professional biography, specializations, and achievements..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors flex items-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Add Doctor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
