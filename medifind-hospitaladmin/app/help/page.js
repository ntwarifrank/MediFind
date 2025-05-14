'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

export default function HelpPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  const [activeQuestion, setActiveQuestion] = useState(null);

  const faqItems = [
    {
      id: 1,
      question: "How do I add a new patient to the system?",
      answer: "To add a new patient, navigate to the Patients page using the sidebar menu. Click on the '+ Add Patient' button in the top right corner. Fill in all the required fields in the form and click 'Add Patient' to save the patient's information."
    },
    {
      id: 2,
      question: "How do I schedule an appointment?",
      answer: "To schedule an appointment, go to the Appointments page and click on the '+ New Appointment' button. Select a patient from the dropdown menu, choose a doctor, date, time, and specify the reason for the appointment. Click 'Save' to schedule the appointment."
    },
    {
      id: 3,
      question: "How can I update a patient's medical information?",
      answer: "To update a patient's medical information, go to the Patients page, find the patient in the list, and click on their name to view their profile. Click the 'Edit' button to update their details. Make your changes and click 'Save' to update their record."
    },
    {
      id: 4,
      question: "How do I generate reports?",
      answer: "To generate reports, navigate to the Reports page using the sidebar menu. Choose the type of report you want to generate (patient, appointment, finance, etc.), set the date range and any other filters, then click 'Generate Report'. You can then download the report as a PDF or Excel file."
    },
    {
      id: 5,
      question: "How can I manage hospital inventory?",
      answer: "To manage inventory, go to the Inventory page. Here you can view, add, update, or remove items from the hospital inventory. Use the search function to find specific items, and the filters to sort by category, quantity, etc."
    },
    {
      id: 6,
      question: "How do I reset my password?",
      answer: "If you're logged in, go to Settings > Security tab and click on 'Change Password'. Enter your current password and your new password twice to confirm. If you're locked out, click 'Forgot Password' on the login screen and follow the instructions sent to your email."
    },
    {
      id: 7,
      question: "How can I view a doctor's schedule?",
      answer: "To view a doctor's schedule, go to the Doctors page, find the doctor in the list, and click on their name. Navigate to the 'Schedule' tab to see their appointments and availability."
    },
    {
      id: 8,
      question: "What should I do if I encounter technical problems?",
      answer: "If you encounter technical problems, first try refreshing the page or logging out and back in. If the issue persists, contact technical support via the 'Contact Support' button at the bottom of the Help page, or email support@medifind.com with details of the problem."
    }
  ];

  const toggleQuestion = (id) => {
    if (activeQuestion === id) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(id);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-DarkBlue mb-6">Help Center</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-DarkBlue mb-4">Getting Started</h2>
          <p className="mb-4">Welcome to the MediFind Hospital Admin Dashboard help page. This guide will help you navigate and use the various features of our hospital management system effectively.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-whiteGray p-4 rounded-lg">
              <h3 className="font-medium text-DarkBlue mb-2">Patient Management</h3>
              <p className="text-sm text-mainGray">Learn how to add, update, and manage patient records effectively.</p>
            </div>
            <div className="bg-whiteGray p-4 rounded-lg">
              <h3 className="font-medium text-DarkBlue mb-2">Appointment Scheduling</h3>
              <p className="text-sm text-mainGray">Understand how to schedule, reschedule, and manage appointments.</p>
            </div>
            <div className="bg-whiteGray p-4 rounded-lg">
              <h3 className="font-medium text-DarkBlue mb-2">Reporting</h3>
              <p className="text-sm text-mainGray">Learn to generate and analyze various hospital reports.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-DarkBlue mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqItems.map((faq) => (
              <div key={faq.id} className="border-b border-gray-100 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-DarkBlue hover:text-mainBlue focus:outline-none"
                  onClick={() => toggleQuestion(faq.id)}
                >
                  <span>{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${activeQuestion === faq.id ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeQuestion === faq.id && (
                  <div className="mt-2 text-mainGray">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-DarkBlue mb-4">Video Tutorials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-mainGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-DarkBlue">Getting Started with MediFind</h3>
                <p className="text-sm text-mainGray mt-1">A complete overview of the dashboard and basic features</p>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-mainGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-DarkBlue">Advanced Patient Management</h3>
                <p className="text-sm text-mainGray mt-1">Learn how to use all patient management features</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-DarkBlue mb-4">Contact Support</h2>
          
          <p className="mb-6 text-mainGray">Can't find what you're looking for? Our support team is here to help.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mainBlue/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-mainBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-DarkBlue">Email Support</h3>
                <p className="text-sm text-mainGray mt-1">Send us an email at support@medifind.com</p>
                <p className="text-sm text-mainGray mt-1">We usually respond within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mainBlue/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-mainBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-DarkBlue">Phone Support</h3>
                <p className="text-sm text-mainGray mt-1">Call us at +1 (555) 123-4567</p>
                <p className="text-sm text-mainGray mt-1">Available Monday-Friday, 9AM-5PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
