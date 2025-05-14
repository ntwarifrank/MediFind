'use client';

import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import StatsCard from '../components/dashboard/StatsCard';
import RecentAppointments from '../components/dashboard/RecentAppointments';
import EventsNotifications from '../components/dashboard/EventsNotifications';
import HospitalStats from '../components/dashboard/HospitalStats';
import QuickActions from '../components/dashboard/QuickActions';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, user, getAuthHeader } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    patients: 0,
    appointments: 0,
    doctors: 0,
    revenue: 0,
    recentAppointments: [],
    events: [],
  });
  
  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const hospitalId = localStorage.getItem('hospitalId');
      
      if (!token || !hospitalId) {
        console.error('Missing authentication token or hospital ID');
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch hospital data
        const hospitalResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/specificHospital`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!hospitalResponse.ok) {
          throw new Error('Failed to fetch hospital data');
        }
        
        const hospitalData = await hospitalResponse.json();
        
        // Fetch doctors count
        const doctorsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${hospitalId}/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        let doctorsCount = 0;
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          doctorsCount = doctorsData.data?.doctors?.length || 0;
        }
        
        // Fetch appointments count and recent appointments
        const appointmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getAppointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        let appointmentsCount = 0;
        let recentAppointments = [];
        
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          appointmentsCount = appointmentsData.length || 0;
          
          // Get the 5 most recent appointments
          recentAppointments = appointmentsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        }
        
        // Set the dashboard data with real values
        setDashboardData({
          patients: hospitalData.Hospital?.hospital?.patientCount || 0,
          appointments: appointmentsCount,
          doctors: doctorsCount,
          revenue: hospitalData.Hospital?.hospital?.revenue || 0,
          recentAppointments: recentAppointments,
          events: hospitalData.Hospital?.hospital?.events || [],
          hospital: hospitalData.Hospital?.hospital,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to sample data if fetch fails
        setDashboardData({
          patients: 0,
          appointments: 0,
          doctors: 0, 
          revenue: 0,
          recentAppointments: [],
          events: [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, getAuthHeader]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);
  
 // if (!isAuthenticated) {
 //  return null; // Don't render anything while redirecting
 // }
  
 // if (isLoading) {
 //   return (
  //    <MainLayout>
  //      <div className="flex justify-center items-center h-[80vh]">
  //        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
   //     </div>
   //   </MainLayout>
   // );
  //}
  
  // Prepare stats data from fetched dashboard data
  const statsData = [
    {
      title: 'Total Patients',
      value: dashboardData.patients.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      trend: 'up',
      trendValue: '8.2%'
    },
    {
      title: 'Appointments Today',
      value: dashboardData.appointments.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      trend: 'up',
      trendValue: '12.5%'
    },
    {
      title: 'Available Doctors',
      value: dashboardData.doctors.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: 'down',
      trendValue: '2.3%'
    },
    {
      title: 'Monthly Revenue',
      value: `$${dashboardData.revenue.toLocaleString()}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: 'up',
      trendValue: '4.8%'
    },
  ];

  return (
    <MainLayout>
      {/* Dashboard content */}
      <div className="space-y-6 w-full">
        <h1 className="text-2xl font-bold text-DarkBlue mb-4 md:mb-6">
          Dashboard {user?.name ? `- ${user.name}'s Hospital` : ''}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <HospitalStats />
          </div>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <EventsNotifications />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <RecentAppointments />
          </div>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <QuickActions />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
