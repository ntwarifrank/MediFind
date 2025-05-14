'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import AuthGuard from '../../components/AuthGuard';

// Import loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function HospitalContent() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [fetchedHospitalAdmins, setFetchedHospitalAdmins] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    sector: '',
    cell: '',
    type: 'Referral Hospital',
    description: '',
    specialties: '',
    rating: 0,
    phone: '',
    email: 'info@hospital.com',
    services: '',
    facilities: '',
    hospitalAdmin: '',
    workingDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    beds: '',
    status: 'pending',
    logo: '',
    website: '',
    founded: '',
    images: [],
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filter, setFilter] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);


  // Fetch hospitals when component mounts
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );

        if (response.status === 200) {
          console.log('Hospitals fetched:', response.data);
          const hospitalsData = response.data.data?.hospitals || response.data.hospitals || [];
          setHospitals(hospitalsData);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load hospitals. ' + (error.response?.data?.message || error.message)
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // Fetch hospital admins when component mounts
  useEffect(() => {
    const fetchHospitalAdmins = async () => {
      try {
        setMessage({ type: '', text: '' });
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          setMessage({ 
            type: 'error', 
            text: 'Authentication required. Please log in.'
          });
          return;
        }
        
        // Try the Admin model endpoint first (for hospital admins)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admins`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.status === 200) {
          console.log('Hospital admins fetched:', response.data);
          
          // Handle different API response formats
          let adminsData = [];
          if (response.data.admins) {
            adminsData = response.data.admins;
            setFetchedHospitalAdmins(adminsData);
          } else if (response.data.data?.admins) {
            adminsData = response.data.data.admins;
            setFetchedHospitalAdmins(adminsData);
          } else if (Array.isArray(response.data)) {
            adminsData = response.data;
            setFetchedHospitalAdmins(adminsData);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            adminsData = response.data.data;
            setFetchedHospitalAdmins(adminsData);
          }
          
          console.log('Processed hospital admins:', adminsData);
          
          if (adminsData.length === 0) {
            setMessage({ 
              type: 'warning', 
              text: 'No hospital admins found. Please create some admins first.'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching hospital admins:', error);
        
        // Fallback to second endpoint if the first one failed
        try {
          const token = localStorage.getItem('authToken');
          if (!token) return;
          
          const fallbackResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/admin/all`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (fallbackResponse.status === 200) {
            let adminsData = [];
            if (fallbackResponse.data.admins) {
              adminsData = fallbackResponse.data.admins;
            } else if (fallbackResponse.data.data?.admins) {
              adminsData = fallbackResponse.data.data.admins;
            } else if (Array.isArray(fallbackResponse.data)) {
              adminsData = fallbackResponse.data;
            } else if (fallbackResponse.data.data && Array.isArray(fallbackResponse.data.data)) {
              adminsData = fallbackResponse.data.data;
            }
            
            setFetchedHospitalAdmins(adminsData);
          }
        } catch (fallbackError) {
          console.error('Error fetching hospital admins (fallback):', fallbackError);
          setMessage({
            type: 'warning',
            text: 'Could not fetch hospital admins. Some features may not work properly.'
          });
        }
      }
    };

    fetchHospitalAdmins();
  }, []);

  // Fetch admin data when hospital admin is selected
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!formData.hospitalAdmin) return; // Don't fetch if no admin selected
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getAdmin/${formData.hospitalAdmin}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        if (response.status === 200) {
          setFormData(prev => ({
            ...prev,
            name: response.data.Admin?.hospitalName || prev.name,
            email: response.data.Admin?.email || prev.email,
            phone: response.data.Admin?.phone || prev.phone
          }));
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load admin information' 
        });
      }
    };
  
    fetchAdminData();
  }, [formData.hospitalAdmin]); // Only run when hospitalAdmin changes
 

  const handleImageUpload = async (files, type) => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/uploadImages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      if (type === 'logo') {
        return [response.data.urls[0]]; // Return first URL for logo
      }
      return response.data.urls; // Return all URLs for images
    } catch (error) {
      console.error('Error uploading images:', error);
      setMessage({ type: 'error', text: 'Failed to upload images' });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals`);
        setHospitals(response.data.hospitals?.hospitals || []);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setMessage({ type: 'error', text: 'Failed to load hospitals' });
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch hospital admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getHospitalAdmins`);
        if (response.status === 201) {
          setFetchedHospitalAdmins(response.data.Admins || []);
          console.log("admins data" + response);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };
    fetchAdmins();
  }, [process.env.NEXT_PUBLIC_BACKEND_URL]);

  // Validate form data
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['name', 'district', 'sector', 'cell', 'description', 'specialties', 'services', 'phone', 'email'];
    
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.specialties.split(',').filter(item => item.trim()).length === 0) {
      errors.specialties = 'At least one specialty is required';
    }

    if (formData.services.split(',').filter(item => item.trim()).length === 0) {
      errors.services = 'At least one service is required';
    }

    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      errors.rating = 'Rating must be between 0 and 5';
    }

    if (formData.website && !/^https?:\/\/\S+$/.test(formData.website)) {
      errors.website = 'Please enter a valid URL';
    }

    return errors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: checked }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle image drops
  const onImagesDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length + previewImages.length > 5) {
      setMessage({ type: 'error', text: 'Maximum 5 images allowed' });
      return;
    }

    const newPreviews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviews]);
  }, [previewImages]);

  // Handle logo drop
  const onLogoDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    
    const file = acceptedFiles[0];
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    
    try {
      const [url] = await handleImageUpload([file], 'logo');
      setFormData(prev => ({ ...prev, logo: url }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    }
  }, []);

  // Initialize dropzones
  const imagesDropzone = useDropzone({
    onDrop: onImagesDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 5,
    multiple: true,
  });

  const logoDropzone = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    multiple: false,
  });

  // Remove image
  const removeImage = (index) => {
    const newImages = [...previewImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setPreviewImages(newImages);
  };

  //handle submit
  // Helper function to handle successful hospital creation response
  const handleHospitalCreationSuccess = (response) => {
    try {
      // Extract hospital data from response, handling different API response formats
      let newHospital;
      
      if (response.data.hospital) {
        newHospital = response.data.hospital;
      } else if (response.data.data?.hospital) {
        newHospital = response.data.data.hospital;
      } else if (response.data.data) {
        newHospital = response.data.data;
      } else if (response.data) {
        newHospital = response.data;
      }
      
      if (!newHospital || !newHospital._id) {
        throw new Error('Could not extract hospital data from response');
      }
      
      // Add hospital to state
      setHospitals(prev => [...prev, newHospital]);
      
      // Show success message
      setMessage({
        type: 'success',
        text: `Hospital "${newHospital.name}" was added successfully!`
      });
      
      // Reset the form and UI state
      resetForm();
      setIsAdding(false);
      
      // Log success
      console.log(`Successfully added hospital: ${newHospital.name} (ID: ${newHospital._id})`);
      
      // If we know which admin was assigned, log that too
      if (newHospital.hospitalAdmin) {
        const admin = fetchedHospitalAdmins.find(a => a._id === newHospital.hospitalAdmin);
        if (admin) {
          console.log(`Hospital assigned to admin: ${admin.adminName || admin.name || admin.email}`);
        }
      }
    } catch (error) {
      console.error('Error processing successful response:', error);
      setMessage({
        type: 'warning',
        text: 'Hospital may have been created, but there was an error processing the response.'
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
  
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage({ type: 'error', text: 'Please fix the form errors' });
      setLoading(false);
      return;
    }
  
    try {
      // Get authentication token if available
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

      // Check if we need to upload images
      let uploadedImages = [];
      if (previewImages.length > 0) {
        try {
          // Create FormData for image uploads
          const imageFormData = new FormData();
          for (const image of previewImages) {
            imageFormData.append('images', image.file);
          }
          
          // Upload to Cloudinary via backend
          const uploadResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
            imageFormData,
            { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
          );
          
          if (uploadResponse.data && uploadResponse.data.urls) {
            uploadedImages = uploadResponse.data.urls;
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setMessage({ type: 'error', text: 'Failed to upload images. Please try again.' });
          setLoading(false);
          return;
        }
      }
      
      // Upload logo if present
      let logoUrl = formData.logo;
      if (logoPreview && logoDropzone.acceptedFiles.length > 0) {
        try {
          const logoFormData = new FormData();
          logoFormData.append('images', logoDropzone.acceptedFiles[0]);
          
          const logoUploadResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
            logoFormData,
            { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
          );
          
          if (logoUploadResponse.data && logoUploadResponse.data.urls && logoUploadResponse.data.urls.length > 0) {
            logoUrl = logoUploadResponse.data.urls[0];
          }
        } catch (logoUploadError) {
          console.error('Logo upload error:', logoUploadError);
          setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
          setLoading(false);
          return;
        }
      }

      // Validate hospital admin is selected
      if (!formData.hospitalAdmin) {
        setFormErrors(prev => ({ ...prev, hospitalAdmin: 'Hospital admin is required' }));
        setMessage({ type: 'error', text: 'Please select a hospital admin' });
        setLoading(false);
        return;
      }

      // Process and format data for backend
      const processedData = {
        name: formData.name.trim(),
        district: formData.district.trim(),
        sector: formData.sector.trim(),
        cell: formData.cell.trim(),
        type: formData.type,
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        hospitalAdmin: formData.hospitalAdmin,
        address: `${formData.district}, ${formData.sector}, ${formData.cell}`,
        specialties: formData.specialties.split(',').map(item => item.trim()).filter(Boolean),
        services: formData.services.split(',').map(item => item.trim()).filter(Boolean),
        facilities: formData.facilities ? formData.facilities.split(',').map(item => item.trim()).filter(Boolean) : [],
        workingDays: formData.workingDays,
        images: uploadedImages,
        logo: logoUrl,
        rating: parseFloat(formData.rating) || 0,
        beds: parseInt(formData.beds) || 0,
        founded: parseInt(formData.founded) || new Date().getFullYear(),
        website: formData.website || '',
        status: formData.status || 'pending',
      };
      
      console.log('Sending hospital data to backend:', processedData);
  
      // Try the main endpoint first
      try {
        // Create the hospital
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals`,
          processedData,
          { headers }
        );
        
        console.log('Hospital creation response:', response.data);
        handleHospitalCreationSuccess(response);
      } catch (primaryError) {
        console.error('Primary endpoint error:', primaryError);
        
        // If the first endpoint fails, try the secondary endpoint
        try {
          const fallbackResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/createhospital`,
            processedData,
            { headers }
          );
          
          console.log('Hospital creation fallback response:', fallbackResponse.data);
          handleHospitalCreationSuccess(fallbackResponse);
        } catch (fallbackError) {
          console.error('Fallback endpoint error:', fallbackError);
          // If both fail, throw the primary error to be handled by the main catch block
          throw primaryError;
        }
      }
    } catch (error) {
      console.error('Error adding hospital:', error);
      let errorMessage = error.response?.data?.message || 'Failed to add hospital';
      
      if (error.response?.status === 409) {
        errorMessage = 'A hospital with this name already exists';
        setFormErrors({ name: errorMessage });
      } else if (error.response?.status === 400) {
        // Handle validation errors from backend
        if (error.response.data?.errors) {
          setFormErrors(error.response.data.errors);
          errorMessage = 'Please fix the form errors';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'You are not authorized to perform this action. Please log in.';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      district: '',
      sector: '',
      cell: '',
      type: 'Referral Hospital',
      description: '',
      specialties: '',
      rating: 0,
      phone: '',
      email: 'info@hospital.com',
      services: '',
      facilities: '',
      hospitalAdmin: '',
      workingDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      beds: '',
      status: 'pending',
      logo: '',
      website: '',
      founded: '',
      images: [],
    });
    
    // Clean up object URLs
    previewImages.forEach(img => URL.revokeObjectURL(img.preview));
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    
    setPreviewImages([]);
    setLogoPreview(null);
    setFormErrors({});
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(img => URL.revokeObjectURL(img.preview));
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [previewImages, logoPreview]);

    // Filter hospitals - ensure hospitals is an array before filtering
  const filteredHospitals = Array.isArray(hospitals) 
    ? hospitals.filter(
        (hospital) =>
          hospital?.name?.toLowerCase().includes(filter.toLowerCase()) ||
          (hospital?.district && hospital.district.toLowerCase().includes(filter.toLowerCase())) ||
          (hospital?.sector && hospital.sector.toLowerCase().includes(filter.toLowerCase())) ||
          (hospital?.cell && hospital.cell.toLowerCase().includes(filter.toLowerCase()))
      )
    : [];  

    async function handleDeleteHospital(id) {
    if (!confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
      return; // User cancelled the deletion
    }
    
    setDeletingId(id);
    setDeleteLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log("Hospital ID to be deleted: " + id);
      
      // Get authentication token if available
      const token = localStorage.getItem('authToken');
      const headers = token 
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } 
        : { 'Content-Type': 'application/json' };
      
      // Use the correct API endpoint
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hospitals/${id}`,
        { headers }
      );

      if (response.status >= 200 && response.status < 300) {
        // Remove the hospital from the local state
        setHospitals(prev => prev.filter(hospital => String(hospital._id) !== String(id)));
        
        setMessage({ 
          type: 'success', 
          text: 'Hospital deleted successfully' 
        });
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      
      let errorMessage = 'Failed to delete hospital';
      
      if (error.response?.status === 404) {
        errorMessage = 'Hospital not found';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'You are not authorized to delete this hospital';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setDeleteLoading(false);
      setDeletingId('');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hospital Management</h1>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isAdding ? 'Cancel' : 'Add New Hospital'}
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-6 mb-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Add New Hospital</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Admin</label>
                  <select
                    name="hospitalAdmin"  // Changed from "type" to "hospitalAdmin" to match state property
                    value={formData.hospitalAdmin}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Hospital Admin</option>
                    {fetchedHospitalAdmins && fetchedHospitalAdmins.map((adminData) => (
                      <option key={adminData._id} value={adminData._id}>
                        {adminData.adminName}
                      </option>
                    ))}
                  </select>
                  {formErrors.hospitalAdmin && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.hospitalAdmin}</p>
                  )}
               </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Admin*</label>
                <select
                  name="hospitalAdmin"
                  value={formData.hospitalAdmin}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    formErrors.hospitalAdmin ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="">Select Hospital Admin</option>
                  {fetchedHospitalAdmins.map(admin => (
                    <option key={admin._id} value={admin._id}>
                      {admin.adminName || admin.name || admin.email} {admin.email ? `(${admin.email})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.hospitalAdmin && <p className="text-red-500 text-xs mt-1">{formErrors.hospitalAdmin}</p>}
                {fetchedHospitalAdmins.length === 0 && 
                  <p className="text-yellow-600 text-xs mt-1">No hospital admins found. You need to create hospital admins first.</p>
                }
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District*</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g., Gasabo"
                  className={`w-full p-3 border ${
                    formErrors.district ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {formErrors.district && <p className="text-red-500 text-xs mt-1">{formErrors.district}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector*</label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  placeholder="e.g., Remera"
                  className={`w-full p-3 border ${
                    formErrors.sector ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {formErrors.sector && <p className="text-red-500 text-xs mt-1">{formErrors.sector}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cell*</label>
                <input
                  type="text"
                  name="cell"
                  value={formData.cell}
                  onChange={handleChange}
                  placeholder="e.g., Rukiri I"
                  className={`w-full p-3 border ${
                    formErrors.cell ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {formErrors.cell && <p className="text-red-500 text-xs mt-1">{formErrors.cell}</p>}
              </div>
            </div>

              

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Admin*</label>
              <select
                name="hospitalAdmin"
                value={formData.hospitalAdmin}
                onChange={handleChange}
                className={`w-full p-3 border ${formErrors.hospitalAdmin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Hospital Admin</option>
                {fetchedHospitalAdmins.map(admin => (
                  <option key={admin._id} value={admin._id}>
                    {admin.adminName || admin.name} ({admin.email})
                  </option>
                ))}
              </select>
              {formErrors.hospitalAdmin && <p className="text-red-500 text-xs mt-1">{formErrors.hospitalAdmin}</p>}
              {fetchedHospitalAdmins.length === 0 && 
                <p className="text-yellow-600 text-xs mt-1">No hospital admins found. You may need to create hospital admins first.</p>
              }
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Referral Hospital">Referral Hospital</option>
                  <option value="District Hospital">District Hospital</option>
                  <option value="Private Hospital">Private Hospital</option>
                  <option value="Specialized Hospital">Specialized Hospital</option>
                  <option value="Health Center">Health Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full p-3 border ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                required
              ></textarea>
              {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Logo</label>
                <div
                  {...logoDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                    logoDropzone.isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <input {...logoDropzone.getInputProps()} />
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="mx-auto h-32 object-contain rounded" />
                  ) : (
                    <p className="text-gray-500">Drag & drop logo or click to upload</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Images (max 5)</label>
                <div
                  {...imagesDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                    imagesDropzone.isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <input {...imagesDropzone.getInputProps()} />
                  {uploading ? (
                    <p className="text-gray-500">Uploading...</p>
                  ) : (
                    <p className="text-gray-500">Drag & drop images or click to select (max 5)</p>
                  )}
                </div>
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma-separated)*</label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  placeholder="e.g., Cardiology, Neurology"
                  className={`w-full p-3 border ${
                    formErrors.specialties ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {formErrors.specialties && <p className="text-red-500 text-xs mt-1">{formErrors.specialties}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma-separated)*</label>
                <input
                  type="text"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  placeholder="e.g., Emergency, Surgery"
                  className={`w-full p-3 border ${
                    formErrors.services ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {formErrors.services && <p className="text-red-500 text-xs mt-1">{formErrors.services}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilities (comma-separated)</label>
                <input
                  type="text"
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleChange}
                  placeholder="e.g., ICU, Pharmacy"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className={`w-full p-3 border ${
                    formErrors.rating ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.rating && <p className="text-red-500 text-xs mt-1">{formErrors.rating}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Beds</label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                <input
                  type="number"
                  name="founded"
                  value={formData.founded}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+250 XXX XXX XXX"
                    className={`w-full p-3 border ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@hospital.com"
                    className={`w-full p-3 border ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={`w-full p-3 border ${
                      formErrors.website ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {formErrors.website && <p className="text-red-500 text-xs mt-1">{formErrors.website}</p>}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Working Days</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                {Object.keys(formData.workingDays).map((day) => (
                  <div key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`workingDays.${day}`}
                      name={`workingDays.${day}`}
                      checked={formData.workingDays[day]}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`workingDays.${day}`}
                      className="ml-2 block text-sm text-gray-700 capitalize"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Hospital'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Hospitals List</h2>
          <input
            type="text"
            placeholder="Search hospitals..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {loading && !isAdding ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading hospitals...</p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hospitals found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('district')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    District {sortConfig.key === 'district' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('sector')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Sector {sortConfig.key === 'sector' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('cell')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Cell {sortConfig.key === 'cell' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('type')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('rating')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Rating {sortConfig.key === 'rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {hospital.images?.[0] && (
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={hospital.images[0]}
                              alt={hospital.name}
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.district || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.sector || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.cell || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{hospital.rating || 'N/A'}</span>
                        {hospital.rating && (
                          <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          hospital.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : hospital.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {hospital.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/hospitals/${hospital._id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => {handleDeleteHospital(hospital._id)}}>{deletingId == hospital._id && deleteLoading ? "Deleting.." : "Delete"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Export a protected version of the HospitalManagement component
export default function HospitalManagement() {
  return (
    <AuthGuard>
      <HospitalContent />
    </AuthGuard>
  );
}