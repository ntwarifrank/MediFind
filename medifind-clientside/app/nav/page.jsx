"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"
import Image from "next/image"

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Get user authentication context
  const { user, isAuthenticated, logout } = useAuth();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && e.target.closest('.mobile-menu-container') === null && e.target.closest('.hamburger-button') === null) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className={`sticky top-0 w-full z-50 py-3 px-4 md:px-6 lg:px-8 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="bg-gradient-to-br from-mainBlue to-deepBlue bg-clip-text text-transparent font-extrabold text-2xl md:text-3xl">
            MediFind
          </Link>
        </div>
        
        {/* Desktop Menu - Hidden on mobile */}
        <div className="hidden md:flex items-center">
          <ul className="flex space-x-6 mr-6 text-gray-700">
            <li>
              <Link href="/" className="hover:text-mainBlue transition-colors font-medium">Home</Link>
            </li>
            <li className="relative group">
              <div className="flex items-center cursor-pointer hover:text-mainBlue transition-colors font-medium">
                Hospitals
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Link href="/hospitals" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-mainBlue" role="menuitem">All Hospitals</Link>
                  <Link href="/near-hospitals" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-mainBlue" role="menuitem">Hospitals Near Me</Link>
                  <Link href="/hospital-search" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-mainBlue" role="menuitem">Search Hospitals</Link>
                  <Link href="/specialties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-mainBlue" role="menuitem">Find by Specialty</Link>
                </div>
              </div>
            </li>
            <li>
              <Link href="/appointments" className="hover:text-mainBlue transition-colors font-medium">Appointments</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-mainBlue transition-colors font-medium">About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-mainBlue transition-colors font-medium">Contact</Link>
            </li>
          </ul>
        </div>
        
        {/* Auth Buttons or User Menu - Hidden on mobile */}
        <div className="hidden md:flex space-x-3">
          {!isAuthenticated ? (
            // Not logged in - show login/signup buttons
            <>
              <Link href="/login">
                <button className="text-mainBlue border-2 border-mainBlue py-2 px-4 rounded-xl hover:bg-whiteGray transition-colors font-medium">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="text-white py-2 px-4 rounded-xl bg-gradient-to-tr from-mainBlue to-deepBlue hover:shadow-md transition-all font-medium">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            // Logged in - show user profile menu
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 py-1 px-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-mainBlue to-deepBlue flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.name ? user.name.split(' ')[0] : 'User'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link href="/my-appointments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Appointments
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="hamburger-button md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <div className="w-6 flex items-center justify-center relative">
            <span className={`transform transition-all duration-300 h-0.5 w-full bg-current absolute ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`}></span>
            <span className={`transform transition-all duration-300 h-0.5 w-full bg-current absolute ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`transform transition-all duration-300 h-0.5 w-full bg-current absolute ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`}></span>
          </div>
        </button>
      </div>
      
      {/* Mobile Menu Dropdown */}
      <div
        className={`mobile-menu-container md:hidden absolute left-0 right-0 z-20 bg-white shadow-lg transition-all duration-300 transform origin-top ${
          isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3">
          <ul className="flex flex-col space-y-4 mb-6">
            <li>
              <Link href="/" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            
            {/* Mobile Hospitals Accordion */}
            <li>
              <div 
                className="flex justify-between items-center text-gray-700 hover:text-mainBlue transition-colors py-1 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  const submenu = e.currentTarget.nextElementSibling;
                  submenu.classList.toggle('hidden');
                }}
              >
                <span>Hospitals</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <ul className="pl-4 mt-2 hidden">
                <li className="mb-2">
                  <Link href="/hospitals" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                    All Hospitals
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/near-hospitals" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                    Hospitals Near Me
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/hospital-search" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                    Search Hospitals
                  </Link>
                </li>
                <li>
                  <Link href="/specialties" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                    Find by Specialty
                  </Link>
                </li>
              </ul>
            </li>
            
            <li>
              <Link href="/appointments" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                Appointments
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-700 hover:text-mainBlue transition-colors block py-1" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
            </li>
          </ul>
          
          <div className="flex flex-col space-y-3 pb-4">
            {!isAuthenticated ? (
              // Not logged in - show login/signup buttons
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full text-mainBlue border-2 border-mainBlue py-2 px-4 rounded-xl hover:bg-whiteGray transition-colors text-center">
                    Login
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full text-white py-2 px-4 rounded-xl bg-gradient-to-tr from-mainBlue to-deepBlue hover:shadow-md transition-all text-center">
                    Sign Up
                  </button>
                </Link>
              </>
            ) : (
              // Logged in - show profile and logout options
              <>
                <div className="flex items-center space-x-3 px-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-mainBlue to-deepBlue flex items-center justify-center text-white font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{user?.name || 'User'}</span>
                    <span className="text-sm text-gray-500">{user?.email || ''}</span>
                  </div>
                </div>
                
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full text-left px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    My Profile
                  </button>
                </Link>
                
                <Link href="/my-appointments" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full text-left px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    My Appointments
                  </button>
                </Link>
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;