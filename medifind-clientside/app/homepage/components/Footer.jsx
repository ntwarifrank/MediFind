import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope,
  faChevronRight 
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setSubscriptionStatus("success");
    setEmail("");
    setTimeout(() => setSubscriptionStatus(""), 3000);
  };

  return (
    <footer className="w-full bg-DarkBlue text-white py-10 px-4 md:px-10 rounded-lg mt-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold mb-4">MediFind</h3>
          <p className="text-gray-300 mb-4">
            The premier platform for finding and connecting with healthcare services in Rwanda.
          </p>
          <div className="flex space-x-4">
            <a href="https://facebook.com/medifindrwanda" aria-label="MediFind on Facebook" className="w-8 h-8 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
              <FontAwesomeIcon icon={faFacebookF} aria-hidden="true" />
            </a>
            <a href="https://twitter.com/medifindrwanda" aria-label="MediFind on Twitter" className="w-8 h-8 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
              <FontAwesomeIcon icon={faTwitter} aria-hidden="true" />
            </a>
            <a href="https://instagram.com/medifindrwanda" aria-label="MediFind on Instagram" className="w-8 h-8 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
              <FontAwesomeIcon icon={faInstagram} aria-hidden="true" />
            </a>
            <a href="https://linkedin.com/company/medifind-rwanda" aria-label="MediFind on LinkedIn" className="w-8 h-8 rounded-full bg-mainBlue flex items-center justify-center hover:bg-blue-600 transition-all">
              <FontAwesomeIcon icon={faLinkedinIn} aria-hidden="true" />
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> About Us
              </Link>
            </li>
            <li>
              <Link href="/services" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> Our Services
              </Link>
            </li>
            <li>
              <Link href="/hospitals" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> Find Hospitals
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> Contact Us
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-4">Healthcare</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/health-centers" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> Health Centers
              </Link>
            </li>
            <li>
              <Link href="/pharmacies" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> Pharmacies
              </Link>
            </li>
            <li>
              <Link href="/specialists" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> Medical Specialists
              </Link>
            </li>
            <li>
              <Link href="/emergency" className="text-gray-300 hover:text-white transition-all inline-flex items-center">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs mr-2" aria-hidden="true" /> Emergency Services
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-4">Newsletter</h3>
          <p className="text-gray-300 mb-4">
            Subscribe to our newsletter for health tips and updates.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex">
            <div className="relative flex-grow mr-2">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                placeholder="Your email"
                required
                aria-label="Email for newsletter"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-tr from-mainBlue to-deepBlue text-white px-6 py-3 rounded-lg hover:shadow-md transition-all"
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </button>
          </form>
          {subscriptionStatus === "success" && (
            <p className="text-green-400 mt-2">Thank you for subscribing!</p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} MediFind. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/privacy-policy" className="hover:text-white transition-all">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-all">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-white transition-all">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
