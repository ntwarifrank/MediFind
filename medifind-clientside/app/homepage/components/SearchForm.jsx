import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const SearchForm = () => {
  // Data for form options
  const districts = [
    "Nyarugenge", "Gasabo", "Kicukiro", "Nyanza", "Gisagara", 
    "Nyaruguru", "Huye", "Nyamagabe", "Ruhango", "Muhanga", 
    "Kamonyi", "Karongi", "Rutsiro", "Rubavu", "Nyabihu",
    "Ngororero", "Rusizi", "Nyamasheke", "Rulindo", "Gakenke",
    "Musanze", "Burera", "Gicumbi", "Rwamagana", "Nyagatare",
    "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Bugesera"
  ];
  
  const specialties = [
    "General Medicine", "Cardiology", "Pediatrics", "Obstetrics & Gynecology",
    "Orthopedics", "Neurology", "Oncology", "Dermatology", "Ophthalmology",
    "ENT", "Urology", "Psychiatry", "Dental Care"
  ];
  
  const facilityTypes = [
    "Hospitals", "Health Centers", "Clinics", "Pharmacies", "Laboratories"
  ];
  
  const [formData, setFormData] = useState({
    district: "",
    specialty: "",
    facilityType: ""
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Search submitted:", formData);
  };
  
  return (
    <div className="w-full bg-whiteGray rounded-xl shadow-md transition-all duration-500 mb-10 py-6">
      <form onSubmit={handleSubmit} className="px-4 md:px-8">
        <div className="text-xl font-bold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-4">
          Find Healthcare Services
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="district">
              Location
            </label>
            <div className="relative">
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-mainBlue rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                required
              >
                <option value="">Select District</option>
                {districts.map((district, index) => (
                  <option key={index} value={district}>{district}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FontAwesomeIcon icon={faChevronRight} className="text-mainBlue" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="specialty">
              Medical Specialty
            </label>
            <div className="relative">
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-mainBlue rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-mainBlue"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>{specialty}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FontAwesomeIcon icon={faChevronRight} className="text-mainBlue" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="facilityType">
              Facility Type
            </label>
            <div className="relative">
              <select
                id="facilityType"
                name="facilityType"
                value={formData.facilityType}
                onChange={handleChange}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-mainBlue rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-mainBlue"
              >
                <option value="">All Facilities</option>
                {facilityTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FontAwesomeIcon icon={faChevronRight} className="text-mainBlue" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-gradient-to-tr from-mainBlue to-deepBlue text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSearch} /> Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
