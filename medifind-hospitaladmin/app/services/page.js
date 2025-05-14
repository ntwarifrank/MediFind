'use client';

import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  
  // Sample data - would be fetched from an API in a real application
  const services = [
    {
      id: 'SRV-001',
      name: 'Cardiac Consultation',
      category: 'Cardiology',
      description: 'Comprehensive heart health assessment and consultation with a cardiologist.',
      price: 150,
      duration: 45, // minutes
      department: 'Cardiology',
      availability: 'Mon-Fri, 9:00 AM - 5:00 PM',
      insuranceCovered: true,
      requiresReferral: false,
      popularityScore: 4.8,
      image: '/images/services/cardiac.jpg',
      requiredPreparation: 'Bring previous medical records and any recent test results.',
      doctors: ['Dr. Sarah Johnson', 'Dr. Michael Chen'],
      status: 'Active'
    },
    {
      id: 'SRV-002',
      name: 'Brain MRI Scan',
      category: 'Radiology',
      description: 'Magnetic Resonance Imaging of the brain to diagnose neurological conditions.',
      price: 800,
      duration: 60, // minutes
      department: 'Radiology',
      availability: 'Mon-Sat, 8:00 AM - 6:00 PM',
      insuranceCovered: true,
      requiresReferral: true,
      popularityScore: 4.5,
      image: '/images/services/mri.jpg',
      requiredPreparation: 'No metal objects, no food 4 hours before the procedure.',
      doctors: ['Dr. Michael Chen', 'Dr. Patricia Brown'],
      status: 'Active'
    },
    {
      id: 'SRV-003',
      name: 'Joint Replacement Surgery',
      category: 'Orthopedics',
      description: 'Surgical procedure to replace damaged joints with artificial implants.',
      price: 12000,
      duration: 180, // minutes
      department: 'Orthopedics',
      availability: 'Tue, Thu, 8:00 AM - 2:00 PM',
      insuranceCovered: true,
      requiresReferral: true,
      popularityScore: 4.7,
      image: '/images/services/joint.jpg',
      requiredPreparation: 'Pre-operative assessment, fasting for 12 hours before surgery.',
      doctors: ['Dr. Lisa Wong'],
      status: 'Active'
    },
    {
      id: 'SRV-004',
      name: 'Pediatric Vaccination',
      category: 'Pediatrics',
      description: 'Standard childhood vaccinations according to national immunization schedule.',
      price: 80,
      duration: 30, // minutes
      department: 'Pediatrics',
      availability: 'Mon-Fri, 9:00 AM - 4:00 PM',
      insuranceCovered: true,
      requiresReferral: false,
      popularityScore: 4.9,
      image: '/images/services/vaccination.jpg',
      requiredPreparation: 'Bring vaccination record book.',
      doctors: ['Dr. James Miller'],
      status: 'Active'
    },
    {
      id: 'SRV-005',
      name: 'Dermatology Consultation',
      category: 'Dermatology',
      description: 'Skin assessment and treatment consultation with a dermatologist.',
      price: 120,
      duration: 40, // minutes
      department: 'Dermatology',
      availability: 'Mon, Wed, Fri, 9:00 AM - 5:00 PM',
      insuranceCovered: true,
      requiresReferral: false,
      popularityScore: 4.6,
      image: '/images/services/dermatology.jpg',
      requiredPreparation: 'Avoid applying creams or makeup on affected areas before consultation.',
      doctors: ['Dr. Emily Taylor'],
      status: 'Inactive'
    },
    {
      id: 'SRV-006',
      name: 'Eye Examination',
      category: 'Ophthalmology',
      description: 'Comprehensive eye examination including vision test and eye health assessment.',
      price: 100,
      duration: 35, // minutes
      department: 'Ophthalmology',
      availability: 'Mon-Fri, 8:30 AM - 4:30 PM',
      insuranceCovered: true,
      requiresReferral: false,
      popularityScore: 4.7,
      image: '/images/services/eye.jpg',
      requiredPreparation: 'Bring current glasses or contact lenses if applicable.',
      doctors: ['Dr. Robert Williams'],
      status: 'Active'
    },
    {
      id: 'SRV-007',
      name: 'Physical Therapy Session',
      category: 'Rehabilitation',
      description: 'Therapeutic exercises and treatments to improve mobility and manage pain.',
      price: 90,
      duration: 50, // minutes
      department: 'Rehabilitation',
      availability: 'Mon-Sat, 8:00 AM - 6:00 PM',
      insuranceCovered: true,
      requiresReferral: true,
      popularityScore: 4.8,
      image: '/images/services/physio.jpg',
      requiredPreparation: 'Wear comfortable clothing and athletic shoes.',
      doctors: ['Dr. Lisa Wong', 'Dr. Thomas Moore'],
      status: 'Active'
    },
    {
      id: 'SRV-008',
      name: 'Dental Cleaning',
      category: 'Dentistry',
      description: 'Professional teeth cleaning and oral health assessment.',
      price: 70,
      duration: 40, // minutes
      department: 'Dentistry',
      availability: 'Mon-Fri, 9:00 AM - 5:00 PM',
      insuranceCovered: false,
      requiresReferral: false,
      popularityScore: 4.5,
      image: '/images/services/dental.jpg',
      requiredPreparation: 'Brush teeth before appointment.',
      doctors: ['Dr. Jennifer Adams'],
      status: 'Active'
    }
  ];
  
  // List of categories for filtering
  const categories = ['Cardiology', 'Radiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Ophthalmology', 'Rehabilitation', 'Dentistry'];
  
  // Filter services based on search term and active category
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.department.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'all' || 
      service.category === activeCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  // Function to format price with currency symbol
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <DashboardLayout title="Hospital Services">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-DarkBlue">Services</h2>
            <p className="text-mainGray">Manage medical services, pricing, and availability</p>
          </div>
          <button className="bg-gradient-to-r from-mainBlue to-deepBlue text-white px-4 py-2 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Service
          </button>
        </div>
        
        {/* Filters and search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg ${activeCategory === 'all' ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
              >
                All Services
              </button>
              {categories.map((category) => (
                <button 
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg ${activeCategory === category ? 'bg-mainBlue/10 text-mainBlue font-medium' : 'text-mainGray hover:bg-whiteGray'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search services..."
                className="bg-whiteGray py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mainBlue/50 w-full lg:w-64"
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
          
          {/* Services grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-DarkBlue">{service.name}</h3>
                        <p className="text-mainBlue text-sm">{service.category}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          service.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-mainGray mt-3 line-clamp-2">{service.description}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-mainGray">Price</p>
                        <p className="font-medium text-DarkBlue">{formatPrice(service.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Duration</p>
                        <p className="font-medium text-DarkBlue">{service.duration} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Department</p>
                        <p className="font-medium text-DarkBlue">{service.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Insurance</p>
                        <p className="font-medium text-DarkBlue">{service.insuranceCovered ? 'Covered' : 'Not Covered'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs text-mainGray mb-1">Doctors</p>
                      <div className="flex flex-wrap gap-1">
                        {service.doctors.map((doctor, index) => (
                          <span key={index} className="px-2 py-1 bg-mainBlue/10 text-mainBlue text-xs rounded-full">
                            {doctor}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button 
                        className="text-mainBlue hover:text-deepBlue text-sm font-medium transition-colors"
                        onClick={() => setSelectedService(service)}
                      >
                        View Details
                      </button>
                      <div className="flex space-x-2">
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 text-center text-mainGray">
                No services found matching your criteria.
              </div>
            )}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-mainGray">Showing {filteredServices.length} of {services.length} services</p>
            <div className="flex space-x-1">
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">Previous</button>
              <button className="px-3 py-1 rounded-md bg-mainBlue/10 text-mainBlue font-medium">1</button>
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">2</button>
              <button className="px-3 py-1 rounded-md bg-whiteGray text-mainGray hover:bg-mainBlue/10 hover:text-mainBlue">Next</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Service Details</h3>
              <button 
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setSelectedService(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Service Info */}
                <div className="w-full md:w-1/3">
                  <div className="flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-r from-mainBlue to-deepBlue flex items-center justify-center text-white text-4xl font-bold mb-4">
                      {selectedService.category.charAt(0)}
                    </div>
                    <h4 className="text-xl font-semibold text-DarkBlue text-center">{selectedService.name}</h4>
                    <p className="text-mainBlue font-medium">{selectedService.category}</p>
                    
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500 mr-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                      <span className="text-sm text-DarkBlue font-medium">{selectedService.popularityScore}</span>
                    </div>
                    
                    <div className="mt-4 w-full">
                      <span
                        className={`px-3 py-1 text-sm rounded-full w-full block text-center ${
                          selectedService.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedService.status}
                      </span>
                    </div>
                    
                    <div className="mt-6 space-y-4 w-full">
                      <div>
                        <p className="text-xs text-mainGray mb-1">Price</p>
                        <p className="text-xl font-bold text-DarkBlue">{formatPrice(selectedService.price)}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-mainGray mb-1">Duration</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedService.duration} minutes</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-mainGray mb-1">Department</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedService.department}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-mainGray mb-1">Insurance Coverage</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedService.insuranceCovered ? 'Covered by insurance' : 'Not covered by insurance'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-mainGray mb-1">Referral Required</p>
                        <p className="text-sm font-medium text-DarkBlue">{selectedService.requiresReferral ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Service Details */}
                <div className="w-full md:w-2/3 space-y-6">
                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Description</h5>
                    <p className="text-sm text-mainGray">{selectedService.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Availability</h5>
                    <p className="text-sm text-DarkBlue bg-whiteGray p-3 rounded-lg">{selectedService.availability}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Required Preparation</h5>
                    <p className="text-sm text-mainGray">{selectedService.requiredPreparation}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Assigned Doctors</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedService.doctors.map((doctor, index) => (
                        <div key={index} className="bg-whiteGray rounded-lg p-3 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-mainBlue/20 flex items-center justify-center text-mainBlue font-medium text-sm mr-3">
                            {doctor.split(' ')[1].charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-DarkBlue">{doctor}</p>
                            <p className="text-xs text-mainGray">{selectedService.department}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-whiteGray rounded-lg p-4">
                    <h5 className="text-md font-semibold text-DarkBlue mb-2">Service Statistics</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-mainGray">Monthly Appointments</p>
                        <p className="text-2xl font-bold text-DarkBlue">124</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Revenue (Monthly)</p>
                        <p className="text-2xl font-bold text-DarkBlue">{formatPrice(selectedService.price * 124)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Average Rating</p>
                        <div className="flex items-center">
                          <p className="text-xl font-bold text-DarkBlue mr-1">{selectedService.popularityScore}</p>
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-4 h-4" fill={i < Math.floor(selectedService.popularityScore) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-mainGray">Availability</p>
                        <p className="text-xl font-bold text-DarkBlue">5 days/week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-deepBlue transition-colors">
                  Edit Service
                </button>
                <button className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-deepBlue transition-colors">
                  Manage Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
