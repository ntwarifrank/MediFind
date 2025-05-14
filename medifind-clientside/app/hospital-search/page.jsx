"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Nav from "../nav/page";
import Footer from "../homepage/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faFilter,
  faSearch,
  faStar,
  faHospital,
  faStethoscope,
  faSliders,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

// Hospital image mapping
const hospitalImageMap = {
  "kanombe": "/rwandamilitaryhospital.jpg",
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

const HospitalSearchPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    types: [],
    specialties: [],
    locations: [],
    minRating: 0
  });
  const [showFilters, setShowFilters] = useState(false);

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

      // Extract hospital data
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

      // Map API data to UI structure
      const formattedHospitals = hospitalData.map(hospital => ({
        id: hospital._id || Math.random().toString(36).substr(2, 9),
        name: hospital.name ? hospital.name.charAt(0).toUpperCase() + hospital.name.slice(1) : "Unknown Hospital",
        location: hospital.district ? `${hospital.district}${hospital.sector ? `, ${hospital.sector}` : ''}${hospital.cell ? `, ${hospital.cell}` : ''}` : "Unknown Location",
        type: hospital.type || "Unknown Type",
        specialties: hospital.specialties || [],
        rating: hospital.rating || 0,
        image: hospital.images[0],
        description: hospital.description || "No description available",
        contact: {
          phone: hospital.contact?.phone || "N/A",
          email: hospital.contact?.email || "N/A",
          website: hospital.website || "N/A"
        },
        services: hospital.services || [],
        founded: hospital.founded || "N/A"
      }));

      setHospitals(formattedHospitals);
      setSearchResults(formattedHospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setError(error.message || 'Failed to load hospitals. Please try again later.');
      setHospitals([]);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Get unique filter options
  const allSpecialties = [...new Set(hospitals.flatMap(hospital => hospital.specialties))].sort();
  const allTypes = [...new Set(hospitals.map(hospital => hospital.type))].sort();
  const allLocations = [...new Set(hospitals.map(hospital => hospital.location))].sort();

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    applyFilters(e.target.value, filters);
  };

  // Toggle filter selection
  const toggleFilter = (category, value) => {
    const newFilters = { ...filters };
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter(item => item !== value);
    } else {
      newFilters[category] = [...newFilters[category], value];
    }
    setFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  // Set minimum rating filter
  const setRatingFilter = (rating) => {
    const newFilters = { ...filters, minRating: rating };
    setFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  // Apply all filters to hospital data
  const applyFilters = (term, currentFilters) => {
    let results = hospitals;

    // Apply search term filter
    if (term) {
      const lowercaseTerm = term.toLowerCase();
      results = results.filter(hospital =>
        hospital.name.toLowerCase().includes(lowercaseTerm) ||
        hospital.description.toLowerCase().includes(lowercaseTerm) ||
        hospital.specialties.some(specialty => specialty.toLowerCase().includes(lowercaseTerm))
      );
    }

    // Apply hospital type filter
    if (currentFilters.types.length > 0) {
      results = results.filter(hospital =>
        currentFilters.types.includes(hospital.type)
      );
    }

    // Apply specialty filter
    if (currentFilters.specialties.length > 0) {
      results = results.filter(hospital =>
        hospital.specialties.some(specialty =>
          currentFilters.specialties.includes(specialty)
        )
      );
    }

    // Apply location filter
    if (currentFilters.locations.length > 0) {
      results = results.filter(hospital =>
        currentFilters.locations.includes(hospital.location)
      );
    }

    // Apply rating filter
    if (currentFilters.minRating > 0) {
      results = results.filter(hospital => hospital.rating >= currentFilters.minRating);
    }

    setSearchResults(results);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters = {
      types: [],
      specialties: [],
      locations: [],
      minRating: 0
    };
    setFilters(emptyFilters);
    setSearchTerm("");
    applyFilters("", emptyFilters);
  };

  // Count active filters
  const activeFilterCount = [
    filters.types.length,
    filters.specialties.length,
    filters.locations.length,
    filters.minRating > 0 ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  // Render star ratings
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={`text-xs ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="w-full bg-mainWhite">
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto">
        {/* Navigation */}
        <Nav />

        {/* Hero Section */}
        <div className="w-full py-12 md:py-16 px-4 md:px-8 bg-gradient-to-r from-mainBlue/10 to-deepBlue/10 rounded-lg mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-4">
              Find the Right Hospital
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Search for hospitals by name, specialty, or location to find the healthcare you need.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search hospitals, specialties, or treatments..."
                className="w-full px-5 py-4 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-20">
          {/* Filters Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                  <div className="flex items-center">
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-mainBlue hover:underline mr-3"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      className="lg:hidden text-gray-500 hover:text-gray-700"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FontAwesomeIcon icon={showFilters ? faTimes : faSliders} />
                    </button>
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} applied
                  </div>
                )}
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[2000px]' : 'max-h-0 lg:max-h-[2000px]'}`}>
                {/* Hospital Type Filter */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Hospital Type</h3>
                  <div className="space-y-2">
                    {allTypes.map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          checked={filters.types.includes(type)}
                          onChange={() => toggleFilter('types', type)}
                          className="w-4 h-4 text-mainBlue border-gray-300 rounded focus:ring-mainBlue"
                        />
                        <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialties Filter */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Specialties</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {allSpecialties.map((specialty) => (
                      <div key={specialty} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`specialty-${specialty}`}
                          checked={filters.specialties.includes(specialty)}
                          onChange={() => toggleFilter('specialties', specialty)}
                          className="w-4 h-4 text-mainBlue border-gray-300 rounded focus:ring-mainBlue"
                        />
                        <label htmlFor={`specialty-${specialty}`} className="ml-2 text-sm text-gray-700">
                          {specialty}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Location</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {allLocations.map((location) => (
                      <div key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`location-${location}`}
                          checked={filters.locations.includes(location)}
                          onChange={() => toggleFilter('locations', location)}
                          className="w-4 h-4 text-mainBlue border-gray-300 rounded focus:ring-mainBlue"
                        />
                        <label htmlFor={`location-${location}`} className="ml-2 text-sm text-gray-700">
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <input
                          type="radio"
                          id={`rating-${rating}`}
                          name="rating"
                          checked={filters.minRating === rating}
                          onChange={() => setRatingFilter(rating)}
                          className="w-4 h-4 text-mainBlue border-gray-300 focus:ring-mainBlue"
                        />
                        <label htmlFor={`rating-${rating}`} className="ml-2 text-sm text-gray-700 flex items-center">
                          {rating === 0 ? (
                            "Any Rating"
                          ) : (
                            <>
                              {rating}+
                              <div className="flex items-center ml-1">
                                {renderStars(rating)}
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {searchResults.length} {searchResults.length === 1 ? 'Hospital' : 'Hospitals'} Found
              </h2>
              <div className="text-sm text-gray-500">
                Showing all results
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Loading hospitals...</h3>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FontAwesomeIcon icon={faStethoscope} className="text-4xl text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchHospitals}
                  className="text-mainBlue hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FontAwesomeIcon icon={faHospital} className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Hospitals Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any hospitals matching your search criteria. Try adjusting your filters or search term.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-mainBlue hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((hospital) => (
                  <div key={hospital.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gray-200">
                      <Image
                        src={hospital.image}
                        alt={hospital.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-full shadow-md">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-1" />
                          <span className="text-sm font-bold">{hospital.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{hospital.name}</h3>
                      <div className="flex items-start mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-mainBlue mt-1 mr-2" />
                        <p className="text-sm text-gray-600">{hospital.location}</p>
                      </div>
                      <div className="flex items-start mb-2">
                        <FontAwesomeIcon icon={faStethoscope} className="text-mainBlue mt-1 mr-2" />
                        <p className="text-sm text-gray-600 truncate">
                          {hospital.specialties.slice(0, 3).join(', ')}
                          {hospital.specialties.length > 3 ? '...' : ''}
                        </p>
                      </div>
                      <div className="flex items-start mb-2">
                        <FontAwesomeIcon icon={faPhone} className="text-mainBlue mt-1 mr-2" />
                        <p className="text-sm text-gray-600">{hospital.contact.phone}</p>
                      </div>
                      <div className="flex items-start mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-mainBlue mt-1 mr-2" />
                        <p className="text-sm text-gray-600">{hospital.contact.email}</p>
                      </div>
                      {hospital.contact.website !== "N/A" && (
                        <div className="flex items-start mb-2">
                          <FontAwesomeIcon icon={faEnvelope} className="text-mainBlue mt-1 mr-2" />
                          <a href={hospital.contact.website} className="text-sm text-mainBlue hover:underline" target="_blank" rel="noopener noreferrer">
                            {hospital.contact.website}
                          </a>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{hospital.description}</p>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/hospitals/${hospital.id}`}
                          className="text-white bg-mainBlue hover:bg-deepBlue transition-colors py-2 px-4 rounded-lg text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <span className="text-sm text-gray-500">
                          {hospital.type} {hospital.founded !== "N/A" ? `• Founded ${hospital.founded}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HospitalSearchPage;