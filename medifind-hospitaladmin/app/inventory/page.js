'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function InventoryPage() {
  const { user } = useAuth();
  const hospitalId = user?.hospitalId;
  
  // UI state
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  
  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'PPE',
    subcategory: '',
    currentStock: 0,
    unit: 'pieces',
    minStockLevel: 0,
    reorderPoint: 0,
    status: 'In Stock',
    location: '',
    expiryDate: '',
    supplier: '',
    price: 0,
    description: '',
    batchNumber: ''
  });
  
  // Fetch inventory items from backend API
  useEffect(() => {
    if (!hospitalId) return;
    
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/inventory', {
          params: { hospital: hospitalId }
        });
        setInventoryItems(response.data.data.inventory || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory items. Please try again later.');
        // Fallback to sample data for demo purposes
        setInventoryItems([
          {
            id: 'INV-001',
            name: 'Surgical Masks',
            category: 'PPE',
            subcategory: 'Face Protection',
            currentStock: 1250,
            unit: 'pieces',
            minStockLevel: 500,
            reorderPoint: 800,
            status: 'In Stock',
            location: 'Main Storage - Shelf A3',
            lastRestocked: '2023-10-15',
            expiryDate: '2025-10-15',
            supplier: 'MedSupply Inc.',
            price: 0.50,
            description: 'Disposable 3-ply surgical masks for medical use',
            image: '/images/surgical-mask.jpg',
            usageRate: '~200/week',
            batchNumber: 'SM-2023-10-15'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInventory();
  }, [hospitalId]);
  
  // Filter function
  const filteredItems = inventoryItems.filter(item => {
    // Filter by search term
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    // Filter by tab
    let matchesTab = true;
    if (activeTab === 'low-stock') {
      matchesTab = item.currentStock <= item.reorderPoint;
    } else if (activeTab === 'expiring-soon') {
      // Check if expiry date is within 3 months
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        matchesTab = expiryDate <= threeMonthsFromNow;
      } else {
        matchesTab = false;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });
  
  // Helper functions
  const getStockStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'in stock':
        return 'bg-green-100 text-green-800';
      case 'low stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out of stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle add new item form submission
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    const newId = `INV-${String(inventoryItems.length + 1).padStart(3, '0')}`;
    const itemWithId = { ...newItem, id: newId, hospitalId: hospitalId };
    
    try {
      const response = await axios.post('/api/inventory', itemWithId);
      setInventoryItems([...inventoryItems, response.data.data.item]);
      setShowAddItemModal(false);
      setNewItem({
        name: '',
        category: 'PPE',
        subcategory: '',
        currentStock: 0,
        unit: 'pieces',
        minStockLevel: 0,
        reorderPoint: 0,
        status: 'In Stock',
        location: '',
        expiryDate: '',
        supplier: '',
        price: 0,
        description: '',
        batchNumber: ''
      });
    } catch (err) {
      console.error('Error adding inventory item:', err);
      setError('Failed to add new item. Please try again.');
    }
  };
  
  // Handle ordering items
  const handleOrderItem = async (e) => {
    e.preventDefault();
    
    if (!selectedItem) return;
    
    try {
      await axios.post('/api/inventory/order', {
        itemId: selectedItem.id,
        quantity: orderQuantity,
        hospitalId: hospitalId
      });
      
      // Update local state
      const updatedItems = inventoryItems.map(item => {
        if (item.id === selectedItem.id) {
          return { ...item, currentStock: item.currentStock + parseInt(orderQuantity) };
        }
        return item;
      });
      
      setInventoryItems(updatedItems);
      setShowOrderModal(false);
      setOrderQuantity(1);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error ordering item:', err);
      setError('Failed to place order. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Inventory Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowAddItemModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Item
            </button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-1 min-w-[260px]">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Inventory
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Search by name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="PPE">PPE</option>
                <option value="Medications">Medications</option>
                <option value="Supplies">Supplies</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                All Items
              </button>
              <button
                onClick={() => setActiveTab('low-stock')}
                className={`${activeTab === 'low-stock' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setActiveTab('expiring-soon')}
                className={`${activeTab === 'expiring-soon' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Expiring Soon
              </button>
            </nav>
          </div>
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
            {/* Inventory Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No inventory items found
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                                ) : (
                                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.id}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{item.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{item.category}</div>
                            {item.subcategory && (
                              <div className="text-sm text-gray-500">{item.subcategory}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{item.currentStock} {item.unit}</div>
                            <div className="text-xs text-gray-500">
                              Min: {item.minStockLevel} | Reorder: {item.reorderPoint}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusClass(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.expiryDate || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowOrderModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Order
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full z-10">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Inventory Item</h3>
              </div>
              
              <form onSubmit={handleAddItem} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.name}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      id="category"
                      name="category"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newItem.category}
                      onChange={handleFormChange}
                    >
                      <option value="PPE">PPE</option>
                      <option value="Medications">Medications</option>
                      <option value="Supplies">Supplies</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">Current Stock</label>
                    <input
                      type="number"
                      name="currentStock"
                      id="currentStock"
                      min="0"
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.currentStock}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                    <input
                      type="text"
                      name="unit"
                      id="unit"
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.unit}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">Min Stock Level</label>
                    <input
                      type="number"
                      name="minStockLevel"
                      id="minStockLevel"
                      min="0"
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.minStockLevel}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700">Reorder Point</label>
                    <input
                      type="number"
                      name="reorderPoint"
                      id="reorderPoint"
                      min="0"
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.reorderPoint}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      id="expiryDate"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.expiryDate}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.price}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows="3"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={newItem.description}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowAddItemModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Order Modal */}
        {showOrderModal && selectedItem && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full z-10">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Order Additional Stock</h3>
              </div>
              
              <form onSubmit={handleOrderItem} className="p-6">
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-500">{selectedItem.id}</p>
                  <p className="text-sm text-gray-500 mt-2">Current Stock: {selectedItem.currentStock} {selectedItem.unit}</p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="orderQuantity" className="block text-sm font-medium text-gray-700">Order Quantity</label>
                  <input
                    type="number"
                    name="orderQuantity"
                    id="orderQuantity"
                    min="1"
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedItem(null);
                      setOrderQuantity(1);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
