"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Nav from "../nav/page";
import Footer from "../homepage/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendar, 
  faClock, 
  faUserMd, 
  faHospital, 
  faPhone, 
  faLock,
  faExclamationTriangle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const AppointmentsPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Define the API base URL from environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

  // Form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [notificationType, setNotificationType] = useState("email");
  
  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Data state
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  // Loading states
  const [hospitalsFetching, setHospitalsFetching] = useState(true);
  const [doctorsFetching, setDoctorsFetching] = useState(false);
  const [timesFetching, setTimesFetching] = useState(false);
  
  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setGender(user.gender || "");
      setAge(user.age?.toString() || "");
    }
  }, [isAuthenticated, user]);
  
  // Fetch hospitals from the database
  // Fetch hospitals from the database
useEffect(() => {
  const fetchHospitals = async () => {
    setHospitalsFetching(true);
    try {
      const token = localStorage.getItem('mediToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/api/hospitals`, {
        headers,
        params: { status: 'active' }
      });
      
      console.log('Hospital Response:', response);
      
      // Handle the multi-level nested structure we're seeing in the response
      let extractedHospitals = [];
      
      if (response.data && response.data.hospitals && response.data.hospitals.hospitals && 
          Array.isArray(response.data.hospitals.hospitals)) {
        // Handle the specific nested structure seen in the console log
        extractedHospitals = response.data.hospitals.hospitals;
      } else if (response.data && response.data.hospitals && Array.isArray(response.data.hospitals)) {
        // Handle standard structure with one level of nesting
        extractedHospitals = response.data.hospitals;
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where hospitals are directly in data array
        extractedHospitals = response.data;
      } else {
        // Try to find hospitals data in any structure
        const findHospitalsArray = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          
          // Check if current object has a hospitals property that's an array
          for (const key in obj) {
            if (key === 'hospitals' && Array.isArray(obj[key])) {
              return obj[key];
            } else if (typeof obj[key] === 'object') {
              // Recursively check nested objects
              const found = findHospitalsArray(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };
        
        const foundHospitals = findHospitalsArray(response.data);
        if (foundHospitals) {
          extractedHospitals = foundHospitals;
        }
      }
      
      if (extractedHospitals.length > 0) {
        setHospitals(extractedHospitals);
      } else {
        console.warn('Could not find hospitals array in response:', response.data);
        setHospitals([]);
        setErrorMessage("No hospitals found or unexpected data format. Please try again later.");
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setErrorMessage(`Failed to load hospitals: ${error.response?.data?.message || error.message}`);
      setHospitals([]);
    } finally {
      setHospitalsFetching(false);
    }
  };
  
  fetchHospitals();
}, []);
  
  // Fetch doctors when hospital is selected
  useEffect(() => {
    if (!selectedHospital) {
      setDoctors([]);
      setSelectedDoctor('');
      return;
    }
    
    const fetchDoctors = async () => {
      setDoctorsFetching(true);
      try {
        const token = localStorage.getItem('mediToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_BASE_URL}/api/doctors`, {
          headers,
          params: { hospital: selectedHospital, status: 'active' }
        });
        
        // Handle different API response structures
        if (response.data && response.data.data && response.data.data.doctors) {
          setDoctors(response.data.data.doctors);
        } else if (response.data && Array.isArray(response.data)) {
          setDoctors(response.data);
        } else if (response.data && Array.isArray(response.data.doctors)) {
          setDoctors(response.data.doctors);
        } else {
          console.warn('Unexpected doctor data format:', response.data);
          setDoctors([]);
          setErrorMessage("Error in doctor data format. Please contact support.");
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setErrorMessage(`Failed to load doctors: ${error.response?.data?.message || error.message}`);
        setDoctors([
          { _id: "1", name: "Dr. Jean Pierre Habimana", specialty: "General Medicine", hospital: selectedHospital },
          { _id: "2", name: "Dr. Eric Mugabo", specialty: "Cardiology", hospital: selectedHospital },
          { _id: "3", name: "Dr. Claire Uwimana", specialty: "Pediatrics", hospital: selectedHospital }
        ]);
      } finally {
        setDoctorsFetching(false);
      }
    };
    
    fetchDoctors();
  }, [selectedHospital, process.env.NEXT_PUBLIC_BACKEND_URL]);
  
  // Fetch available times when doctor and date are selected
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setAvailableTimes([]);
      return;
    }
    
    const fetchAvailableTimes = async () => {
      setTimesFetching(true);
      try {
        const token = localStorage.getItem('mediToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_BASE_URL}/api/appointments/available-times`, {
          headers,
          params: {
            doctor: selectedDoctor,
            date: selectedDate,
            hospital: selectedHospital
          }
        });

        // Handle different API response structures
        if (response.data && response.data.data && response.data.data.availableTimes) {
          setAvailableTimes(response.data.data.availableTimes);
        } else if (response.data && Array.isArray(response.data)) {
          setAvailableTimes(response.data);
        } else if (response.data && Array.isArray(response.data.availableTimes)) {
          setAvailableTimes(response.data.availableTimes);
        } else {
          console.warn('Unexpected time slots data format:', response.data);
          setAvailableTimes([]);
          setErrorMessage("Error in time slot data format. Please contact support.");
        }
      } catch (error) {
        console.error('Error fetching available times:', error);
        setErrorMessage(`Failed to load time slots: ${error.response?.data?.message || error.message}`);
        setAvailableTimes(
         [
              "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
              "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
              "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
          
        ]);
      } finally {
        setTimesFetching(false);
      }
    };
    
    fetchAvailableTimes();
  }, [selectedDoctor, selectedDate, selectedHospital, process.env.NEXT_PUBLIC_BACKEND_URL]);
  
  const handleAppointment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Form validation
    let missingFields = [];
    if (!selectedHospital) missingFields.push('hospital');
    if (!selectedDoctor) missingFields.push('doctor');
    if (!selectedDate) missingFields.push('date');
    if (!selectedTime) missingFields.push('time');
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!reason) missingFields.push('reason for visit');
    if (!gender) missingFields.push('gender');
    if (!age) missingFields.push('age');
    
    if (missingFields.length > 0) {
      const missingFieldsText = missingFields.join(', ');
      setErrorMessage(`Please complete the following required fields: ${missingFieldsText}`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('mediToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Convert symptoms from comma-separated string to array
      const symptomsArray = symptoms ? symptoms.split(',').map(s => s.trim()).filter(s => s) : [];

      const appointmentData = {
        patient: {
          name,
          email,
          phone,
          age: parseInt(age, 10),
          gender
        },
        doctor: selectedDoctor,
        hospital: selectedHospital,
        date: new Date(selectedDate).toISOString(),
        time: selectedTime,
        reason,
        symptoms: symptomsArray,
        isRecurring: isRecurring,
        status: 'Pending',
        notifications: [
          {
            type: notificationType,
            status: 'pending'
          }
        ]
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/api/appointments`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        // Reset form fields
        setSelectedHospital('');
        setSelectedDoctor('');
        setSelectedDate('');
        setSelectedTime('');
        setReason('');
        setSymptoms('');
        setIsRecurring(false);
        setNotificationType('email');
        
        setSuccessMessage('Your appointment has been booked successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          router.push('/my-appointments');
        }, 3000);
      } else {
        setErrorMessage(response.data.message || 'Failed to book appointment');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        'An error occurred while booking your appointment'
      );
      setTimeout(() => setErrorMessage(''), 5000);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoginRedirect = () => {
    router.push(`/login?redirect=${encodeURIComponent('/appointments')}`);
  };

  // Render the hospital cards more simply
  const renderHospitalCard = (hospital) => {
    return (
      <div 
        key={hospital._id}
        onClick={() => setSelectedHospital(hospital._id)}
        className={`cursor-pointer border rounded-lg overflow-hidden transition-all duration-200 flex items-center p-4 ${
          selectedHospital === hospital._id 
            ? 'border-mainBlue ring-2 ring-mainBlue bg-blue-50' 
            : 'border-gray-200 hover:border-mainBlue'
        }`}
      >
        <div className="flex-grow">
          <h4 className={`font-medium ${selectedHospital === hospital._id ? 'text-mainBlue' : 'text-gray-800'}`}>
            {hospital.name}
          </h4>
          <p className="text-sm text-gray-500">{hospital.address?.city || 'Kigali'}</p>
        </div>
        {selectedHospital === hospital._id && (
          <div className="w-5 h-5 rounded-full bg-mainBlue text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-mainWhite">
      <Nav />
      
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-DarkBlue mb-8 text-center">
          Book an Appointment
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Appointment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-DarkBlue mb-6">Appointment Details</h2>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Your Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Age <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="0"
                    max="120"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Hospital selection - Simplified Design */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Select Hospital <span className="text-red-500">*</span>
                </label>
                
                {hospitalsFetching ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainBlue"></div>
                  </div>
                ) : hospitals.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    {hospitals.map(hospital => renderHospitalCard(hospital))}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600">No hospitals found. Please try again later.</p>
                  </div>
                )}
              </div>
              
              {/* Doctor Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="doctor">
                  Select Doctor <span className="text-red-500">*</span>
                </label>
                <div className={`relative ${!selectedHospital ? 'opacity-50' : ''}`}>
                  {!selectedHospital && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10 rounded-lg pointer-events-none">
                      <p className="text-gray-500 font-medium">Please select a hospital first</p>
                    </div>
                  )}
                  
                  {doctorsFetching ? (
                    <div className="flex justify-center items-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mainBlue"></div>
                    </div>
                  ) : (
                    <select
                      id="doctor"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue bg-white"
                      value={selectedDoctor}
                      onChange={(e) => {
                        setSelectedDoctor(e.target.value);
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      required
                      disabled={!selectedHospital}
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {doctors.length === 0 && selectedHospital && !doctorsFetching && (
                    <p className="mt-2 text-amber-600 text-sm">No doctors available for this hospital</p>
                  )}
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="date">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <div className={`relative ${!selectedDoctor ? 'opacity-50' : ''}`}>
                  {!selectedDoctor && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10 rounded-lg pointer-events-none">
                      <p className="text-gray-500 font-medium">Please select a doctor first</p>
                    </div>
                  )}
                  <input
                    id="date"
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue bg-white"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={!selectedDoctor}
                  />
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="time">
                  Select Time <span className="text-red-500">*</span>
                </label>
                <div className={`relative ${!selectedDate ? 'opacity-50' : ''}`}>
                  {!selectedDate && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10 rounded-lg pointer-events-none">
                      <p className="text-gray-500 font-medium">Please select a date first</p>
                    </div>
                  )}
                  
                  {timesFetching ? (
                    <div className="flex justify-center items-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mainBlue"></div>
                    </div>
                  ) : (
                    <select
                      id="time"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue bg-white"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      disabled={!selectedDate}
                    >
                      <option value="">Select a time slot</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  )}
                  
                  {selectedDate && availableTimes.length === 0 && !timesFetching && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                      <p className="font-medium">No available time slots</p>
                      <p>Please select a different date or try another doctor.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Reason for Visit */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="reason">
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <select
                  id="reason"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Check-up">Check-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              
              {/* Symptoms */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="symptoms">
                  Symptoms
                </label>
                <textarea
                  id="symptoms"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue min-h-[80px] resize-y"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Enter your symptoms separated by commas (e.g. fever, headache, cough)"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">List any symptoms you're experiencing. Separate multiple symptoms with commas.</p>
              </div>
              
              {/* Recurring appointment */}
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="isRecurring"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 text-mainBlue focus:ring-mainBlue border-gray-300 rounded"
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-gray-700 text-sm font-semibold">
                    This is a recurring appointment
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">Check this if you need to schedule regular follow-ups</p>
              </div>
              
              {/* Notification Type */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Notification Preference</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="notification-email"
                      type="radio"
                      checked={notificationType === "email"}
                      onChange={() => setNotificationType("email")}
                      className="h-4 w-4 text-mainBlue focus:ring-mainBlue border-gray-300"
                    />
                    <label htmlFor="notification-email" className="ml-2 block text-gray-700 text-sm">
                      Email
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="notification-sms"
                      type="radio"
                      checked={notificationType === "sms"}
                      onChange={() => setNotificationType("sms")}
                      className="h-4 w-4 text-mainBlue focus:ring-mainBlue border-gray-300"
                    />
                    <label htmlFor="notification-sms" className="ml-2 block text-gray-700 text-sm">
                      SMS
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">How would you like to receive notifications about your appointment?</p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Book Appointment Button */}
              <button
                type="submit"
                onClick={handleAppointment}
                className="w-full bg-gradient-to-tr from-mainBlue to-deepBlue text-white py-3 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !selectedDate || !selectedTime || !selectedDoctor || !selectedHospital || !name || !email || !phone || !gender || !age || !reason}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Book Appointment'
                )}
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-DarkBlue mb-6">How It Works</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={faHospital} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Select Hospital</h3>
                  <p className="text-gray-600">Choose your preferred hospital from our network.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={faUserMd} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Select Doctor</h3>
                  <p className="text-gray-600">Choose from our network of qualified healthcare professionals.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={faCalendar} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Choose Date</h3>
                  <p className="text-gray-600">Select your preferred appointment date from available options.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={faClock} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Pick Time Slot</h3>
                  <p className="text-gray-600">Choose an available time slot that works for you.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={faPhone} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Receive Confirmation</h3>
                  <p className="text-gray-600">Get confirmation and reminders for your appointment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faLock} className="text-deepBlue text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Login Required</h3>
              <p className="text-gray-600 mt-2">You need to be logged in to book an appointment with our healthcare providers.</p>
            </div>
            
            <div className="space-y-4 mt-6">
              <p className="text-sm text-gray-500 mb-2">By logging in, you can:</p>
              <ul className="text-sm text-gray-700 list-disc pl-5 mb-4 space-y-1">
                <li>Book appointments with your preferred doctors</li>
                <li>Track your appointment history</li>
                <li>Receive appointment confirmations</li>
                <li>Manage your health profile</li>
              </ul>
              
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-mainBlue to-deepBlue text-white py-3 rounded-lg font-medium hover:shadow-md transition-all flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Log In Now
              </button>
              
              <Link href="/signup" className="block">
                <button className="w-full border-2 border-mainBlue text-mainBlue py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  Create a New Account
                </button>
              </Link>
              
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;