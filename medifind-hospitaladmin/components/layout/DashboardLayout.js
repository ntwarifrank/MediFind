import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="flex min-h-screen bg-whiteGray">
      <Sidebar isMobileOpen={isMobileOpen} onClose={toggleMobileMenu} />
      <div className="flex-1 md:ml-64 transition-all duration-300">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <Header title={title} onMenuClick={toggleMobileMenu} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
