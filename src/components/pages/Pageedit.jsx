import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Store,
  FileText,
  MapPin,
  Image as ImageIcon,
  Phone,
  Save,
  X,
  Upload,
  Globe,
  Edit3,
  Camera,
  Tag,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// RTK Query
import { useGetPageByIdQuery, useUpdatePageMutation } from '../../features/pageApiSlice';
import { useCategoryQuery } from '../../features/categorySlice';
import { useLanguageQuery } from '../../features/languageSlice';
import { useLocationQuery } from '../../features/locationSlice';

// Components
import LocationSelect from '../component/_Location.page';

const PageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // RTK Queries
  const { data: pageData, isLoading: loadingPage, error: pageError } = useGetPageByIdQuery(id);
  const { data: categoriesData } = useCategoryQuery();
  const { data: languagesData } = useLanguageQuery();
  const { data: geoLocationsData } = useLocationQuery();
  
  // Mutation
  const [updatePage, { isLoading: updating }] = useUpdatePageMutation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    childCategory: '',
    language: '',
    tags: [],
    location: {
      country: '',
      countryName: '',
      region: '',
      regionName: '',
      state: '',
      stateName: '',
      province: '',
      provinceName: '',
      district: '',
      districtName: '',
      county: '',
      countyName: '',
      subDistrict: '',
      subDistrictName: '',
      localUnit: '',
      localUnitName: '',
      municipality: '',
      municipalityName: '',
      town: '',
      townName: '',
      village: '',
      villageName: ''
    },
    contact: {
      phone: '',
      whatsapp: '',
      email: '',
      telegram: ''
    },
    social: {
      website: '',
      facebook: '',
      instagram: ''
    }
  });

  const [imagePreview, setImagePreview] = useState({
    cover: null,
    logo: null
  });

  const [currentTag, setCurrentTag] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Subcategory management
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  const page = pageData?.data;

  // Check if user owns this page
  const isOwner = user?._id === page?.userId?._id || user?._id === page?.userId;

  // Load page data into form
  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        description: page.description || '',
        category: page.category?._id || '',
        childCategory: page.childCategory?._id || '',
        language: page.language?._id || '',
        tags: page.tags || [],
        location: {
          country: page.location?.country || '',
          countryName: page.location?.countryName || '',
          region: page.location?.region || '',
          regionName: page.location?.regionName || '',
          state: page.location?.state || '',
          stateName: page.location?.stateName || '',
          province: page.location?.province || '',
          provinceName: page.location?.provinceName || '',
          district: page.location?.district || '',
          districtName: page.location?.districtName || '',
          county: page.location?.county || '',
          countyName: page.location?.countyName || '',
          subDistrict: page.location?.subDistrict || '',
          subDistrictName: page.location?.subDistrictName || '',
          localUnit: page.location?.localUnit || '',
          localUnitName: page.location?.localUnitName || '',
          municipality: page.location?.municipality || '',
          municipalityName: page.location?.municipalityName || '',
          town: page.location?.town || '',
          townName: page.location?.townName || '',
          village: page.location?.village || '',
          villageName: page.location?.villageName || ''
        },
        contact: {
          phone: page.contact?.phone || '',
          whatsapp: page.contact?.whatsapp || '',
          email: page.contact?.email || '',
          telegram: page.contact?.telegram || ''
        },
        social: {
          website: page.social?.website || '',
          facebook: page.social?.facebook || '',
          instagram: page.social?.instagram || ''
        }
      });

      setImagePreview({
        cover: page.cover_image || null,
        logo: page.logo_image || null
      });
    }
  }, [page]);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category && categoriesData?.data) {
      const category = categoriesData.data.find(cat => cat._id === formData.category);
      if (category) {
        setAvailableSubcategories(category.children || []);
        
        // Reset subcategory if it doesn't belong to new category
        if (formData.childCategory && !category.children?.find(sub => sub._id === formData.childCategory)) {
          setFormData(prev => ({ ...prev, childCategory: '' }));
        }
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category, categoriesData]);

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      setImagePreview(prev => ({ ...prev, [type]: base64 }));
    } catch (error) {
      console.error('Error converting image:', error);
      setErrorMessage('Failed to upload image');
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle nested form changes (contact, social)
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle location changes
  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
  };

  // Handle tag addition
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }));
      }
      setCurrentTag('');
      e.preventDefault();
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.title?.trim()) {
      setErrorMessage('Please add a page title');
      setActiveSection('basic');
      return;
    }
    if (!formData.description?.trim()) {
      setErrorMessage('Please add a description');
      setActiveSection('basic');
      return;
    }
    if (!formData.category) {
      setErrorMessage('Please select a category');
      setActiveSection('basic');
      return;
    }
    if (availableSubcategories.length > 0 && !formData.childCategory) {
      setErrorMessage('Please select a subcategory');
      setActiveSection('basic');
      return;
    }

    try {
      // Clean up location data - remove empty strings and null values
      const cleanLocation = {};
      Object.keys(formData.location).forEach(key => {
        const value = formData.location[key];
        if (value && value !== '' && value !== null) {
          cleanLocation[key] = value;
        }
      });

      // Prepare update payload
      const updatePayload = {
        id: id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        childCategory: formData.childCategory || null,
        language: formData.language || null,
        tags: formData.tags,
        location: cleanLocation,
        contact: formData.contact,
        social: formData.social
      };

      // Add images only if they were changed
      if (imagePreview.cover && imagePreview.cover !== page?.cover_image) {
        updatePayload.cover_image = imagePreview.cover;
      }
      if (imagePreview.logo && imagePreview.logo !== page?.logo_image) {
        updatePayload.logo_image = imagePreview.logo;
      }

      await updatePage(updatePayload).unwrap();
      
      setShowSuccessMessage(true);
      setErrorMessage('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/pages/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to update page:', error);
      setErrorMessage(error.data?.message || 'Failed to update page. Please try again.');
    }
  };

  // Loading state
  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not owner
  if (pageError || !page || !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/pages')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Pages
          </button>
          
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold mb-2">
                {!isOwner ? 'You do not have permission to edit this page' : 'Page not found'}
              </p>
              <p className="text-gray-600 text-sm">
                {!isOwner ? 'Only the page owner can edit this page' : 'This page may have been deleted'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/pages/${id}`)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Edit Page</h1>
              <p className="text-gray-600 font-medium">Update your page information</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={updating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
          >
            {updating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-bold text-green-900">Success!</p>
              <p className="text-sm text-green-700">Your page has been updated. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <p className="font-bold text-red-900">Error</p>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Section Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'basic', label: 'Basic Info', icon: FileText },
              { id: 'images', label: 'Images', icon: Camera },
              { id: 'location', label: 'Location', icon: MapPin },
              { id: 'contact', label: 'Contact', icon: Phone },
              { id: 'social', label: 'Social Media', icon: Globe }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeSection === id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Sections */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          
          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Basic Information</h2>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your page title"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your page..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Category</option>
                    {categoriesData?.data?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                {availableSubcategories.length > 0 && (
                  <div>
                    <label className="block text-gray-900 font-semibold mb-2">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.childCategory || ''}
                      onChange={(e) => handleInputChange('childCategory', e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Subcategory</option>
                      {availableSubcategories.map((subcat) => (
                        <option key={subcat._id} value={subcat._id}>
                          {subcat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Language */}
                <div className={availableSubcategories.length === 0 ? '' : 'md:col-span-2'}>
                  <label className="block text-gray-900 font-semibold mb-2">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Language</option>
                    {languagesData?.data?.map((lang) => (
                      <option key={lang._id} value={lang._id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Tags</label>
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and press Enter"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-100 border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Images Section */}
          {activeSection === 'images' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Page Images</h2>

              {/* Cover Image */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Cover Image</label>
                <div className="relative">
                  {imagePreview.cover ? (
                    <div className="relative h-64 rounded-2xl overflow-hidden border-2 border-gray-200">
                      <img 
                        src={imagePreview.cover} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                          <Camera className="w-5 h-5" />
                          Change Cover
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'cover')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-gray-600 font-semibold">Click to upload cover image</span>
                      <span className="text-gray-400 text-sm">PNG, JPG up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cover')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Logo Image */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Logo Image</label>
                <div className="relative">
                  {imagePreview.logo ? (
                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-gray-200">
                      <img 
                        src={imagePreview.logo} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-gray-900 p-3 rounded-lg">
                          <Camera className="w-6 h-6" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600 font-semibold text-sm text-center">Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Location</h2>
              <LocationSelect
                geoLocations={geoLocationsData?.data || []}
                selectedLocation={formData.location}
                onChange={handleLocationChange}
              />
            </div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.contact.whatsapp}
                    onChange={(e) => handleNestedChange('contact', 'whatsapp', e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Telegram</label>
                  <input
                    type="text"
                    value={formData.contact.telegram}
                    onChange={(e) => handleNestedChange('contact', 'telegram', e.target.value)}
                    placeholder="@username"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Section */}
          {activeSection === 'social' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Social Media Links</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.social.website}
                    onChange={(e) => handleNestedChange('social', 'website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.social.facebook}
                    onChange={(e) => handleNestedChange('social', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.social.instagram}
                    onChange={(e) => handleNestedChange('social', 'instagram', e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-6 flex justify-between items-center bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <button
            onClick={() => navigate(`/pages/${id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={updating}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
          >
            {updating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageEdit;