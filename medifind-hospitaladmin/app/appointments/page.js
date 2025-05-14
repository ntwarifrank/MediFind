'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// API base URL constant
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

export default function AppointmentsPage() {
  const { token, user } = useAuth();
  
  // State declarations
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  
  // Data state
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitalId, setHospitalId] = useState('');
  
  // Initialize the new appointment state to match the schema
  const [newAppointment, setNewAppointment] = useState({
    patient: {
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: ''
    },
    doctor: '',
    hospital: '',
    date: '',
    time: '',
    reason: '',
    status: 'Pending',
    symptoms: [],
    isRecurring: false,
    notifications: [
      {
        type: 'email',
        status: 'pending'
      }
    ]
  });

  // Effect for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch hospital ID associated with the logged-in admin
  useEffect(() => {
    const fetchHospitalId = async () => {
      if (!token || !user) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/hospitals`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            admin: user.id
          }
        });
        
        if (response.data.data.hospitals && response.data.data.hospitals.length > 0) {
          setHospitalId(response.data.data.hospitals[0]._id);
          
          // Set the hospital in the new appointment
          setNewAppointment(prev => ({
            ...prev,
            hospital: response.data.data.hospitals[0]._id
          }));
        }
      } catch (error) {
        console.error('Error fetching hospital ID:', error);
        const errorMessage = error.response?.data?.message || 'Failed to fetch hospital data';
        setError(errorMessage);
      }
    };
    
    fetchHospitalId();
  }, [token, user]);
  
  // Fetch appointments for this hospital
  useEffect(() => {
    if (!hospitalId || !token) return;
    
    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      
      try {
        let params = { hospital: hospitalId };
        
        // Filter by status if not 'all'
        if (filterStatus !== 'all') {
          params.status = filterStatus;
        }
        
        // Filter by tab selection
        if (activeTab === 'upcoming') {
          params.startDate = new Date().toISOString().split('T')[0];
        } else if (activeTab === 'today') {
          // Use the /today endpoint for today's appointments
          const response = await axios.get(`${API_BASE_URL}/appointments/today`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              hospital: hospitalId
            }
          });
          
          setAppointments(response.data.data.appointments);
          setLoading(false);
          return;
        } else if (activeTab === 'past') {
          params.endDate = new Date().toISOString().split('T')[0];
        }
        
        const response = await axios.get(`${API_BASE_URL}/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params
        });
        
        setAppointments(response.data.data.appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        const errorMessage = error.response?.data?.message || 'Failed to fetch appointments';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [hospitalId, token, activeTab, filterStatus]);
  
  // Fetch doctors for this hospital
  useEffect(() => {
    if (!hospitalId || !token) return;
    
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            hospital: hospitalId,
            status: 'active'
          }
        });
        
        setDoctors(response.data.data.doctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        const errorMessage = error.response?.data?.message || 'Failed to fetch doctors';
        setError(errorMessage);
      }
    };
    
    fetchDoctors();
  }, [hospitalId, token]);
  
  // Filter appointments by search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const patientNameMatch = appointment.patient?.name?.toLowerCase().includes(searchLower);
    const doctorNameMatch = appointment.doctor?.name?.toLowerCase().includes(searchLower);
    
    return patientNameMatch || doctorNameMatch;
  });

  // Handle symptoms input (comma-separated values)
  const handleSymptomsChange = (e) => {
    const symptomsString = e.target.value;
    const symptomsArray = symptomsString.split(',').map(symptom => symptom.trim()).filter(symptom => symptom);
    
    setNewAppointment(prev => ({
      ...prev,
      symptoms: symptomsArray
    }));
  };

  // Return symptoms array as comma-separated string for the form
  const getSymptomsString = () => {
    return newAppointment.symptoms.join(', ');
  };

  // Handle notification type change
  const handleNotificationTypeChange = (e) => {
    const notificationType = e.target.value;
    
    setNewAppointment(prev => ({
      ...prev,
      notifications: [
        {
          ...prev.notifications[0],
          type: notificationType
        }
      ]
    }));
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested patient properties
    if (name.startsWith('patient.')) {
      const patientField = name.split('.')[1];
      setNewAppointment(prev => ({
        ...prev,
        patient: {
          ...prev.patient,
          [patientField]: value
        }
      }));
    } else if (name === 'isRecurring') {
      // Handle checkbox for recurring appointments
      setNewAppointment(prev => ({
        ...prev,
        isRecurring: e.target.checked
      }));
    } else {
      setNewAppointment(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    
    if (!newAppointment.patient.name || !newAppointment.patient.email || !newAppointment.patient.phone || 
        !newAppointment.date || !newAppointment.time || !newAppointment.doctor || !newAppointment.reason) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Ensure date is in the correct format for MongoDB
      const formattedDate = new Date(newAppointment.date).toISOString();
      
      // Prepare the appointment data according to the schema
      const appointmentData = {
        ...newAppointment,
        date: formattedDate,
        // Ensure hospital is set
        hospital: hospitalId
      };
      
      // Send to API
      const response = await axios.post(`${API_BASE_URL}/appointments`, 
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        // Refresh appointments list
        const updatedAppointments = await axios.get(`${API_BASE_URL}/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { hospital: hospitalId }
        });
        
        setAppointments(updatedAppointments.data.data.appointments);
        
        // Reset form and close modal
        setNewAppointment({
          patient: {
            name: '',
            email: '',
            phone: '',
            age: '',
            gender: ''
          },
          doctor: '',
          hospital: hospitalId,
          date: '',
          time: '',
          reason: '',
          status: 'Pending',
          symptoms: [],
          isRecurring: false,
          notifications: [
            {
              type: 'email',
              status: 'pending'
            }
          ]
        });
        setShowAddAppointmentModal(false);
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add appointment. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };
  
  // Handle appointment status change
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        // Update the appointment in the local state
        setAppointments(prevAppointments => 
          prevAppointments.map(app => 
            app._id === appointmentId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update appointment status. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };
  
  return (
    <DashboardLayout title="Appointments Management">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-DarkBlue">Appointments</h2>
            <p className="text-mainGray">Manage and schedule patient appointments</p>
          </div>
          <button 
            onClick={() => setShowAddAppointmentModal(true)}
            className="bg-gradient-to-r from-mainBlue to-deepBlue text-white px-4 py-2 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Appointment
          </button>
        </div>

        {/* Filters and tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'upcoming' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('today')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'today' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'past' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                All
              </button>
            </div>

            {/* Status filter */}
            <div className="flex space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
              >
                <option value="all">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
              />
            </div>
          </div>

          {/* Appointments table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">
                    Patient
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recurring
                  </th>
                  <th className="relative whitespace-nowrap px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainBlue"></div>
                        <span className="ml-2 text-mainGray">Loading appointments...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-red-500">{error}</td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-mainGray">
                      No appointments found. {activeTab === 'upcoming' ? 'Schedule new appointments by clicking the "Add Appointment" button.' : ''}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment, index) => (
                    <tr key={appointment._id} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {appointment.patient?.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {appointment.doctor?.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {appointment.doctor?.specialty}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {appointment.time}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                          ${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : ''}
                          ${appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${appointment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                          ${appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                          ${appointment.status === 'Completed' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {appointment.reason && appointment.reason.length > 20 
                          ? `${appointment.reason.substring(0, 20)}...` 
                          : appointment.reason}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {appointment.isRecurring ? 'Yes' : 'No'}
                      </td>
                      <td className="relative whitespace-nowrap px-3 py-3 text-right text-sm font-medium">
                        <button 
                          className="text-mainBlue hover:text-mainBlue/80 mr-4"
                          onClick={() => {
                            // View appointment details (implementation would go here)
                            alert(`View details for appointment with ${appointment.patient?.name}`);
                          }}
                        >
                          View
                        </button>
                        
                        {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-700 mr-4"
                              onClick={() => handleStatusChange(appointment._id, 'Confirmed')}
                            >
                              Confirm
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(appointment._id, 'Cancelled')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'Confirmed' && (
                          <button 
                            className="text-blue-600 hover:text-blue-700 ml-4"
                            onClick={() => handleStatusChange(appointment._id, 'In Progress')}
                          >
                            Start
                          </button>
                        )}
                        
                        {appointment.status === 'In Progress' && (
                          <button 
                            className="text-purple-600 hover:text-purple-700 ml-4"
                            onClick={() => handleStatusChange(appointment._id, 'Completed')}
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Add Appointment Modal */}
        {showAddAppointmentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-DarkBlue">Schedule New Appointment</h3>
                <button 
                  className="text-mainGray hover:text-DarkBlue"
                  onClick={() => setShowAddAppointmentModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddAppointment} className="p-6">
                {/* Patient Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-DarkBlue mb-4">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="patient.name"
                        value={newAppointment.patient.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        name="patient.email"
                        value={newAppointment.patient.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        placeholder="Email address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Phone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        name="patient.phone"
                        value={newAppointment.patient.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        placeholder="Phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Age</label>
                      <input
                        type="number"
                        name="patient.age"
                        value={newAppointment.patient.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Gender</label>
                      <select
                        name="patient.gender"
                        value={newAppointment.patient.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Appointment Details */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-DarkBlue mb-4">Appointment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        name="date"
                        value={newAppointment.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Time <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        name="time"
                        value={newAppointment.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Doctor <span className="text-red-500">*</span></label>
                      <select
                        name="doctor"
                        value={newAppointment.doctor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        required
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor._id} value={doctor._id}>{doctor.name} ({doctor.specialty})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Status</label>
                      <select
                        name="status"
                        value={newAppointment.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainBlue mb-1">Reason <span className="text-red-500">*</span></label>
                      <select
                        name="reason"
                        value={newAppointment.reason}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        required
                      >
                        <option value="">Select Reason</option>
                          <option value="Check-up">Check-up</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Treatment">Treatment</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Vaccination">Vaccination</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-mainBlue mb-1">Notes</label>
                      <textarea
                        name="notes"
                        value={newAppointment.notes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-mainGray focus:ring-2 focus:ring-mainBlue/50"
                        rows="3"
                        placeholder="Any additional information"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAppointmentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-mainGray hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-mainBlue to-deepBlue text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
