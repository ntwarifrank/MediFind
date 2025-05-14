import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMobileAlt } from "@fortawesome/free-solid-svg-icons";
import mobileviewImage from "../../../public/mobile-view.png";
import Image from "next/image";

const AppPromoSection = () => {
  return (
    <div className="w-full mb-16 bg-gradient-to-tr from-mainBlue to-deepBlue rounded-lg py-10 px-6 text-white">
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-2/3 mb-6 md:mb-0">
          <h2 className="text-3xl font-bold mb-4">Download the MediFind App</h2>
          <p className="mb-6">
            Find healthcare providers on the go! Our mobile app makes it easy to locate hospitals, 
            clinics, and pharmacies wherever you are in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="bg-white text-mainBlue px-6 py-3 rounded-lg flex items-center justify-center hover:bg-whiteGray transition-all"
              aria-label="Download Android app"
            >
              <FontAwesomeIcon icon={faMobileAlt} className="mr-2" aria-hidden="true" /> Download for Android
            </button>
            <button 
              className="bg-white text-mainBlue px-6 py-3 rounded-lg flex items-center justify-center hover:bg-whiteGray transition-all"
              aria-label="Download iOS app"
            >
              <FontAwesomeIcon icon={faMobileAlt} className="mr-2" aria-hidden="true" /> Download for iOS
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
        
          <div className="w-48 h-80 bg-white rounded-xl shadow-lg border-8 border-white">
          <p className="text-mainBlue font-bold">MediFind Mobile</p>
            <div className="w-full h-[90%] bg-whiteGray rounded-md flex items-center justify-center overflow-hidden">
              <Image src={mobileviewImage} alt="mobile view" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPromoSection;
