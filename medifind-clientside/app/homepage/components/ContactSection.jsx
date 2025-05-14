import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faClock, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import mediFindHouse from "../../../public/medifindheadquorter.jpeg";

const ContactSection = () => {
  return (
    <div className="w-full mb-16 bg-white rounded-lg shadow-md overflow-hidden" aria-labelledby="contact-heading">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
          <Image 
            src={mediFindHouse} 
            alt="MediFind Headquarters in Kigali" 
            className="object-cover h-full w-full" 
            loading="lazy"
          />
        </div>
        
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h2 id="contact-heading" className="text-2xl font-bold bg-gradient-to-tr from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
            Contact Us
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-whiteGray flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-mainBlue" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-DarkBlue">Our Location</h3>
                <p className="text-gray-600">Kigali Heights, KG 7 Ave, Kigali, Rwanda</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-whiteGray flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-mainBlue" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-DarkBlue">Email Us</h3>
                <a href="mailto:info@medifind.rw" className="text-mainBlue hover:underline">info@medifind.rw</a>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-whiteGray flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faPhone} className="text-mainBlue" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-DarkBlue">Call Us</h3>
                <a href="tel:+250780000000" className="text-mainBlue hover:underline">+250 780 000 000</a>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-whiteGray flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faClock} className="text-mainBlue" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-DarkBlue">Working Hours</h3>
                <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
