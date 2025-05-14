import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const EventsNotifications = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // State for new event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'meeting',
    description: ''
  });
  
  // Sample data - would be fetched from an API in a real application
  const sampleEvents = [
    {
      id: 1,
      title: 'Staff Meeting',
      date: 'Today, 4:00 PM',
      location: 'Conference Room A',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Medical Training',
      date: 'Tomorrow, 9:00 AM',
      location: 'Training Center',
      type: 'training'
    },
    {
      id: 3,
      title: 'Inventory Check',
      date: 'May 8, 2:00 PM',
      location: 'Storage Room',
      type: 'task'
    }
  ];

  const sampleNotifications = [
    {
      id: 1,
      message: 'New patient registration: James Wilson',
      time: '10 minutes ago',
      type: 'appointment',
      read: false,
      from: 'Reception'
    },
    {
      id: 2,
      message: 'Dr. Sarah requested time off next week',
      time: '2 hours ago',
      type: 'message',
      read: false,
      from: 'HR Department'
    },
    {
      id: 3,
      message: 'Low stock alert: Surgical masks',
      time: '5 hours ago',
      type: 'alert',
      read: true
    },
    {
      id: 4,
      message: 'System maintenance scheduled for tonight',
      time: 'Yesterday',
      type: 'alert',
      read: true
    }
  ];
  
  useEffect(() => {
    // Fetch events and notifications
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // This would be API calls in production
        // const eventsResponse = await fetch('http://localhost:5002/api/events');
        // const eventsData = await eventsResponse.json();
        // setEvents(eventsData);
        
        // const notificationsResponse = await fetch('http://localhost:5002/api/notifications');
        // const notificationsData = await notificationsResponse.json();
        // setNotifications(notificationsData);
        
        // Using sample data for now
        setTimeout(() => {
          setEvents(sampleEvents);
          setNotifications(sampleNotifications);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value
    });
  };
  
  const handleAddEvent = () => {
    // In a real app, you would submit this to an API
    const newEventObject = {
      id: events.length + 1,
      title: newEvent.title,
      date: `${newEvent.date} ${newEvent.time}`,
      location: newEvent.location,
      type: newEvent.type,
      description: newEvent.description
    };
    
    setEvents([newEventObject, ...events]);
    
    // Reset form
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'meeting',
      description: ''
    });
    setShowAddEventModal(false);
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'training':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Events & Notifications */}
      <div className="bg-white rounded-lg shadow-sm xl:col-span-3">
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-4 py-3 text-center text-sm font-medium ${activeTab === 'events' ? 'text-mainBlue border-b-2 border-mainBlue' : 'text-mainGray hover:text-DarkBlue'}`}
          >
            Events
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-3 text-center text-sm font-medium relative ${activeTab === 'notifications' ? 'text-mainBlue border-b-2 border-mainBlue' : 'text-mainGray hover:text-DarkBlue'}`}
          >
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-2 right-2 md:right-10 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>
        <div className="p-4 md:p-6">
          {/* Events tab */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming events
                </div>
              ) : (
                <>
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${event.type === 'meeting' ? 'bg-blue-100 text-blue-600' : event.type === 'training' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                        {event.type === 'meeting' ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ) : event.type === 'training' ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-xs md:text-sm font-medium text-DarkBlue">{event.title}</p>
                        <div className="flex flex-wrap items-center mt-1 text-xs text-mainGray">
                          <div className="flex items-center mr-3 md:mr-4">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {event.date}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <button className="text-mainGray hover:text-DarkBlue p-1 rounded-full transition-colors ml-2">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => router.push('/calendar')}
                    className="w-full py-2 text-xs md:text-sm text-mainBlue hover:text-deepBlue font-medium transition-colors bg-mainBlue bg-opacity-5 hover:bg-opacity-10 rounded-lg mt-2"
                  >
                    View All Events
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Notifications tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No new notifications
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${notification.type === 'appointment' ? 'bg-green-100 text-green-600' : notification.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                        {notification.type === 'appointment' ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : notification.type === 'message' ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-xs md:text-sm font-medium text-DarkBlue">{notification.message}</p>
                        <div className="flex flex-wrap items-center mt-1 text-xs text-mainGray">
                          <div className="flex items-center mr-3 md:mr-4">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {notification.time}
                          </div>
                          {notification.from && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {notification.from}
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="text-mainGray hover:text-DarkBlue p-1 rounded-full transition-colors ml-2" aria-label="Dismiss notification">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowAllNotificationsModal(true)}
                    className="w-full py-2 text-xs md:text-sm text-mainBlue hover:text-deepBlue font-medium transition-colors bg-mainBlue bg-opacity-5 hover:bg-opacity-10 rounded-lg mt-2"
                  >
                    View All Notifications
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Form Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Add New Event</h3>
              <button 
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setShowAddEventModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-mainGray mb-1">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newEvent.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={newEvent.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mainGray mb-1">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={newEvent.time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-mainGray mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-mainGray mb-1">Event Type</label>
                    <select
                      name="type"
                      value={newEvent.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="training">Training</option>
                      <option value="task">Task</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-mainGray mb-1">Description (Optional)</label>
                    <textarea
                      name="description"
                      value={newEvent.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsNotifications;
