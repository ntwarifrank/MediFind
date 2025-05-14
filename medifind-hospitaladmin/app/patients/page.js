'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function PatientsPage() {
  const { user } = useAuth();
  const hospitalId = user?.hospitalId;
  
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [patients, setPatients] = useState([]);
  
  // New patient form state
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodType: 'O+',
    status: 'Active',
    insuranceProvider: '',
    insuranceNumber: '',
    medicalConditions: '',
    allergies: '',
    assignedDoctor: ''
  });
  
  // Fetch patients from backend API
  useEffect(() => {
    if (!hospitalId) return;
    
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/patients', {
          params: { hospital: hospitalId }
        });
        setPatients(response.data.data.patients || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again later.');
        // Fallback to sample data for demo purposes
        setPatients([

    {
      id: 'PT-001',
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      phone: '+250 789 123 456',
      email: 'john.doe@example.com',
      address: 'Kigali Heights, Kigali, Rwanda',
      bloodType: 'O+',
      lastVisit: '2025-04-28',
      status: 'Active',
      insuranceProvider: 'RSSB',
      insuranceNumber: 'INS-12345678',
      medicalConditions: ['Hypertension', 'Diabetes Type 2'],
      allergies: ['Penicillin'],
      assignedDoctor: 'Dr. Sarah Johnson'
    },
    {
      id: 'PT-002',
      name: 'Emma Wilson',
      age: 32,
      gender: 'Female',
      phone: '+250 789 234 567',
      email: 'emma.wilson@example.com',
      address: 'Nyarutarama, Kigali, Rwanda',
      bloodType: 'A+',
      lastVisit: '2025-05-02',
      status: 'Active',
      insuranceProvider: 'MMI',
      insuranceNumber: 'INS-23456789',
      medicalConditions: ['Asthma'],
      allergies: ['Pollen', 'Dust'],
      assignedDoctor: 'Dr. Michael Chen'
    },
    {
      id: 'PT-003',
      name: 'Robert Brown',
      age: 58,
      gender: 'Male',
      phone: '+250 789 345 678',
      email: 'robert.brown@example.com',
      address: 'Kimihurura, Kigali, Rwanda',
      bloodType: 'B-',
      lastVisit: '2025-04-15',
      status: 'Active',
      insuranceProvider: 'RSSB',
      insuranceNumber: 'INS-34567890',
      medicalConditions: ['Arthritis'],
      allergies: [],
      assignedDoctor: 'Dr. Lisa Wong'
    },
    {
      id: 'PT-004',
      name: 'Maria Garcia',
      age: 8,
      gender: 'Female',
      phone: '+250 789 456 789',
      email: 'parent.garcia@example.com',
      address: 'Gisozi, Kigali, Rwanda',
      bloodType: 'AB+',
      lastVisit: '2025-05-05',
      status: 'Active',
      insuranceProvider: 'MMI',
      insuranceNumber: 'INS-45678901',
      medicalConditions: [],
      allergies: ['Nuts'],
      assignedDoctor: 'Dr. James Miller'
    },
    {
      id: 'PT-005',
      name: 'David Kim',
      age: 27,
      gender: 'Male',
      phone: '+250 789 567 890',
      email: 'david.kim@example.com',
      address: 'Remera, Kigali, Rwanda',
      bloodType: 'O-',
      lastVisit: '2025-04-25',
      status: 'Active',
      insuranceProvider: 'RAMA',
      insuranceNumber: 'INS-56789012',
      medicalConditions: ['Eczema'],
      allergies: [],
      assignedDoctor: 'Dr. Emily Taylor'
    },
    {
      id: 'PT-006',
      name: 'Jennifer Lopez',
      age: 42,
      gender: 'Female',
      phone: '+250 789 678 901',
      email: 'jennifer.lopez@example.com',
      address: 'Kibagabaga, Kigali, Rwanda',
      bloodType: 'A-',
      lastVisit: '2025-03-15',
      status: 'Inactive',
      insuranceProvider: 'RSSB',
      insuranceNumber: 'INS-67890123',
      medicalConditions: ['Migraine'],
      allergies: ['Aspirin'],
      assignedDoctor: 'Dr. Robert Williams'
    }
  ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [hospitalId]);
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient({
      ...newPatient,
      [name]: value
    });
  };
  
  const handleAddPatient = (e) => {
    e.preventDefault();
    
    // In a real application, this would send data to an API
    // For now, we'll just log it and close the modal
    console.log('Adding new patient:', newPatient);
    
    // Reset form and close modal
    setNewPatient({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      bloodType: 'O+',
      status: 'Active',
      insuranceProvider: '',
      insuranceNumber: '',
      medicalConditions: '',
      allergies: '',
      assignedDoctor: ''
    });
    setShowAddPatientModal(false);
  };
  
  // Filter patients based on search term and active tab
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTab = 
      (activeTab === 'active' && patient.status === 'Active') ||
      (activeTab === 'inactive' && patient.status === 'Inactive') ||
      activeTab === 'all';
      
    return matchesSearch && matchesTab;
  });
  
  return (
    <DashboardLayout title="Patients Management">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-DarkBlue">Patients</h2>
            <p className="text-mainGray">Manage patient records and medical history</p>
          </div>
          <button 
            onClick={() => setShowAddPatientModal(true)}
            className="bg-gradient-to-r from-mainBlue to-deepBlue text-white px-4 py-2 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Patient
          </button>
        </div>
        
        {/* Filters and tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            {/* Tabs */}
            <div className="flex flex-wrap space-x-2 md:space-x-4">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                All Patients
              </button>
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'active' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('inactive')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'inactive' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                Inactive
              </button>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search patients..."
                className="bg-whiteGray py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mainBlue/50 w-full md:w-64"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          {/* Patients table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-mainBlue hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="responsive-table responsive-table-container">
              <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-mainGray uppercase tracking-wider">
                  <th className="px-6 py-3">Patient ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Age/Gender</th>
                  <th className="px-6 py-3 hidden md:table-cell">Contact</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Last Visit</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-whiteGray/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-DarkBlue">{patient.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-mainBlue/20 flex items-center justify-center text-mainBlue font-medium text-sm mr-3">
                            {patient.name.charAt(0)}
                          </div>
                          <span className="font-medium text-DarkBlue">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-DarkBlue">{patient.age} years</span>
                        <span className="text-xs text-mainGray block">{patient.gender}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-DarkBlue block">{patient.phone}</span>
                        <span className="text-xs text-mainGray">{patient.email}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-mainGray hidden lg:table-cell">{patient.lastVisit}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            patient.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex space-x-2 justify-end">
                          <button 
                            className="p-1 text-mainBlue hover:bg-mainBlue/10 rounded" 
                            title="View Details"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="p-1 text-mainBlue hover:bg-mainBlue/10 rounded" title="Edit">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-mainGray">
                      No patients found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          )}
          
          
          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
            <p className="text-sm text-mainGray">Showing {filteredPatients.length} of {patients.length} patients</p>
            <div className="flex space-x-1">
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">Previous</button>
              <button className="px-3 py-1 rounded-md bg-mainBlue/10 text-mainBlue font-medium">1</button>
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">2</button>
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">Next</button>
            </div>
          </div>
        </div>
        
        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 h-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-DarkBlue">Patient Details</h3>
                <button 
                  className="text-mainGray hover:text-DarkBlue"
                  onClick={() => setSelectedPatient(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Patient Info */}
                  <div className="w-full md:w-1/2 space-y-6">
                    <div className="flex items-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-mainBlue to-deepBlue flex items-center justify-center text-white text-2xl font-bold mr-4">
                        {selectedPatient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-DarkBlue">{selectedPatient.name}</h4>
                        <p className="text-mainGray">{selectedPatient.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-mainGray">Age</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedPatient.age} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Gender</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedPatient.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Blood Type</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedPatient.bloodType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Status</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedPatient.status}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-mainGray mb-1">Contact Information</p>
                      <p className="text-sm font-medium text-DarkBlue">{selectedPatient.phone}</p>
                      <p className="text-sm text-DarkBlue">{selectedPatient.email}</p>
                      <p className="text-sm text-mainGray mt-1">{selectedPatient.address}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-mainGray mb-1">Insurance</p>
                      <p className="text-sm font-medium text-DarkBlue">{selectedPatient.insuranceProvider}</p>
                      <p className="text-sm text-mainGray">{selectedPatient.insuranceNumber}</p>
                    </div>
                  </div>
                  
                  {/* Medical Info */}
                  <div className="w-full md:w-1/2 space-y-6">
                    <div>
                      <p className="text-xs text-mainGray mb-1">Assigned Doctor</p>
                      <p className="text-sm font-medium text-DarkBlue">{selectedPatient.assignedDoctor}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-mainGray mb-1">Medical Conditions</p>
                      {selectedPatient.medicalConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.medicalConditions.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-mainBlue/10 text-mainBlue text-xs rounded-full">
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-mainGray">No known medical conditions</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-mainGray mb-1">Allergies</p>
                      {selectedPatient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.allergies.map((allergy, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-mainGray">No known allergies</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-mainGray mb-1">Recent Visits</p>
                      <div className="space-y-2">
                        <div className="p-3 bg-whiteGray rounded-lg">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-DarkBlue">{selectedPatient.lastVisit}</p>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Check-up</span>
                          </div>
                          <p className="text-xs text-mainGray mt-1">Dr. {selectedPatient.assignedDoctor.split(' ')[1]}</p>
                          <p className="text-sm text-DarkBlue mt-2">Regular check-up and prescription renewal</p>
                        </div>
                        
                        <div className="p-3 bg-whiteGray rounded-lg">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-DarkBlue">{new Date(new Date(selectedPatient.lastVisit).setMonth(new Date(selectedPatient.lastVisit).getMonth() - 3)).toISOString().split('T')[0]}</p>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Lab Test</span>
                          </div>
                          <p className="text-xs text-mainGray mt-1">Dr. {selectedPatient.assignedDoctor.split(' ')[1]}</p>
                          <p className="text-sm text-DarkBlue mt-2">Blood work and general health assessment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button 
                    className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-deepBlue transition-colors">
                    Edit Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Add New Patient</h3>
              <button 
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setShowAddPatientModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Personal Information */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={newPatient.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Age <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          name="age"
                          value={newPatient.age}
                          onChange={handleInputChange}
                          required
                          min="0"
                          max="120"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Gender <span className="text-red-500">*</span></label>
                        <select
                          name="gender"
                          value={newPatient.gender}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-DarkBlue">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Phone Number <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        name="phone"
                        value={newPatient.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+250 7XX XXX XXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newPatient.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-mainGray mb-1">Address <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="address"
                        value={newPatient.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Street, City, Country"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Medical Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-DarkBlue">Medical Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Blood Type</label>
                      <select
                        name="bloodType"
                        value={newPatient.bloodType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Medical Conditions</label>
                      <textarea
                        name="medicalConditions"
                        value={newPatient.medicalConditions}
                        onChange={handleInputChange}
                        placeholder="Separate with commas"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50 h-20"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Allergies</label>
                      <textarea
                        name="allergies"
                        value={newPatient.allergies}
                        onChange={handleInputChange}
                        placeholder="Separate with commas"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50 h-20"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Insurance & Administrative */}
                <div className="space-y-4">
                  <h4 className="font-medium text-DarkBlue">Insurance & Administrative</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Status</label>
                      <select
                        name="status"
                        value={newPatient.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Insurance Provider</label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={newPatient.insuranceProvider}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Insurance Number</label>
                      <input
                        type="text"
                        name="insuranceNumber"
                        value={newPatient.insuranceNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Assigned Doctor</label>
                      <input
                        type="text"
                        name="assignedDoctor"
                        value={newPatient.assignedDoctor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
