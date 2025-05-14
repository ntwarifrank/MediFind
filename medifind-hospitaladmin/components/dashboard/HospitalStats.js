import React, { useState, useEffect } from 'react';

const HospitalStats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bedStats, setBedStats] = useState({
    available: 15,
    occupied: 85,
    total: 100,
    percentage: 85
  });
  
  // Sample data - would be fetched from an API in a real application
  const departmentStats = [
    { name: 'Cardiology', patients: 42, occupied: 85 },
    { name: 'Neurology', patients: 38, occupied: 76 },
    { name: 'Pediatrics', patients: 35, occupied: 70 },
    { name: 'Orthopedics', patients: 30, occupied: 60 },
    { name: 'Oncology', patients: 25, occupied: 50 },
  ];

  useEffect(() => {
    // Simulating API call to get bed availability data
    const fetchBedData = async () => {
      setIsLoading(true);
      try {
        // This would normally be an API call
        // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospital/beds`);
        // const data = await response.json();
        // setBedStats(data);
        
        // Using sample data instead
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching bed data:', error);
        setIsLoading(false);
      }
    };
    
    fetchBedData();
  }, []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Bed Availability */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4 md:p-6">
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-base md:text-lg font-semibold text-DarkBlue">Bed Availability</h2>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 my-4">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-mainBlue rounded-full"></div>
              </div>
            ) : (
              <>
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {/* Background circle */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E6EAF0"
                    strokeWidth="3"
                  />
                  {/* Progress circle */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4F6AF5"
                    strokeWidth="3"
                    strokeDasharray={`${bedStats.percentage}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-DarkBlue">{bedStats.percentage}%</span>
                  <span className="text-sm text-gray-500">Occupied</span>
                </div>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-4">
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-mainBlue mr-2"></span>
              <span className="text-sm text-DarkBlue">Available: <strong>{bedStats.total - bedStats.occupied}</strong></span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-gray-300 mr-2"></span>
              <span className="text-sm text-DarkBlue">Occupied: <strong>{bedStats.occupied}</strong></span>
            </div>
          </div>
        </div>
      </div>
            
      {/* Department Statistics */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-DarkBlue">Department Statistics</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            {departmentStats.map((dept, index) => (
              <li key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-DarkBlue">{dept.name}</span>
                  <span className="text-sm text-mainGray">{dept.patients} patients</span>
                </div>
                <div className="w-full bg-whiteGray rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-gradient-to-r from-mainBlue to-deepBlue" 
                    style={{ width: `${dept.occupied}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs text-mainGray">
                  <span>Capacity</span>
                  <span>{dept.occupied}% occupied</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bed Availability Chart */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-DarkBlue">Bed Availability</h2>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-mainBlue mr-2"></div>
                <span className="text-xs text-mainGray">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-deepBlue mr-2"></div>
                <span className="text-xs text-mainGray">Occupied</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center">
          {/* Circular chart representation */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E2EDFF"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeDasharray="75, 100"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3A8EF6" />
                  <stop offset="100%" stopColor="#6F3AFA" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-DarkBlue">75%</span>
              <span className="text-sm text-mainGray">Occupancy Rate</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="bg-whiteGray rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-mainBlue">42</p>
              <p className="text-xs text-mainGray">Available Beds</p>
            </div>
            <div className="bg-whiteGray rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-deepBlue">128</p>
              <p className="text-xs text-mainGray">Total Beds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalStats;
