import React, { useState, useEffect } from 'react';

const RecentAppointments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // This would be an API call in production
        // const response = await fetch('http://localhost:5002/api/appointments/recent');
        // const data = await response.json();
        // setAppointments(data);
        
        // Using sample data for now
        setTimeout(() => {
          setAppointments(sampleAppointments);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  // Sample data - would be fetched from an API in a real application
  const sampleAppointments = [
    {
      id: 1,
      patient: 'John Doe',
      avatar: '/images/avatar1.jpg',
      date: 'Today, 10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      status: 'Confirmed',
    },
    {
      id: 2,
      patient: 'Emma Wilson',
      avatar: '/images/avatar2.jpg',
      date: 'Today, 11:30 AM',
      doctor: 'Dr. Michael Chen',
      department: 'Neurology',
      status: 'In Progress',
    },
    {
      id: 3,
      patient: 'Robert Brown',
      avatar: '/images/avatar3.jpg',
      date: 'Today, 2:15 PM',
      doctor: 'Dr. Lisa Wong',
      department: 'Orthopedics',
      status: 'Pending',
    },
    {
      id: 4,
      patient: 'Maria Garcia',
      avatar: '/images/avatar4.jpg',
      date: 'Tomorrow, 9:00 AM',
      doctor: 'Dr. James Miller',
      department: 'Pediatrics',
      status: 'Confirmed',
    },
    {
      id: 5,
      patient: 'David Kim',
      avatar: '/images/avatar5.jpg',
      date: 'Tomorrow, 3:30 PM',
      doctor: 'Dr. Emily Taylor',
      department: 'Dermatology',
      status: 'Confirmed',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-base md:text-lg font-semibold text-DarkBlue">Recent Appointments</h2>
        <button className="text-sm font-medium text-mainBlue hover:text-deepBlue transition-colors">
          View All
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No appointments found
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-mainGray uppercase tracking-wider">Patient</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-mainGray uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-mainGray uppercase tracking-wider hidden md:table-cell">Doctor</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-mainGray uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-mainGray uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-mainBlue bg-opacity-10 flex items-center justify-center text-mainBlue font-medium">
                          {appointment.patient.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-3 md:ml-4">
                        <div className="text-xs md:text-sm font-medium text-DarkBlue">{appointment.patient}</div>
                        <div className="text-xs md:text-sm text-mainGray hidden md:block">{appointment.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-DarkBlue">{appointment.date}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-DarkBlue">{appointment.doctor}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                    <button className="text-mainBlue hover:text-deepBlue mr-2 md:mr-3 bg-mainBlue bg-opacity-10 hover:bg-opacity-20 rounded px-2 py-1 transition-colors">
                      <span className="hidden md:inline">View</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="text-mainGray hover:text-DarkBlue bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors">
                      <span className="hidden md:inline">Edit</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentAppointments;
