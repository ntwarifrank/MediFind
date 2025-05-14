
'use client';

import Link from 'next/link';
import AuthGuard from '../components/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">MediFind Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage hospitals, doctors and appointments</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/hospitals">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Manage Hospitals
            </div>
          </Link>
          
          <div className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg cursor-not-allowed">
            Manage Doctors (Coming soon)
          </div>
          
          <div className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg cursor-not-allowed">
            View Appointments (Coming soon)
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800">Hospitals</h3>
            <p className="text-3xl font-bold text-blue-600">Loading...</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-green-800">Doctors</h3>
            <p className="text-3xl font-bold text-green-600">Loading...</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="text-lg font-medium text-purple-800">Appointments</h3>
            <p className="text-3xl font-bold text-purple-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
