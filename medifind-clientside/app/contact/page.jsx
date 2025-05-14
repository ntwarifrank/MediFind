"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Nav from "../nav/page";
import Footer from "../homepage/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faMobileAlt,
  faFax,
  faUserDoctor,
  faCircleQuestion
} from "@fortawesome/free-solid-svg-icons";

import { faFacebook, faTwitter, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";


const MapComponent = () => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
  };
  
  // Coordinates for Kigali City Tower, Rwanda
  const center = {
    lat: -1.9536,
    lng: 30.0606
  };
  
  const options = {
    disableDefaultUI: true,
    zoomControl: true,
  };
  
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={options}
      >
        <MarkerF position={center} />
      </GoogleMap>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formStatus, setFormStatus] = useState(null);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Add your API key in your .env.local file
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send the form data to an API
    console.log("Form submitted:", formData);
    
    // Simulate a successful form submission
    setFormStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    // Clear the success message after 5 seconds
    setTimeout(() => setFormStatus(null), 5000);
  };

  const contactInfo = [
    {
      icon: faMapMarkerAlt,
      title: "Our Location",
      details: "Kigali City Tower, KG 2 Ave, Kigali, Rwanda"
    },
    {
      icon: faEnvelope,
      title: "Email Us",
      details: "info@medifind.rw",
      link: "mailto:info@medifind.rw"
    },
    {
      icon: faPhone,
      title: "Call Us",
      details: "+250 780 000 000",
      link: "tel:+250780000000"
    },
    {
      icon: faClock,
      title: "Working Hours",
      details: "Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM"
    }
  ];

  const faqItems = [
    {
      question: "How do I find a hospital near me?",
      answer: "You can use our search feature on the homepage to find hospitals and healthcare facilities near you. Simply enter your location or select your district from the dropdown menu."
    },
    {
      question: "Is MediFind service free to use?",
      answer: "Yes, MediFind is completely free for patients to use. We help you find and connect with healthcare providers across Rwanda at no cost."
    },
    {
      question: "How can hospitals join the MediFind platform?",
      answer: "Healthcare facilities interested in joining our platform can contact us through this form or email us at partners@medifind.rw for more information about our partnership program."
    },
    {
      question: "Can I book appointments through MediFind?",
      answer: "Yes, for partner facilities that support online booking, you can schedule appointments directly through our platform. Look for the 'Book Appointment' button on the facility's profile page."
    }
  ];

  return (
    <div className="w-full bg-mainWhite">
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto">
        {/* Navigation */}
        <Nav />
        
        {/* Hero Section */}
        <div className="w-full py-16 md:py-20 px-4 md:px-8 bg-gradient-to-r from-mainBlue/10 to-deepBlue/10 rounded-lg mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
              Contact Us
            </h1>
            <p className="text-gray-700 text-lg mb-6">
              We'd love to hear from you. Get in touch with our team for any questions, feedback, or support.
            </p>
          </div>
        </div>

        {/* Contact Info and Form Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
                Get In Touch
              </h2>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-whiteGray flex items-center justify-center mr-4 flex-shrink-0">
                        <FontAwesomeIcon icon={item.icon} className="text-xl text-mainBlue" />
                      </div>
                      <div>
                        <h3 className="font-bold text-DarkBlue mb-1">{item.title}</h3>
                        {item.link ? (
                          <a href={item.link} className="text-gray-700 hover:text-mainBlue transition-colors">
                            {item.details}
                          </a>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-line">{item.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-xl text-DarkBlue mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-deepBlue transition-colors">
                    <span className="text-white"><FontAwesomeIcon icon={faFacebook} className="w-8 h-8"></FontAwesomeIcon></span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-deepBlue transition-colors">
                    <span className="text-white"><FontAwesomeIcon icon={faInstagram} className="w-8 h-8"></FontAwesomeIcon></span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-deepBlue transition-colors">
                    <span className="text-white"><FontAwesomeIcon icon={faTwitter} className="w-8 h-8"></FontAwesomeIcon></span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-deepBlue transition-colors">
                    <span className="text-white"><FontAwesomeIcon icon={faLinkedin} className="w-8 h-8"></FontAwesomeIcon></span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
                Send a Message
              </h2>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                {formStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Your Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Your Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                    <textarea 
                      id="message" 
                      rows="5" 
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                      placeholder="Tell us about your inquiry..."
                      required
                    ></textarea>
                  </div>
                  <div className="text-right">
                    <button 
                      type="submit" 
                      className="bg-gradient-to-tr from-mainBlue to-deepBlue text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-mainBlue/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <FontAwesomeIcon icon={faCircleQuestion} className="text-mainBlue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-DarkBlue mb-2">{item.question}</h3>
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Banner */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-mainBlue/10 to-deepBlue/10 p-4 rounded-lg flex items-center">
            <div className="w-12 h-12 rounded-full bg-mainBlue flex items-center justify-center mr-4 flex-shrink-0">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-DarkBlue">Our New Location</h3>
              <p className="text-gray-700">We are now located at <span className="font-semibold">Kigali City Tower, KG 2 Ave, Kigali, Rwanda</span></p>
            </div>
          </div>
        </div>
        
        {/* Google Map Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
            Find Us Here
          </h2>
          <div className="bg-white rounded-lg shadow-md p-2 h-[400px]">
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-600">Loading Map...</p>
              </div>
            ) : loadError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-red-500">Error loading maps. Please try again later.</p>
              </div>
            ) : (
              <MapComponent />
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default ContactPage;
