'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportsPage() {
  const { user } = useAuth();
  const hospitalId = user?.hospitalId;
  
  // Basic state
  const [activeTab, setActiveTab] = useState('financial');
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState('2025-05-06');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report data
  const [financialData, setFinancialData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  
  // Fetch data from API
  useEffect(() => {
    if (!hospitalId) return;
    
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // Fetch financial data
        const financialResponse = await axios.get('/api/reports/financial', {
          params: { hospital: hospitalId, startDate, endDate }
        });
        setFinancialData(financialResponse.data?.data?.financialData || {
          revenue: { total: 1250000, byMonth: { 'Jan': 95000, 'Feb': 98000, 'Mar': 105000, 'Apr': 110000 } },
          expenses: { total: 850000, byMonth: { 'Jan': 70000, 'Feb': 72000, 'Mar': 75000, 'Apr': 78000 } },
          profit: { total: 400000, byMonth: { 'Jan': 25000, 'Feb': 26000, 'Mar': 30000, 'Apr': 32000 } }
        });
        
        // Fetch patient data
        const patientResponse = await axios.get('/api/reports/patients', {
          params: { hospital: hospitalId, startDate, endDate }
        });
        setPatientData(patientResponse.data?.data?.patientStats || {
          totalPatients: 12500,
          newPatients: { total: 450, byMonth: { 'Jan': 110, 'Feb': 105, 'Mar': 120, 'Apr': 115 } },
          appointments: { total: 3200, completed: 2800, cancelled: 250, noShow: 150 }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [hospitalId, startDate, endDate]);
  
  // Chart data for financial reports
  const financialChartData = {
    labels: financialData?.revenue?.byMonth ? Object.keys(financialData.revenue.byMonth) : [],
    datasets: [
      {
        label: 'Revenue',
        data: financialData?.revenue?.byMonth ? Object.values(financialData.revenue.byMonth) : [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Expenses',
        data: financialData?.expenses?.byMonth ? Object.values(financialData.expenses.byMonth) : [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Profit',
        data: financialData?.profit?.byMonth ? Object.values(financialData.profit.byMonth) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };
  
  // Chart data for patient reports
  const patientChartData = {
    labels: patientData?.newPatients?.byMonth ? Object.keys(patientData.newPatients.byMonth) : [],
    datasets: [
      {
        label: 'New Patients',
        data: patientData?.newPatients?.byMonth ? Object.values(patientData.newPatients.byMonth) : [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: activeTab === 'financial' ? 'Financial Report' : 'Patient Statistics' },
    },
  };
  
  // Handle date changes
  const handleDateChange = (e, dateType) => {
    if (dateType === 'start') {
      setStartDate(e.target.value);
    } else {
      setEndDate(e.target.value);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hospital Reports</h1>
        
        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => handleDateChange(e, 'start')}
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => handleDateChange(e, 'end')}
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-4 sm:mt-0"
              onClick={() => setIsLoading(true)}
            >
              Apply Filters
            </button>
          </div>
        </div>
        
        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'financial' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('financial')}
          >
            Financial Reports
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'patients' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('patients')}
          >
            Patient Statistics
          </button>
        </div>
        
        {/* Loading and Error States */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : (
          <>
            {/* Report Content */}
            {activeTab === 'financial' ? (
              <div className="bg-white p-4 rounded-lg shadow">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      ${financialData?.revenue?.total?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">
                      ${financialData?.expenses?.total?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Net Profit</h3>
                    <p className="text-2xl font-bold text-green-600">
                      ${financialData?.profit?.total?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                
                {/* Financial Chart */}
                <div className="h-80">
                  <Bar options={chartOptions} data={financialChartData} />
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow">
                {/* Patient Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {patientData?.totalPatients?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">New Patients</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {patientData?.newPatients?.total?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Total Appointments</h3>
                    <p className="text-2xl font-bold text-teal-600">
                      {patientData?.appointments?.total?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                
                {/* Patient Chart */}
                <div className="h-80">
                  <Bar options={chartOptions} data={patientChartData} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
