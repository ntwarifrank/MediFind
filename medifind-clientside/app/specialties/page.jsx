"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Nav from "../nav/page";
import Footer from "../homepage/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faStethoscope,
  faHeartbeat,
  faBrain,
  faBone,
  faLungs,
  faKidney,
  faEye,
  faTooth,
  faBaby,
  faAllergies,
  faMicroscope,
  faAmbulance,
  faSearch,
  faHospital
} from "@fortawesome/free-solid-svg-icons";

// Sample hospital/facility data
const hospitals = [
  {
    id: 1,
    name: "King Faisal Hospital",
    location: "Kigali, Kacyiru",
    type: "Referral Hospital",
    specialties: ["Cardiology", "Neurology", "Oncology", "Pediatrics"],
    rating: 4.8,
    image: "/hospital1.jpg"
  },
  {
    id: 2,
    name: "Rwanda Military Hospital",
    location: "Kigali, Kanombe",
    type: "Referral Hospital",
    specialties: ["Orthopedics", "General Surgery", "Internal Medicine"],
    rating: 4.5,
    image: "/hospital2.jpg"
  },
  {
    id: 3,
    name: "Butaro Hospital",
    location: "Burera District",
    type: "District Hospital",
    specialties: ["Oncology", "General Medicine", "Surgery"],
    rating: 4.9,
    image: "/hospital3.jpg"
  },
  {
    id: 4,
    name: "Kibagabaga Hospital",
    location: "Kigali, Gasabo",
    type: "District Hospital",
    specialties: ["Maternity", "Pediatrics", "General Medicine"],
    rating: 4.3,
    image: "/hospital4.jpg"
  },
  {
    id: 5,
    name: "Masaka Hospital",
    location: "Kigali, Masaka",
    type: "District Hospital",
    specialties: ["General Medicine", "Obstetrics", "Emergency Care"],
    rating: 4.2,
    image: "/hospital5.jpg"
  },
  {
    id: 6,
    name: "CHUK (Centre Hospitalier Universitaire de Kigali)",
    location: "Kigali, Nyarugenge",
    type: "Referral Hospital",
    specialties: ["Cardiology", "Neurology", "General Surgery", "Pediatrics"],
    rating: 4.4,
    image: "/hospital6.jpg"
  },
  {
    id: 7,
    name: "Muhima Hospital",
    location: "Kigali, Nyarugenge",
    type: "District Hospital",
    specialties: ["Maternity", "Gynecology", "Pediatrics"],
    rating: 4.1,
    image: "/hospital7.jpg"
  },
  {
    id: 8,
    name: "Ruhengeri Hospital",
    location: "Musanze District",
    type: "District Hospital",
    specialties: ["General Medicine", "Surgery", "Pediatrics"],
    rating: 4.3,
    image: "/hospital8.jpg"
  }
];

// Define specialty categories with icons
const specialtyCategories = [
  {
    id: "cardiology",
    name: "Cardiology",
    icon: faHeartbeat,
    description: "Diagnosis and treatment of heart diseases and cardiovascular conditions.",
    color: "bg-red-100",
    iconColor: "text-red-500"
  },
  {
    id: "neurology",
    name: "Neurology",
    icon: faBrain,
    description: "Care for disorders of the nervous system, including the brain and spinal cord.",
    color: "bg-purple-100",
    iconColor: "text-purple-500"
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    icon: faBone,
    description: "Treatment of conditions involving the musculoskeletal system.",
    color: "bg-blue-100",
    iconColor: "text-blue-500"
  },
  {
    id: "pulmonology",
    name: "Pulmonology",
    icon: faLungs,
    description: "Diagnosis and treatment of lung diseases and respiratory tract conditions.",
    color: "bg-sky-100",
    iconColor: "text-sky-500"
  },
  {
    id: "nephrology",
    name: "Nephrology",
    icon: faKidney,
    description: "Care for kidney diseases and kidney health management.",
    color: "bg-green-100",
    iconColor: "text-green-500"
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    icon: faEye,
    description: "Medical and surgical eye care and vision health.",
    color: "bg-amber-100",
    iconColor: "text-amber-500"
  },
  {
    id: "dentistry",
    name: "Dentistry",
    icon: faTooth,
    description: "Care for oral health including teeth, gums, and related structures.",
    color: "bg-gray-100",
    iconColor: "text-gray-500"
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    icon: faBaby,
    description: "Medical care for infants, children, and adolescents.",
    color: "bg-pink-100",
    iconColor: "text-pink-500"
  },
  {
    id: "oncology",
    name: "Oncology",
    icon: faMicroscope,
    description: "Diagnosis and treatment of cancer and tumors.",
    color: "bg-indigo-100",
    iconColor: "text-indigo-500"
  },
  {
    id: "emergency",
    name: "Emergency Care",
    icon: faAmbulance,
    description: "Immediate care for acute illnesses, injuries, and urgent medical conditions.",
    color: "bg-orange-100",
    iconColor: "text-orange-500"
  },
  {
    id: "internal-medicine",
    name: "Internal Medicine",
    icon: faStethoscope,
    description: "Diagnosis and nonsurgical treatment of diseases in adults.",
    color: "bg-teal-100",
    iconColor: "text-teal-500"
  },
  {
    id: "allergies",
    name: "Allergies & Immunology",
    icon: faAllergies,
    description: "Management of allergies, asthma, and immune system disorders.",
    color: "bg-lime-100",
    iconColor: "text-lime-500"
  }
];

// Map real specialties from hospital data to our category IDs
const specialtyMapping = {
  "Cardiology": "cardiology",
  "Neurology": "neurology",
  "Orthopedics": "orthopedics",
  "Pediatrics": "pediatrics",
  "Oncology": "oncology",
  "General Surgery": "internal-medicine",
  "Internal Medicine": "internal-medicine",
  "General Medicine": "internal-medicine",
  "Emergency Care": "emergency",
  "Maternity": "pediatrics",
  "Gynecology": "internal-medicine",
  "Obstetrics": "pediatrics",
  "Surgery": "internal-medicine"
};

const SpecialtiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  
  // Filter specialties based on search term
  const filteredSpecialties = searchTerm ? 
    specialtyCategories.filter(specialty => 
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) : 
    specialtyCategories;
    
  // Get hospitals based on selected specialty
  const getHospitalsBySpecialty = (specialtyId) => {
    if (!specialtyId) return [];
    
    return hospitals.filter(hospital => {
      return hospital.specialties.some(spec => {
        return specialtyMapping[spec] === specialtyId;
      });
    }).sort((a, b) => b.rating - a.rating); // Sort by rating (highest first)
  };
  
  const specialtyHospitals = selectedSpecialty ? 
    getHospitalsBySpecialty(selectedSpecialty) : 
    [];

  return (
    <div className="w-full bg-mainWhite">
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto">
        {/* Navigation */}
        <Nav />

        {/* Hero Section */}
        <div className="w-full py-12 md:py-16 px-4 md:px-8 bg-gradient-to-r from-mainBlue/10 to-deepBlue/10 rounded-lg mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-4">
              Find Hospitals by Specialty
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Select a medical specialty to find hospitals that provide the specific healthcare services you need.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a specialty..."
                className="w-full px-5 py-4 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Specialties Grid */}
        {!selectedSpecialty && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
              Medical Specialties
            </h2>
            
            {filteredSpecialties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FontAwesomeIcon icon={faStethoscope} className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Specialties Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any specialties matching your search. Please try a different search term.
                </p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-mainBlue hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredSpecialties.map((specialty) => (
                  <div 
                    key={specialty.id} 
                    className={`${specialty.color} rounded-lg shadow-md p-6 transition-transform hover:scale-105 hover:shadow-lg cursor-pointer`}
                    onClick={() => setSelectedSpecialty(specialty.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full ${specialty.iconColor} bg-white flex items-center justify-center mb-4`}>
                        <FontAwesomeIcon icon={specialty.icon} className="text-2xl" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{specialty.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{specialty.description}</p>
                      <div className="text-mainBlue font-medium text-sm">
                        {getHospitalsBySpecialty(specialty.id).length} Hospitals Available
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Selected Specialty Hospitals */}
        {selectedSpecialty && (
          <div className="mb-20">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setSelectedSpecialty(null)}
                className="mr-4 text-mainBlue hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Specialties
              </button>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent">
                {specialtyCategories.find(s => s.id === selectedSpecialty)?.name} Hospitals
              </h2>
            </div>
            
            {specialtyHospitals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FontAwesomeIcon icon={faHospital} className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Hospitals Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any hospitals that specialize in {specialtyCategories.find(s => s.id === selectedSpecialty)?.name}.
                </p>
                <button 
                  onClick={() => setSelectedSpecialty(null)}
                  className="text-mainBlue hover:underline"
                >
                  Go back to all specialties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialtyHospitals.map((hospital) => (
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-bold">{hospital.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{hospital.name}</h3>
                      <div className="flex items-start mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-mainBlue mt-1 mr-2" />
                        <p className="text-sm text-gray-600">{hospital.location}</p>
                      </div>
                      <div className="flex items-start mb-3">
                        <FontAwesomeIcon icon={faStethoscope} className="text-mainBlue mt-1 mr-2" />
                        <p className="text-sm text-gray-600 truncate">
                          {hospital.specialties.filter(spec => specialtyMapping[spec] === selectedSpecialty)[0]}
                          {hospital.specialties.filter(spec => specialtyMapping[spec] === selectedSpecialty).length > 1 ? 
                            ` + ${hospital.specialties.filter(spec => specialtyMapping[spec] === selectedSpecialty).length - 1} more` : ''}
                        </p>
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
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default SpecialtiesPage;
