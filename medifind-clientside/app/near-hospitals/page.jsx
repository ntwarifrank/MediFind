"use client";

import { useState, useEffect, useCallback } from "react";
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
  faLocationArrow,
  faSpinner,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";

// Define map libraries outside of component to prevent re-renders
const mapLibraries = ["places", "geometry"];


// Real coordinates for hospitals (accurate locations for distance calculation)
const hospitalCoordinatesMap = {
  // Kigali hospitals
  "kanombe": { lat: -1.9683, lng: 30.1138 }, // Rwanda Military Hospital
  "King Faisal Hospital": { lat: -1.9449, lng: 30.0618 },
  "CHUK": { lat: -1.9504, lng: 30.0473 },
  "Kibagabaga Hospital": { lat: -1.9183, lng: 30.0984 },
  "Masaka Hospital": { lat: -1.9879, lng: 30.1364 },
  "Muhima Hospital": { lat: -1.9416, lng: 30.0521 },
  
  // Hospitals outside Kigali
  "Gisenyi hospital": { lat: -1.7021, lng: 29.2570 }, // Gisenyi (Western province, near Lake Kivu)
  "Gisenyi Hospital": { lat: -1.7021, lng: 29.2570 }, // Alternative capitalization
  "Ruhengeri Hospital": { lat: -1.4973, lng: 29.6371 }, // Musanze
  "Butaro Hospital": { lat: -1.3775, lng: 30.0877 }, // Northern province
  "Nyagatare Hospital": { lat: -1.2978, lng: 30.3270 }, // Eastern province
  "Rwamagana Hospital": { lat: -1.9492, lng: 30.4359 }, // Eastern province
  "Nyanza Hospital": { lat: -2.3519, lng: 29.7509 }, // Southern province
  "Huye Hospital": { lat: -2.6027, lng: 29.7509 }, // Southern province (Butare)
  
  // Default coordinates (Kigali center - only used if hospital not found in map)
  "default": { lat: -1.9536, lng: 30.0606 } // Kigali center
};

// Get hospital coordinates function
const getHospitalCoordinates = (hospitalName) => {
  return hospitalCoordinatesMap[hospitalName] || hospitalCoordinatesMap.default;
};

const NearHospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: -1.9536, lng: 30.0606 }); // Default to Kigali
  const [searchRadius, setSearchRadius] = useState(5); // Search radius in km

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: mapLibraries
  });

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '0.5rem',
  };

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
  };

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
        coordinates: getHospitalCoordinates(hospital.name), // Placeholder coordinates
        type: hospital.type || "Unknown Type",
        specialties: hospital.specialties || [],
        rating: hospital.rating || 0,
        image: hospital.images[0],
        distance: null,
        contact: {
          phone: hospital.contact?.phone || "N/A",
          email: hospital.contact?.email || "N/A",
          website: hospital.website || "N/A"
        }
      }));

      setHospitals(formattedHospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setApiError(error.message || 'Failed to load hospitals. Please try again later.');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  // Haversine fallback for calculating distance between two coordinates in km
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    return distance; // Distance in km
  };
  
  // Calculate distance using Haversine formula for now due to API issues
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Currently using Haversine as fallback due to API key limitations
    return calculateHaversineDistance(lat1, lon1, lat2, lon2);
  };

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setLoading(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Could not access your location. Please enable location services in your browser.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  // Find nearby hospitals when user location or hospitals change
  useEffect(() => {
    if (userLocation && hospitals.length > 0) {
      const hospitalsWithDistance = hospitals.map(hospital => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hospital.coordinates.lat,
          hospital.coordinates.lng
        );
        return { ...hospital, distance };
      });

      // Filter hospitals within the radius and sort by distance
      const nearby = hospitalsWithDistance
        .filter(hospital => hospital.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance);

      setNearbyHospitals(nearby);
    }
  }, [userLocation, hospitals, searchRadius]);

  // Fetch hospitals and get user location on component mount
  useEffect(() => {
    fetchHospitals();
    getUserLocation();
  }, [getUserLocation]);

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
              Find Hospitals Near You
            </h1>
            <p className="text-gray-700 text-lg">
              Discover healthcare facilities in your vicinity for quick and convenient access to medical services.
            </p>
          </div>
        </div>

        {/* Location Controls */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-4">
              <button
                onClick={getUserLocation}
                className="flex items-center gap-2 py-2 px-4 bg-mainBlue text-white rounded-lg hover:bg-deepBlue transition-colors"
              >
                <FontAwesomeIcon icon={faLocationArrow} />
                {loading ? 'Getting Location...' : 'Use My Location'}
                {loading && <FontAwesomeIcon icon={faSpinner} className="ml-2 animate-spin" />}
              </button>
              {locationError && (
                <div className="text-red-500 flex items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  {locationError}
                </div>
              )}
              {apiError && (
                <div className="text-red-500 flex items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  {apiError}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700">Search radius:</label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
              >
                <option value="1">1 km</option>
                <option value="2">2 km</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Note: Hospital locations are approximate. Please verify exact addresses with the hospital.
          </p>
        </div>

        {/* Google Map */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-2">
          {!isLoaded ? (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <FontAwesomeIcon icon={faSpinner} className="text-3xl text-mainBlue animate-spin mb-2" />
                <p className="text-gray-600">Loading Map...</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-red-500">Error loading maps. Please try again later.</p>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              options={options}
            >
              {/* User Location Marker */}
              {userLocation && (
                <MarkerF
                  position={userLocation}
                  icon={{
                    path: 'M12,8a4,4,0,1,1-4,4A4,4,0,0,1,12,8Z',
                    fillColor: '#1E88E5',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                    scale: 2,
                  }}
                  title="Your Location"
                />
              )}

              {/* Hospital Markers */}
              {nearbyHospitals.map((hospital) => (
                <MarkerF
                  key={hospital.id}
                  position={hospital.coordinates}
                  onClick={() => setSelectedHospital(hospital)}
                  icon={{
                    url: '/hospital-marker.png',
                    scaledSize: new window.google.maps.Size(32, 32)
                  }}
                />
              ))}

              {/* Info Window for Selected Hospital */}
              {selectedHospital && (
                <InfoWindowF
                  position={selectedHospital.coordinates}
                  onCloseClick={() => setSelectedHospital(null)}
                >
                  <div className="max-w-xs">
                    <h3 className="font-bold text-gray-800">{selectedHospital.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{selectedHospital.location}</p>
                    <div className="flex items-center text-yellow-500 mb-1">
                      {renderStars(selectedHospital.rating)}
                      <span className="text-xs text-gray-600 ml-1">{selectedHospital.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-blue-600 mb-1">
                      Distance: {selectedHospital.distance?.toFixed(2)} km
                    </p>
                    <p className="text-sm text-gray-600 mb-1">{selectedHospital.contact.phone}</p>
                    <p className="text-sm text-gray-600 mb-1">{selectedHospital.contact.email}</p>
                    {selectedHospital.contact.website !== "N/A" && (
                      <a
                        href={selectedHospital.contact.website}
                        className="text-sm text-mainBlue hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {selectedHospital.contact.website}
                      </a>
                    )}
                    <Link
                      href={`/hospitals/${selectedHospital.id}`}
                      className="block text-sm text-mainBlue hover:underline mt-1"
                    >
                      View Details
                    </Link>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          )}
        </div>

        {/* Nearby Hospitals List */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
            Nearby Hospitals
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faSpinner} className="text-3xl text-mainBlue animate-spin mb-2" />
              <p className="text-gray-600">Searching for nearby hospitals...</p>
            </div>
          ) : apiError ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Error Loading Hospitals</h3>
              <p className="text-gray-600 mb-4">{apiError}</p>
              <button
                onClick={fetchHospitals}
                className="text-mainBlue hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : nearbyHospitals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Hospitals Found Nearby</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any hospitals within {searchRadius} km of your location. Try increasing your search radius or exploring hospitals in a different area.
              </p>
              <div className="flex justify-center">
                <Link href="/hospitals" className="text-mainBlue hover:underline">
                  View All Hospitals
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyHospitals.map((hospital) => (
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
                    <div className="absolute bottom-3 left-3 bg-mainBlue/90 py-1 px-3 rounded-full shadow-md">
                      <p className="text-white text-sm font-medium">
                        {hospital.distance?.toFixed(2)} km away
                      </p>
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
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/hospitals/${hospital.id}`}
                        className="text-mainBlue hover:text-deepBlue transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                      <span className="text-sm text-gray-500">{hospital.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default NearHospitalsPage;