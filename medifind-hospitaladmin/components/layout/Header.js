import React, { useState } from 'react';

const Header = ({ title, onMenuClick }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  return (
    <header className="bg-white shadow-sm px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center rounded-lg">
      <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="md:hidden mr-4 p-2 rounded-lg hover:bg-whiteGray transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-DarkBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-DarkBlue truncate">{title}</h1>
        </div>
        
        {/* Mobile search toggle */}
        <button 
          className="p-2 md:hidden rounded-full hover:bg-whiteGray transition-colors"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          aria-label="Toggle search"
        >
          <svg
            className="w-5 h-5 text-mainGray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile Search (Full Width) */}
      {showMobileSearch && (
        <div className="w-full mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-whiteGray w-full py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
            />
            <svg
              className="w-5 h-5 text-mainGray absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-4 mt-3 md:mt-0">
        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-whiteGray transition-colors" aria-label="Notifications">
            <svg
              className="w-6 h-6 text-mainGray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
        
        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="bg-whiteGray py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mainBlue/50 w-48 lg:w-64"
          />
          <svg
            className="w-5 h-5 text-mainGray absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        {/* Help Button */}
        <button className="p-2 rounded-full hover:bg-whiteGray transition-colors hidden sm:block">
          <svg
            className="w-6 h-6 text-mainGray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
