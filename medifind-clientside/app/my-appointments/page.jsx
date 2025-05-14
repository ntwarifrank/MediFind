"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Nav from "../nav/page";
import Footer from "../homepage/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faHospital, faUserMd, faClock, faSpinner, faExclamationCircle, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const MyAppointmentsPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/my-appointments");
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Fetch appointments when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAppointments();
    }
  }, [isAuthenticated, user]);
  
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('mediToken');
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${baseURL}/api/appointments/my-appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.status === "success") {
        setAppointments(response.data.data.appointments || []);
      } else {
        setError("Failed to load appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Could not load your appointments. Please try again later.");
      
      // For demo purposes, add sample data if API fails
      if (process.env.NODE_ENV === 'development') {
        setAppointments([
          {
            _id: "1",
            date: "2025-05-15",
            time: "10:00 AM",
            doctor: { _id: "d1", name: "Dr. Jean Mugisha", specialty: "Cardiology" },
            hospital: { _id: "h1", name: "King Faisal Hospital" },
            status: "confirmed",
            patient: { name: user?.name || "Patient", email: user?.email || "patient@example.com" },
            reason: "Regular checkup"
          },
          {
            _id: "2",
            date: "2025-05-20",
            time: "09:30 AM",
            doctor: { _id: "d2", name: "Dr. Alice Uwimana", specialty: "Dermatology" },
            hospital: { _id: "h2", name: "Rwanda Military Hospital" },
            status: "pending",
            patient: { name: user?.name || "Patient", email: user?.email || "patient@example.com" },
            reason: "Skin consultation"
          },
          {
            _id: "3",
            date: "2025-04-10",
            time: "02:00 PM",
            doctor: { _id: "d3", name: "Dr. Emanuel Habineza", specialty: "General Medicine" },
            hospital: { _id: "h3", name: "Butaro Hospital" },
            status: "completed",
            patient: { name: user?.name || "Patient", email: user?.email || "patient@example.com" },
            reason: "Follow-up appointment"
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelAppointment = async () => {
    if (!currentAppointment) return;
    
    try {
      const token = localStorage.getItem('mediToken');
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.patch(
        `${baseURL}/api/appointments/${currentAppointment._id}`,
        { status: "cancelled" },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the appointment status locally
      setAppointments(appointments.map(appointment => 
        appointment._id === currentAppointment._id
          ? { ...appointment, status: "cancelled" }
          : appointment
      ));
      
      // Close the modal
      setIsModalOpen(false);
      setCurrentAppointment(null);
      
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };
  
  const openCancelModal = (appointment) => {
    setCurrentAppointment(appointment);
    setIsModalOpen(true);
  };
  
  const getFilteredAppointments = () => {
    if (filterStatus === "all") {
      return appointments;
    }
    return appointments.filter(appointment => appointment.status === filterStatus);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };
  
  // Show loading or redirect if not authenticated
  if (authLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-mainBlue"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="w-full bg-mainWhite min-h-screen">
      <Nav />
      
      <div className="lg:w-[85%] md:w-[90%] w-[95%] mx-auto py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-DarkBlue">
              My Appointments
            </h1>
            
            <Link href="/appointments">
              <button className="mt-4 md:mt-0 px-6 py-2 bg-gradient-to-r from-mainBlue to-deepBlue text-white rounded-lg hover:shadow-md transition-all">
                Book New Appointment
              </button>
            </Link>
          </div>
          
          {/* Status filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Appointments
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === "pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus("confirmed")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === "confirmed"
                    ? "bg-green-200 text-green-800"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilterStatus("completed")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === "completed"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus("cancelled")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === "cancelled"
                    ? "bg-red-200 text-red-800"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FontAwesomeIcon icon={faSpinner} className="text-mainBlue text-3xl animate-spin mb-4" />
              <p className="text-gray-600">Loading your appointments...</p>
            </div>
          ) : (
            <>
              {/* Appointments listing */}
              {getFilteredAppointments().length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-6">
                    {filterStatus === "all"
                      ? "You don't have any appointments yet."
                      : `You don't have any ${filterStatus} appointments.`}
                  </p>
                  
                  <Link href="/appointments">
                    <button className="px-6 py-2 bg-gradient-to-r from-mainBlue to-deepBlue text-white rounded-lg hover:shadow-md transition-all">
                      Book an Appointment
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredAppointments().map((appointment) => (
                    <div key={appointment._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-DarkBlue">
                              Appointment with {appointment.doctor?.name || "Doctor"}
                            </h3>
                            <p className="text-gray-600">{appointment.doctor?.specialty || "Specialist"}</p>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3 mt-1">
                              <FontAwesomeIcon icon={faCalendarAlt} className="text-mainBlue" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium">{formatDate(appointment.date)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3 mt-1">
                              <FontAwesomeIcon icon={faClock} className="text-mainBlue" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Time</p>
                              <p className="font-medium">{appointment.time}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3 mt-1">
                              <FontAwesomeIcon icon={faHospital} className="text-mainBlue" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Hospital</p>
                              <p className="font-medium">{appointment.hospital?.name || "Hospital"}</p>
                            </div>
                          </div>
                        </div>
                        
                        {appointment.reason && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-500 mb-1">Reason for Visit</p>
                            <p className="text-gray-700">{appointment.reason}</p>
                          </div>
                        )}
                        
                        {/* Actions based on status */}
                        <div className="flex justify-end">
                          {appointment.status === "pending" || appointment.status === "confirmed" ? (
                            <button
                              onClick={() => openCancelModal(appointment)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Cancel Appointment
                            </button>
                          ) : appointment.status === "completed" ? (
                            <Link href={`/book-followup?doctor=${appointment.doctor?._id}`}>
                              <button className="px-4 py-2 text-mainBlue hover:bg-blue-50 rounded-md transition-colors">
                                Book Follow-up
                              </button>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Cancel Appointment Modal */}
      {isModalOpen && currentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your appointment with{" "}
              <span className="font-medium">{currentAppointment.doctor?.name}</span> on{" "}
              <span className="font-medium">{formatDate(currentAppointment.date)}</span> at{" "}
              <span className="font-medium">{currentAppointment.time}</span>?
            </p>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentAppointment(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default MyAppointmentsPage;
