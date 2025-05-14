'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

export default function PrivacyPage() {
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

  const lastUpdated = "May 1, 2025";

  return (
    <MainLayout>
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-DarkBlue mb-6">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6 text-sm text-mainGray">
            <p>Last Updated: {lastUpdated}</p>
          </div>
          
          <div className="prose max-w-none text-mainGray">
            <p className="mb-4">
              At MediFind, we take the privacy and security of your data seriously. This Privacy Policy outlines how we collect, use, 
              and protect information that you provide to us through the MediFind Hospital Admin Dashboard.
            </p>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li><strong>Personal Information:</strong> When you create an account, we collect your name, email address, and contact information.</li>
              <li><strong>Patient Data:</strong> The system stores patient information including names, contact details, medical history, appointments, and other health-related data.</li>
              <li><strong>Usage Data:</strong> We collect information about how you interact with our platform, including login times, features used, and system preferences.</li>
              <li><strong>Device Information:</strong> Information about the device and browser you use to access our system.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>To provide and maintain our hospital management services</li>
              <li>To improve and personalize user experience</li>
              <li>To manage patient records and appointments</li>
              <li>To generate reports and analytics for hospital administration</li>
              <li>To communicate with you about system updates, security alerts, and support</li>
              <li>To comply with legal obligations</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your data from unauthorized access, 
              disclosure, alteration, and destruction. These measures include:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Encryption of sensitive data at rest and in transit</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Staff training on data protection and privacy practices</li>
              <li>Secure data backups and disaster recovery procedures</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Data Retention</h2>
            <p className="mb-4">
              We retain your information for as long as your account is active or as needed to provide services.
              Medical records are retained in accordance with applicable healthcare regulations and laws.
              We may retain certain information for legal and compliance purposes or for legitimate business reasons.
            </p>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights regarding your data:</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Right to access and receive a copy of your personal data</li>
              <li>Right to correct inaccurate or incomplete information</li>
              <li>Right to delete your personal data under certain circumstances</li>
              <li>Right to restrict or object to the processing of your data</li>
              <li>Right to data portability</li>
            </ul>
            <p className="mb-4">
              To exercise these rights, please contact our Data Protection Officer using the contact information provided below.
            </p>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Third-Party Services</h2>
            <p className="mb-4">
              Our system may integrate with third-party services to enhance functionality. These services have their own privacy policies,
              and we recommend reviewing their terms. We are not responsible for the privacy practices of third-party services.
            </p>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our platform. 
              You can manage your cookie preferences through your browser settings.
            </p>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. The most current version will always be posted on this page,
              and we will notify you of any significant changes.
            </p>
            
            <h2 className="text-xl font-semibold text-DarkBlue mt-8 mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at:
            </p>
            <div className="bg-whiteGray p-4 rounded-lg mt-4">
              <p>Email: privacy@medifind.com</p>
              <p>Phone: +1 (555) 987-6543</p>
              <p>Address: 123 Healthcare Avenue, Medical City, MC 54321</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
