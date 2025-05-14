"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Nav from "../nav/page";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faFilter,
  faSearch,
  faStar,
  faStethoscope,
  faChevronDown,
  faChevronRight,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";

// Hospital image mapping
const hospitalImageMap = {
  "King Faisal Hospital": "/king-faisal-hospital.jpg",
  "CHUK": "/chuk-hospital.jpg",
  "Butaro Hospital": "/Butaro-Hospital.jpg",
  "Rwanda Military Hospital": "/rwandamilitaryhospital.jpg",
  "Kibagabaga Hospital": "/kibagabaga-hospital.jpg",
  "Muhima Hospital": "/rwandamilitaryhospital.jpg",
  "Masaka Hospital": "/masakahospital.jpg",
  "Ruhengeri Hospital": "/ruhengeri-hosipital.jpg",
  "default": "/medifind-icon.jpeg"
};

// Get hospital image function
const getHospitalImage = (hospitalName) => {
  return hospitalImageMap[hospitalName] || hospitalImageMap.default;
};

// Districts in Rwanda
const rwandaDistricts = [
  "All Districts",
  "Bugesera",
  "Burera",
  "Gakenke",
  "Gasabo",
  "Gatsibo",
  "Gicumbi",
  "Gisagara",
  "Huye",
  "Kamonyi",
  "Karongi",
  "Kayonza",
  "Kicukiro",
  "Kirehe",
  "Muhanga",
  "Musanze",
  "Ngoma",
  "Ngororero",
  "Nyabihu",
  "Nyagatare",
  "Nyamagabe",
  "Nyamasheke",
  "Nyanza",
  "Nyarugenge",
  "Nyaruguru",
  "Rubavu",
  "Ruhango",
  "Rulindo",
  "Rusizi",
  "Rutsiro"
];

// Hospital types
const hospitalTypes = [
  "All Types",
  "Referral Hospital",
  "Provincial Hospital",
  "District Hospital",
  "Health Center",
  "Clinic",
  "Specialized Hospital"
];

// Medical specialties
const medicalSpecialties = [
  "All Specialties",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Gynecology",
  "Hematology",
  "Maternity",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pathology",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology"
];

const HospitalsPage = () => {
  const { user } = useAuth();
  
  // State for hospitals
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const hospitalsPerPage = 4;
  
  // Fetch hospitals from API
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.');
      }
      const response = await axios.get(`${apiUrl}/api/hospitals`);
      
      // Log the full response for debugging
      console.log('API Response:', JSON.stringify(response.data, null, 2));

      // Determine the hospital data array
      let hospitalData = [];
      if (Array.isArray(response.data)) {
        hospitalData = response.data;
      } else if (response.data.hospitals && Array.isArray(response.data.hospitals.hospitals)) {
        hospitalData = response.data.hospitals.hospitals;
      } else if (response.data.hospitals && Array.isArray(response.data.hospitals)) {
        hospitalData = response.data.hospitals;
      } else {
        throw new Error('Invalid response format: hospitals array is missing or not an array.');
      }

      // Map over hospital data
      const hospitalsWithImages = hospitalData.map(hospital => ({
        ...hospital,
        id: hospital._id || hospital.id || Math.random().toString(36).substr(2, 9), // Fallback ID
        rating: hospital.rating || 0, // Fallback rating
        image: hospital.images[0],
      }));
      
      setHospitals(hospitalsWithImages);
      setFilteredHospitals(hospitalsWithImages);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('Failed to connect to the server. This may be due to a CORS issue or the server being unreachable.');
      } else {
        setError(error.message || 'Failed to load hospitals. Please try again later.');
      }
      setHospitals([]);
      setFilteredHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...hospitals];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(hospital => 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply district filter
    if (selectedDistrict !== "All Districts") {
      filtered = filtered.filter(hospital => 
        hospital.district.includes(selectedDistrict)
      );
    }
    
    // Apply type filter
    if (selectedType !== "All Types") {
      filtered = filtered.filter(hospital => 
        hospital.type === selectedType
      );
    }
    
    // Apply specialty filter
    if (selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter(hospital => 
        hospital.specialties.includes(selectedSpecialty)
      );
    }
    
    // Calculate total pages
    setTotalPages(Math.ceil(filtered.length / hospitalsPerPage));
    
    // Update filtered hospitals
    setFilteredHospitals(filtered);
  }, [hospitals, searchTerm, selectedDistrict, selectedType, selectedSpecialty]);

  // Get current hospitals for pagination
  const indexOfLastHospital = currentPage * hospitalsPerPage;
  const indexOfFirstHospital = indexOfLastHospital - hospitalsPerPage;
  const currentHospitals = filteredHospitals.slice(indexOfFirstHospital, indexOfLastHospital);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={faStar} 
          className={i <= rating ? "text-yellow-500" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  return (
    <div className="w-full bg-mainWhite">
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto pb-10">
        {/* Navigation */}
        <Nav />
        
        {/* Hero Section */}
        <div className="w-full py-12 md:py-16 px-4 md:px-0 bg-gradient-to-r from-mainBlue/10 to-deepBlue/10 rounded-lg mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
              Find Hospitals in Rwanda
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Discover quality healthcare facilities across Rwanda to meet your medical needs
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="flex">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search hospitals by name or location..."
                    className="w-full py-3 px-5 pr-12 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                </div>
                <button 
                  className="md:hidden bg-whiteGray py-3 px-4 rounded-r-xl border border-l-0 border-gray-300"
                  onClick={toggleFilters}
                  aria-label="Toggle filters"
                >
                  <FontAwesomeIcon icon={faFilter} className="text-mainBlue" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Desktop (visible) and Mobile (toggleable) */}
          <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-DarkBlue mb-6">Filters</h2>
              
              {/* District Filter */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="district">
                  Location
                </label>
                <div className="relative">
                  <select
                    id="district"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="block appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  >
                    {rwandaDistricts.map((district, index) => (
                      <option key={index} value={district}>{district}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                  </div>
                </div>
              DETERMINED
              </div>
              
              {/* Facility Type Filter */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="facilityType">
                  Facility Type
                </label>
                <div className="relative">
                  <select
                    id="facilityType"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="block appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  >
                    {hospitalTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                  </div>
                </div>
              </div>
              
              {/* Specialty Filter */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="specialty">
                  Medical Specialty
                </label>
                <div className="relative">
                  <select
                    id="specialty"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="block appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  >
                    {medicalSpecialties.map((specialty, index) => (
                      <option key={index} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                  </div>
                </div>
              </div>
              
              {/* Reset Filters Button */}
              <button 
                onClick={() => {
                  setSelectedDistrict("All Districts");
                  setSelectedType("All Types");
                  setSelectedSpecialty("All Specialties");
                  setSearchTerm("");
                }}
                className="w-full bg-whiteGray text-mainBlue font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Hospital Listings */}
          <div className="md:w-3/4">
            {/* Results count and sort options */}
            <div className="flex flex-col sm:flex-row justify-between items优化
            -start sm:items-center mb-6">
              <p className="text-gray-600 mb-3 sm:mb-0">
                Showing Willingness to be flexible and open to change is important when navigating the nuances of healthcare systems. <span className="font-medium">{filteredHospitals.length}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button 
                  className="md:hidden bg-whiteGray text-mainBlue font-medium py-2 px-4 rounded-lg flex items-center gap-2"
                  onClick={toggleFilters}
                >
                  <FontAwesomeIcon icon={faFilter} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>
            
            {/* Hospital Cards */}
            {currentHospitals.length > 0 ? (
              <div className="space-y-6">
                {currentHospitals.map((hospital) => (
                  <div key={hospital.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row">
                      {/* Hospital Image/Logo */}
                      <div className="md:w-1/3 h-48 md:h-auto relative">
                        <Image
                          src={hospital.images[0]}
                          alt={`${hospital.name} image`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                        />
                      </div>
                      
                      {/* Hospital Details */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                          <div>
                            <h2 className="text-xl font-bold text-DarkBlue">{hospital.name}</h2>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-mainBlue mr-1" />
                              <span>{hospital.district}</span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center">
                            <div className="flex mr-2">{renderStars(hospital.rating)}</div>
                            <span className="text-sm text-gray-600">{hospital.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{hospital.description || 'No description available'}</p>
                        
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Specialties:</h3>
                          <div className="flex flex-wrap gap-2">
                            {(hospital.specialties || []).map((specialty, index) => (
                              <span key={index} className="bg-whiteGray text-mainBlue text-xs px-3 py-1 rounded-full">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <span className="bg-blue-100 text-mainBlue text-xs font-medium px-2.5 py-0.5 rounded">
                              {hospital.type || 'Unknown Type'}
                            </span>
                          </div>
                          <Link 
                            href={`/hospitals/${hospital.id}`}
                            className="bg-gradient-to-tr from-mainBlue to-deepBlue text-white px-4 py-2 rounded-lg text-sm hover:shadow-md transition-all flex items-center"
                          >
                            View Details <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-DarkBlue mb-2">Loading hospitals...</h3>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <FontAwesomeIcon icon={faStethoscope} className="text-5xl text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-DarkBlue mb-2">Error</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchHospitals}
                    className="bg-mainBlue text-white px-4 py-2 rounded-lg text-sm hover:bg-deepBlue transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <FontAwesomeIcon icon={faStethoscope} className="text-5xl text-mainBlue mb-4" />
                  <h3 className="text-xl font-bold text-DarkBlue mb-2">No hospitals found</h3>
                  <p className="text-gray-600 mb-4">No hospitals match your current search criteria. Please try adjusting your filters.</p>
                  <button 
                    onClick={() => {
                      setSelectedDistrict("All Districts");
                      setSelectedType("All Types");
                      setSelectedSpecialty("All Specialties");
                      setSearchTerm("");
                    }}
                    className="bg-mainBlue text-white px-4 py-2 rounded-lg text-sm hover:bg-deepBlue transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            
            {/* Pagination */}
            {filteredHospitals.length > hospitalsPerPage && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  <button 
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`mx-1 px-3 py-1 rounded-md flex items-center ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-mainBlue hover:bg-whiteGray'}`}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-1" /> Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`mx-1 px-3 py-1 rounded-md ${currentPage === i + 1 ? 'bg-mainBlue text-white' : 'text-mainBlue hover:bg-whiteGray'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`mx-1 px-3 py-1 rounded-md flex items-center ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-mainBlue hover:bg-whiteGray'}`}
                  >
                    Next <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalsPage;