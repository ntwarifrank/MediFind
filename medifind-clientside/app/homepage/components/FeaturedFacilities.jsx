import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useState , useEffect} from "react";
import axios from "axios";
import Image from "next/image";

const FeaturedFacilities = () => {

  const [featuredHospitals, setFeaturedHospitals] = useState([])

   const fetchHospitals = async () => {
      try {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals`);
          setFeaturedHospitals(response.data.hospitals?.hospitals || []);
        } catch (error) {
          console.error('Error fetching hospitals:', error);
          setMessage({ type: 'error', text: 'Failed to load hospitals' });
        } finally {
          setLoading(false);
        }
  
       
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        if (error.code === 'ERR_NETWORK') {
          setError('Failed to connect to the server. This may be due to a CORS issue or the server being unreachable.');
        } else {
          setError(error.message || 'Failed to load hospitals. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch hospitals on component mount
    useEffect(() => {
      fetchHospitals();
    }, []);

 

  const handleBookAppointment = (hospitalName) => {
    alert(`Booking appointment at ${hospitalName}. This would open a booking form in a real application.`);
  };

  return (
    <div id="featured-facilities" className="w-full mb-16" aria-labelledby="featured-facilities-heading">
      <h2 id="featured-facilities-heading" className="text-2xl font-bold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
        Featured Healthcare Facilities
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredHospitals.map((hospital, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
            aria-label={`${hospital.name} in ${hospital.location}`}
          >
            <div className="h-48 overflow-hidden">
              <Image
                src={hospital.images[0]} 
                width={100}
                height={100}
                alt={`${hospital.name} facility`} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-DarkBlue">{hospital.name}</h3>
              <div className="flex items-center mt-1 mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-mainBlue mr-1" aria-hidden="true" />
                <span className="text-sm text-gray-600">{hospital.location}</span>
                <div className="ml-auto flex items-center">
                  <span className="text-sm font-medium text-mainBlue mr-1">{hospital.rating}</span>
                  <span className="text-yellow-500" aria-label={`Rating: ${hospital.rating} out of 5 stars`}>★</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-500">Specialties:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hospital.specialties.slice(0,2).map((specialty, i) => (
                    <span key={i} className="bg-whiteGray text-mainBlue text-xs px-2 py-1 rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleBookAppointment(hospital.name)}
                className="w-full bg-gradient-to-tr from-mainBlue to-deepBlue text-white py-2 rounded-lg text-sm hover:shadow-md transition-all"
                aria-label={`Book appointment at ${hospital.name}`}
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/hospitals">
          <button className="bg-white border-2 border-mainBlue text-mainBlue px-6 py-2 rounded-lg hover:bg-whiteGray transition-all inline-flex items-center" aria-label="View all healthcare facilities">
            View All Facilities <FontAwesomeIcon icon={faChevronRight} className="ml-2" aria-hidden="true" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedFacilities;
