import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faHospital } from "@fortawesome/free-solid-svg-icons";
import mainPic from "../../../public/mainpic.png";

const HeroSection = ({ setIsSearchVisible }) => {
  return (
    <div className="w-full flex flex-col md:flex-row px-4 md:px-16 py-8 md:py-0">
      <div className="w-full md:w-[60%] pt-6 md:pt-20 px-0 md:px-4 order-2 md:order-1">
        <div>
          <h1 className="font-bold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent text-3xl md:text-4xl mb-4">
            Find Healthcare Services Near You
          </h1>
        </div>
        <div>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
            MediFind helps you quickly locate the right healthcare professionals and medical services across Rwanda. 
            Our platform connects you with hospitals, clinics, and specialists based on your location and needs.
          </p>
        </div>
        <div className="py-3 md:py-5 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setIsSearchVisible(prev => !prev)}
            className="bg-gradient-to-tr from-mainBlue to-deepBlue text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            aria-expanded="false"
          >
            <FontAwesomeIcon icon={faSearch} /> Find Healthcare
          </button>
          <Link href="#featured-facilities">
            <button className="border-2 border-mainBlue text-mainBlue px-6 py-3 rounded-xl hover:bg-whiteGray transition-all flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faHospital} /> Explore Facilities
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full md:w-[40%] mb-8 md:mb-0 order-1 md:order-2">
        <Image 
          src={mainPic} 
          alt="Healthcare professionals in Rwanda" 
          className="w-full h-full object-contain" 
          priority 
        />
      </div>
    </div>
  );
};

export default HeroSection;
