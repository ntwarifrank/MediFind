import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPersonWalkingDashedLineArrowRight,
  faLungs,
  faBacterium,
  faViruses,
  faHeartbeat,
  faUserMd,
  faPills,
  faAmbulance
} from "@fortawesome/free-solid-svg-icons";

const ServicesSection = () => {
  const services = [
    {
      icon: faPersonWalkingDashedLineArrowRight,
      title: "Health Checkups",
      description: "Comprehensive health assessments and screenings to monitor your overall wellbeing and prevent illness."
    },
    {
      icon: faLungs,
      title: "Surgical Procedures",
      description: "Advanced surgical capabilities from minor procedures to complex operations with skilled medical teams."
    },
    {
      icon: faBacterium,
      title: "Diagnostic Tests",
      description: "Modern laboratory services for accurate diagnosis including blood work, imaging, and specialized tests."
    },
    {
      icon: faViruses,
      title: "Cancer Screening",
      description: "Early detection and monitoring services for various types of cancer to ensure timely treatment."
    },
    {
      icon: faHeartbeat,
      title: "Cardiac Care",
      description: "Specialized cardiac services including ECG, stress tests, and consultations with cardiologists."
    },
    {
      icon: faUserMd,
      title: "Specialist Consultations",
      description: "Access to a wide network of medical specialists across various healthcare disciplines."
    },
    {
      icon: faPills,
      title: "Pharmacy Services",
      description: "Medication dispensing, consultation, and advice from registered pharmacists across Rwanda."
    },
    {
      icon: faAmbulance,
      title: "Emergency Services",
      description: "Information on emergency departments and ambulance services available 24/7."
    }
  ];

  return (
    <div className="w-full bg-whiteGray mb-16 px-4 md:px-10 py-8 rounded-lg" aria-labelledby="services-heading">
      <div className="mb-6">
        <h2 id="services-heading" className="text-2xl font-extrabold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent">
          Our Healthcare Services
        </h2>
        <p className="text-gray-600 mt-2">Discover the range of medical services available through our network of healthcare providers</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.slice(0, 4).map((service, index) => (
          <div key={index} className="bg-white py-6 px-4 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-4">
              <FontAwesomeIcon icon={service.icon} className="text-4xl text-mainBlue" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-xl text-center bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-center text-gray-600">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {services.slice(4).map((service, index) => (
          <div key={index} className="bg-white py-6 px-4 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-4">
              <FontAwesomeIcon icon={service.icon} className="text-4xl text-mainBlue" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-xl text-center bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-center text-gray-600">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
