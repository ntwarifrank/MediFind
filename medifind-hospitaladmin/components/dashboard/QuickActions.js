import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const QuickActions = () => {
  const router = useRouter();
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const actions = [
    {
      title: 'Add Patient',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'from-blue-400 to-blue-600',
      onClick: () => router.push('/patients'),
    },
    {
      title: 'Schedule Appointment',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-purple-400 to-purple-600',
      onClick: () => router.push('/appointments'),
    },
    {
      title: 'Create Invoice',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-green-400 to-green-600',
      onClick: () => setShowInvoiceModal(true),
    },
    {
      title: 'View Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-yellow-400 to-yellow-600',
      onClick: () => router.push('/reports'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="bg-white rounded-lg shadow-sm p-3 md:p-4 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-300"
        >
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center text-white mb-2 md:mb-3`}>
            <span className="w-5 h-5 md:w-6 md:h-6">{action.icon}</span>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-gray-700">{action.title}</h3>
        </button>
      ))}
      
      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-DarkBlue">Create New Invoice</h3>
              <button 
                className="text-mainGray hover:text-DarkBlue"
                onClick={() => setShowInvoiceModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Patient Information */}
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-medium text-DarkBlue">Patient Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Patient Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Patient ID <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="PT-XXX"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Invoice Details */}
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-medium text-DarkBlue">Invoice Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Invoice Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Due Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mainGray mb-1">Invoice Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="INV-XXX"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Invoice Items */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-DarkBlue">Invoice Items</h4>
                      <button 
                        type="button"
                        className="text-sm text-mainBlue flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Item
                      </button>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                            <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <input
                                type="text"
                                placeholder="Item description"
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mainBlue/50"
                              />
                            </td>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="1"
                                defaultValue="1"
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mainBlue/50"
                              />
                            </td>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mainBlue/50"
                              />
                            </td>
                            <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                              $0.00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button type="button" className="text-red-500 hover:text-red-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </div>
                  
                  {/* Totals */}
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-sm font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Tax (10%):</span>
                        <span className="text-sm font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-base">Total:</span>
                        <span className="text-base">$0.00</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-4 py-2 border border-mainGray/30 text-mainGray rounded-lg hover:bg-whiteGray transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
                  >
                    Create Invoice
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

export default QuickActions;
