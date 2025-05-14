"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "../nav/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStethoscope,
  faUserMd,
  faHospital,
  faUsers,
  faCheckCircle,
  faAward,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

import { faFacebook, faTwitter, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

// Sample team members
const teamMembers = [
  {
    name: "Dr. Jean Pierre Habimana",
    position: "Founder & CEO",
    bio: "Dr. Habimana has over 15 years of experience in healthcare management and policy in Rwanda.",
    image: "/team-member1.jpg"
  },
  {
    name: "Claire Uwase",
    position: "Chief Technology Officer",
    bio: "Claire leads our technology team, bringing innovative solutions to Rwanda's healthcare system.",
    image: "/team-member2.jpg"
  },
  {
    name: "Dr. Eric Mugabo",
    position: "Medical Director",
    bio: "Dr. Mugabo ensures all medical information on MediFind is accurate and up-to-date.",
    image: "/team-member3.jpg"
  },
  {
    name: "Diane Mutesi",
    position: "Head of Partnerships",
    bio: "Diane works with hospitals, clinics, and health organizations across Rwanda to expand our network.",
    image: "/team-member4.jpg"
  },
];

// Sample statistics
const stats = [
  { number: "300+", label: "Healthcare Facilities" },
  { number: "1500+", label: "Medical Professionals" },
  { number: "30", label: "Districts Covered" },
  { number: "50,000+", label: "Users Helped" },
];

const AboutPage = () => {
  return (
    <div className="w-full bg-mainWhite">
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto">
        {/* Navigation */}
        <Nav />
        
        {/* Hero Section */}
        <div className="w-full py-16 md:py-20 px-4 md:px-0 bg-gradient-to-r from-mainBlue/10 to-deepBlue/10 rounded-lg mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-6">
              About MediFind
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Connecting Rwandans with quality healthcare through innovative technology
            </p>
            <div className="flex justify-center gap-4">
              <Link href="#our-mission">
                <button className="bg-gradient-to-tr from-mainBlue to-deepBlue text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all">
                  Our Mission
                </button>
              </Link>
              <Link href="#our-team">
                <button className="border-2 border-mainBlue text-mainBlue px-6 py-3 rounded-xl hover:bg-whiteGray transition-all">
                  Meet Our Team
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-4">
                Our Story
              </h2>
              <p className="text-gray-700 mb-4">
                MediFind was founded in 2023 with a simple mission: to make healthcare more accessible to everyone in Rwanda. We recognized the challenges many people face when trying to find the right medical care, especially in rural areas.
              </p>
              <p className="text-gray-700 mb-4">
                Starting with just a handful of partnered hospitals in Kigali, we've grown to connect patients with healthcare facilities across all 30 districts of Rwanda. Our platform simplifies the process of finding hospitals, clinics, and specialists based on location and medical needs.
              </p>
              <p className="text-gray-700">
                Today, MediFind is Rwanda's leading healthcare directory, helping thousands of people access medical care every month. We continue to expand our services with the goal of improving healthcare outcomes throughout the country.
              </p>
            </div>
            <div className="w-full md:w-1/2 bg-whiteGray rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Our Mission Section */}
        <div id="our-mission" className="mb-20 scroll-mt-20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-8 text-center">
            Our Mission & Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-whiteGray rounded-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-mainBlue to-deepBlue rounded-full flex items-center justify-center text-white mb-4">
                <FontAwesomeIcon icon={faStethoscope} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-DarkBlue mb-3">Accessibility</h3>
              <p className="text-gray-700">
                Making quality healthcare accessible to all Rwandans regardless of their location or background.
              </p>
            </div>

            <div className="bg-whiteGray rounded-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-mainBlue to-deepBlue rounded-full flex items-center justify-center text-white mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-DarkBlue mb-3">Community</h3>
              <p className="text-gray-700">
                Building a healthier Rwanda by strengthening connections between patients and healthcare providers.
              </p>
            </div>

            <div className="bg-whiteGray rounded-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-mainBlue to-deepBlue rounded-full flex items-center justify-center text-white mb-4">
                <FontAwesomeIcon icon={faAward} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-DarkBlue mb-3">Excellence</h3>
              <p className="text-gray-700">
                Committing to accuracy, reliability, and continuous improvement in all our services.
              </p>
            </div>
          </div>
        </div>

        {/* Our Team Section */}
        <div id="our-team" className="mb-20 scroll-mt-20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-8 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {/* Use a placeholder or actual image when available */}
                  <div className="w-full h-full flex items-center justify-center bg-mainBlue/10">
                    <FontAwesomeIcon icon={faUserMd} className="text-5xl text-mainBlue" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-DarkBlue">{member.name}</h3>
                  <p className="text-mainBlue text-sm mb-2">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-8 text-center">
            Our Partners
          </h2>
          <div className="bg-whiteGray rounded-lg p-8">
            <div className="flex flex-wrap justify-center gap-8">
              <div className="w-32 h-16 bg-white rounded p-2 flex items-center justify-center">
                <p className="text-gray-400 font-medium">Ministry of Health</p>
              </div>
              <div className="w-32 h-16 bg-white rounded p-2 flex items-center justify-center">
                <p className="text-gray-400 font-medium">RBC</p>
              </div>
              <div className="w-32 h-16 bg-white rounded p-2 flex items-center justify-center">
                <p className="text-gray-400 font-medium">RSSB</p>
              </div>
              <div className="w-32 h-16 bg-white rounded p-2 flex items-center justify-center">
                <p className="text-gray-400 font-medium">WHO</p>
              </div>
              <div className="w-32 h-16 bg-white rounded p-2 flex items-center justify-center">
                <p className="text-gray-400 font-medium">UNICEF</p>
              </div>
              <div className="w-32 h-16 bg-white rounded p-2 flex items-center justify-center">
                <p className="text-gray-400 font-medium">African Union</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-mainBlue to-deepBlue bg-clip-text text-transparent mb-8 text-center">
            Get In Touch
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-whiteGray flex items-center justify-center mr-4">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-mainBlue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-DarkBlue">Our Location</h3>
                      <p className="text-gray-600">Kigali Heights, KG 7 Ave, Kigali, Rwanda</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-whiteGray flex items-center justify-center mr-4">
                      <FontAwesomeIcon icon={faEnvelope} className="text-mainBlue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-DarkBlue">Email Us</h3>
                      <a href="mailto:info@medifind.rw" className="text-mainBlue hover:underline">info@medifind.rw</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-whiteGray flex items-center justify-center mr-4">
                      <FontAwesomeIcon icon={faPhone} className="text-mainBlue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-DarkBlue">Call Us</h3>
                      <a href="tel:+250780000000" className="text-mainBlue hover:underline">+250 780 000 000</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Your Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Your Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                      placeholder="Enter subject"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                    <textarea 
                      id="message" 
                      rows="4" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
                      placeholder="Enter your message"
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

        {/* Footer Section */}
        <footer className="w-full bg-DarkBlue text-white py-10 px-4 md:px-10 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MediFind</h3>
              <p className="text-gray-300 mb-4">
                The premier platform for finding and connecting with healthcare services in Rwanda.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-all">Home</Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-all">About Us</Link>
                </li>
                <li>
                  <Link href="/hospitals" className="text-gray-300 hover:text-white transition-all">Find Hospitals</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-all">Contact Us</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-mainBlue" />
                  <span className="text-gray-300">Kigali Heights, Rwanda</span>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-mainBlue" />
                  <a href="tel:+250780000000" className="text-gray-300 hover:text-white transition-all">+250 780 000 000</a>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-mainBlue" />
                  <a href="mailto:info@medifind.rw" className="text-gray-300 hover:text-white transition-all">info@medifind.rw</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
                  <FontAwesomeIcon icon={faFacebook} className="text-white" />
                </a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
                  <FontAwesomeIcon icon={faTwitter} className="text-white" />
                </a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
                  <FontAwesomeIcon icon={faInstagram} className="text-white" />
                </a>
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
                  <FontAwesomeIcon icon={faLinkedin} className="text-white" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} MediFind. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;
