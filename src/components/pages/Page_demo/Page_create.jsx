import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {Store,FileText,MapPin,Image as ImageIcon,Phone,Share2,CheckCircle,AlertCircle,X,Globe,Edit3,Camera,Save,Tag,Users,Star,Send,Award,Crown,Gem} from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PhoneInputStyles.css';
import { isValidPhoneNumber } from 'react-phone-number-input';

// Redux
import {setPageType,updateFormData,updateNestedFormData,resetPageCreate,addTag,removeTag} from '../../../features/redux/pagecreationSlice.js';

// RTK Query
import { useGetPageTypesQuery } from '../../../features/pagetypeApi.js';
import { useCategoryQuery } from '../../../features/categorySlice.js';
import { useLanguageQuery } from '../../../features/languageSlice.js';
import { useLocationQuery } from '../../../features/locationSlice.js';
import { useCreatePageMutation } from '../../../features/pageApiSlice.js';
import { useGetAllImagePricesQuery } from '../../../features/page.imagePriceApi.js';

// Components
import LocationSelect from '../../component/_Location.page.jsx';
import GalleryWithPricing from '../../component/page/Gallerywithpricing.jsx';
import PageCreationConfirmationModal from '../PageCreationConfirmationModal.jsx';

// Utils
import { calculateTotalPageCost } from '../../../functions/calculatePageCost.js';

const getCurrencyFromLocation = (location) => {
  if (!location || !location.countryName) {
    return { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'US' };
  }
  
  const country = location.countryName.toLowerCase();
  
  if (country.includes('sri lanka') || country.includes('lanka')) {
    return { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', countryCode: 'LK' };
  }
  if (country.includes('australia')) {
    return { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', countryCode: 'AU' };
  }
  if (country.includes('india')) {
    return { code: 'INR', symbol: '₹', name: 'Indian Rupee', countryCode: 'IN' };
  }
  if (country.includes('united states') || country.includes('usa') || country.includes('america')) {
    return { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'US' };
  }
  
  return { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'US' };
};

const getPriceForCountry = (prices, currencyConfig) => {
  const countryCode = currencyConfig?.countryCode || 'US';
  
  const pricesObj = prices instanceof Map ? Object.fromEntries(prices) : prices;
  
  const currencyCodeMap = {
    'US': 'USD',
    'LK': 'LK',
    'AU': 'AUD',
    'IN': 'INR',
    'AE': 'AED'
  };
  
  const currencyCode = currencyCodeMap[countryCode] || countryCode;
  
  if (pricesObj?.[countryCode]) {
    return pricesObj[countryCode];
  }
  if (pricesObj?.[currencyCode]) {
    return pricesObj[currencyCode];
  }
  if (pricesObj?.LK) {
    return pricesObj.LK;
  }
  if (pricesObj?.US) {
    return pricesObj.US;
  }
  if (pricesObj?.USD) {
    return pricesObj.USD;
  }
  
  const firstPrice = Object.values(pricesObj || {})[0];
  return firstPrice || { price: 0, gateway: 'stripe' };
};

// Icon mapping for page types
const PAGE_TYPE_ICONS = {
  'Basic Page': { icon: FileText, color: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' },
  'Standard Page': { icon: Award, color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
  'Premium Page': { icon: Crown, color: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600' },
  'VIP Page': { icon: Gem, color: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600' },
};

const getPageTypeIcon = (pageTypeName) => {
  const iconData = PAGE_TYPE_ICONS[pageTypeName] || PAGE_TYPE_ICONS['Basic Page'];
  return iconData;
};

// Skeleton Components
const SkeletonBox = ({ className = '', onClick }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded cursor-pointer hover:bg-gray-300 transition-colors ${className}`}
    onClick={onClick}
  ></div>
);

const SkeletonText = ({ className = '', onClick }) => (
  <div 
    className={`h-3 bg-gray-200 animate-pulse rounded cursor-pointer hover:bg-gray-300 transition-colors ${className}`}
    onClick={onClick}
  ></div>
);

const SkeletonCircle = ({ className = '', onClick }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded-full cursor-pointer hover:bg-gray-300 transition-colors ${className}`}
    onClick={onClick}
  ></div>
);

// Edit Modal Component
const EditModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Page_create = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { pageType, formData, errors } = useSelector((state) => state.pageCreate);
  const { user } = useSelector((state) => state.auth);
  const currencyConfig = getCurrencyFromLocation(formData.location);

  // RTK Queries
  const { data: pageTypesData, isLoading: loadingPageTypes } = useGetPageTypesQuery();
  const { data: categoriesData, isLoading: loadingCategories } = useCategoryQuery();
  const { data: languagesData } = useLanguageQuery();
  const { data: geoLocationsData, isLoading: loadingLocations } = useLocationQuery();
  const { data: imagePricesData } = useGetAllImagePricesQuery();

  // Mutation
  const [createPage, { isLoading: creating }] = useCreatePageMutation();

  // ✅ NEW: Track payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Local state for modals
  const [editingSection, setEditingSection] = useState(null);
  const [currentTag, setCurrentTag] = useState('');
  const [activeTab, setActiveTab] = useState('About');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [costData, setCostData] = useState(null);
  const [imagePreview, setImagePreview] = useState({
    cover: null,
    logo: null,
    gallery: [],
  });

  // State for subcategory management
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category && categoriesData?.data) {
      const category = categoriesData.data.find(cat => cat._id === formData.category);
      if (category) {
        setSelectedCategory(category);
        setAvailableSubcategories(category.children || []);
        
        if (selectedSubcategory && !category.children?.find(sub => sub._id === selectedSubcategory)) {
          setSelectedSubcategory(null);
          dispatch(updateFormData({ childCategory: null }));
        }
      }
    } else {
      setSelectedCategory(null);
      setAvailableSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [formData.category, categoriesData]);

  const getCategoryDisplayName = () => {
    if (!formData.category) return null;
    const category = categoriesData?.data?.find(c => c._id === formData.category);
    return category?.name;
  };

  const getSubcategoryDisplayName = () => {
    if (!formData.childCategory || !selectedCategory) return null;
    const subcategory = selectedCategory.children?.find(sub => sub._id === formData.childCategory);
    return subcategory?.name;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      
      if (type === 'cover') {
        dispatch(updateFormData({ cover_image: base64 }));
        setImagePreview({ ...imagePreview, cover: base64 });
      } else if (type === 'logo') {
        dispatch(updateFormData({ logo_image: base64 }));
        setImagePreview({ ...imagePreview, logo: base64 });
      }
    } catch (error) {
      console.error('Error converting image:', error);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      dispatch(addTag(currentTag.trim()));
      setCurrentTag('');
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!pageType) {
      alert('Please select a page type');
      setEditingSection('pageType');
      return;
    }
    if (!formData.title?.trim()) {
      alert('Please add a page title');
      setEditingSection('basic');
      return;
    }
    if (!formData.description?.trim()) {
      alert('Please add a description');
      setEditingSection('basic');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      setEditingSection('basic');
      return;
    }
    if (availableSubcategories.length > 0 && !formData.childCategory) {
      alert('Please select a subcategory');
      setEditingSection('basic');
      return;
    }

    const calculatedCost = calculateTotalPageCost({
      pageType,
      imageCount: imagePreview.gallery.length,
      imagePricingPlans: imagePricesData?.data || [],
      currencyConfig
    });

    setCostData(calculatedCost);
    setShowConfirmationModal(true);
  };

  // ✅ UPDATED: Handle confirmation modal action with payment state
  const handleConfirmationAction = async (action, paymentSuccess = false) => {
    if (action === 'create') {
      // ✅ If payment was required and successful, or if it's free
      if (paymentSuccess || costData?.isFree) {
        try {
          const cleanLocation = {};
          Object.keys(formData.location).forEach(key => {
            const value = formData.location[key];
            if (value && value !== '' && value !== null) {
              cleanLocation[key] = value;
            }
          });

          const payload = {
            ...formData,
            location: cleanLocation,
            pagetype: pageType?._id
          };

          delete payload.userId;

          console.log('📤 Submitting page creation payload:', payload);

          const result = await createPage(payload).unwrap();
          
          console.log('✅ Page created successfully:', result);
          
          // Close modal first
          setShowConfirmationModal(false);
          setIsProcessingPayment(false);
          
          // Show success message
          alert('Page created successfully!');
          
          // Reset form and navigate
          dispatch(resetPageCreate());
          navigate('/pages');
        } catch (error) {
          console.error('❌ Failed to create page:', error);
          setIsProcessingPayment(false);
          
          if (error.data?.message) {
            alert(`Failed to create page: ${error.data.message}`);
          } else if (error.message) {
            alert(`Failed to create page: ${error.message}`);
          } else {
            alert('Failed to create page. Please try again.');
          }
        }
      }
    }
  };

  const currentPageTypeIcon = pageType ? getPageTypeIcon(pageType.name) : null;
  const PageTypeIconComponent = currentPageTypeIcon?.icon;

  // ✅ Calculate if button should be disabled
  const isSubmitDisabled = creating || isProcessingPayment;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Page</h1>
          <p className="text-gray-600">Click on any section to edit and customize</p>
          
          <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm">
            <Globe className="w-4 h-4" />
            <span className="font-semibold">
              Pricing in {currencyConfig.name} ({currencyConfig.symbol})
            </span>
            {!formData.location.countryName && (
              <span className="text-xs opacity-75 ml-2">• Add location to change currency</span>
            )}
          </div>
        </div>

        {/* Page Preview/Editor */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Cover Image Section */}
          <div className="relative">
            {imagePreview.cover ? (
              <div className="relative h-64 group">
                <img 
                  src={imagePreview.cover} 
                  alt="Cover" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
              <div className="relative h-64 bg-gradient-to-br from-[#00008F]/10 to-blue-100 group cursor-pointer">
                <SkeletonBox className="w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <label className="cursor-pointer bg-[#00008F] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#00006F] transition-colors shadow-lg">
                    <Camera className="w-5 h-5" />
                    Add Cover Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={() => setEditingSection('cover')}
              className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          {/* Logo and Title Section */}
          <div className="px-6 pb-6">
            <div className="flex items-start gap-4 -mt-16 relative z-10">
              {/* Logo */}
              <div className="relative group">
                {imagePreview.logo ? (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                      <img 
                        src={imagePreview.logo} 
                        alt="Logo" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-lg">
                      <SkeletonCircle className="w-full h-full" />
                    </div>
                    <label className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Title and Stats */}
              <div className="flex-1 pt-16">
                {formData.title ? (
                  <h1 
                    className="text-3xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-[#00008F] transition-colors"
                    onClick={() => setEditingSection('basic')}
                  >
                    {formData.title}
                  </h1>
                ) : (
                  <div 
                    onClick={() => setEditingSection('basic')}
                    className="space-y-2 mb-3"
                  >
                    <SkeletonText className="w-2/3 h-8" />
                  </div>
                )}

                {/* Page Type Badge with Icon */}
                {pageType ? (
                  <div 
                    onClick={() => setEditingSection('pageType')}
                    className={`inline-flex items-center gap-2 bg-gradient-to-r ${currentPageTypeIcon?.gradient} text-white px-4 py-2 rounded-lg text-sm font-semibold mb-3 shadow-md cursor-pointer hover:shadow-lg transition-all`}
                  >
                    {PageTypeIconComponent && <PageTypeIconComponent className="w-5 h-5" />}
                    {pageType.name}
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded">
                      {(() => {
                        const priceInfo = getPriceForCountry(pageType.prices, currencyConfig);
                        return priceInfo.price === 0 ? 'Free' : `${currencyConfig.symbol}${priceInfo.price}`;
                      })()}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSection('pageType')}
                    className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors mb-3"
                  >
                    Select Page Type
                  </button>
                )}

                {/* Location */}
                <div 
                  className="flex items-center gap-2 text-gray-600 mb-4 cursor-pointer hover:text-[#00008F] transition-colors"
                  onClick={() => setEditingSection('location')}
                >
                  <MapPin className="w-4 h-4" />
                  {formData.location.townName || formData.location.districtName || formData.location.countryName ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {[
                          formData.location.villageName,
                          formData.location.townName,
                          formData.location.municipalityName,
                          formData.location.districtName,
                          formData.location.stateName,
                          formData.location.countryName,
                        ].filter(Boolean).slice(0, 2).join(', ')}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        {currencyConfig.code}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Add location • Determines currency</span>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 mb-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                    onClick={() => setEditingSection('basic')}
                  >
                    <Users className="w-5 h-5 text-[#00008F]" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">0</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>

                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                    onClick={() => setActiveTab('Reviews')}
                  >
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">0.0</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 bg-[#00008F]/10 text-[#00008F] rounded-lg hover:bg-[#00008F]/20 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Share</span>
                  </button>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditingSection('basic')}
                className="bg-[#00008F] text-white p-3 rounded-lg hover:bg-[#00006F] transition-colors mt-16 shadow-lg"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-t border-b border-gray-200 -mx-6 px-6 mt-6">
              <div className="flex gap-1 overflow-x-auto py-2">
                {['About', 'Contact', 'Gallery', 'Advertisement', 'Need', 'Offer', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-[#00008F] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* About Section */}
            {activeTab === 'About' && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                  {formData.description ? (
                    <p 
                      className="text-gray-700 leading-relaxed cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      onClick={() => setEditingSection('basic')}
                    >
                      {formData.description}
                    </p>
                  ) : (
                    <div 
                      onClick={() => setEditingSection('basic')}
                      className="space-y-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <SkeletonText className="w-full" />
                      <SkeletonText className="w-full" />
                      <SkeletonText className="w-4/5" />
                      <SkeletonText className="w-3/5" />
                    </div>
                  )}
                </div>

                {formData.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-[#00008F]/10 text-[#00008F] px-3 py-1 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div 
                  onClick={() => setEditingSection('basic')}
                  className="bg-white border border-gray-200 p-4 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#00008F]" />
                    Page Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {formData.category ? (
                      <>
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Category:</span> 
                          {getCategoryDisplayName()}
                        </p>
                        {formData.childCategory && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">Subcategory:</span> 
                            {getSubcategoryDisplayName()}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-400">Click to add category</p>
                    )}
                    {formData.language && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Language:</span> 
                        {languagesData?.data?.find(l => l._id === formData.language)?.name || 'Selected'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeTab === 'Contact' && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  
                  <div className="space-y-3">
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-[#00008F] rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Phone</p>
                        {formData.contact.phone ? (
                          <p className="text-gray-700">{formData.contact.phone}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add phone number</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                        {formData.contact.whatsapp ? (
                          <p className="text-gray-700">{formData.contact.whatsapp}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add WhatsApp number</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Email</p>
                        {formData.contact.email ? (
                          <p className="text-gray-700">{formData.contact.email}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add email address</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Telegram</p>
                        {formData.contact.telegram ? (
                          <p className="text-gray-700">{formData.contact.telegram}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add Telegram username</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
                  
                  <div className="space-y-3">
                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Website</p>
                        {formData.social.website ? (
                          <p className="text-gray-700 text-sm truncate">{formData.social.website}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add website URL</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Facebook</p>
                        {formData.social.facebook ? (
                          <p className="text-gray-700 text-sm truncate">{formData.social.facebook}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add Facebook page</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>

                    <div 
                      onClick={() => setEditingSection('contact')}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Instagram</p>
                        {formData.social.instagram ? (
                          <p className="text-gray-700 text-sm truncate">{formData.social.instagram}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click to add Instagram profile</p>
                        )}
                      </div>
                      <Edit3 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                  <div 
                    onClick={() => setEditingSection('location')}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00008F]/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Address</p>
                      {formData.location.townName || formData.location.districtName || formData.location.countryName ? (
                        <p className="text-gray-700 text-sm">
                          {[
                            formData.location.villageName,
                            formData.location.townName,
                            formData.location.municipalityName,
                            formData.location.districtName,
                            formData.location.provinceName,
                            formData.location.stateName,
                            formData.location.countryName,
                          ].filter(Boolean).join(', ')}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm">Click to add location</p>
                      )}
                    </div>
                    <Edit3 className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Section */}
            {activeTab === 'Gallery' && (
              <GalleryWithPricing 
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                formData={formData}
                country={currencyConfig.countryCode}
                currencyConfig={currencyConfig}
              />
            )}

            {/* Advertisement Section */}
            {activeTab === 'Advertisement' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Advertisements</h3>
                  <button className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors">
                    Create Ad
                  </button>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No advertisements yet</p>
                  <p className="text-gray-400 text-sm mb-4">Promote your products or services</p>
                  <button className="bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold">
                    Create Advertisement
                  </button>
                </div>
              </div>
            )}

            {/* Need Section */}
            {activeTab === 'Need' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Needs</h3>
                  <button className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors">
                    Add Need
                  </button>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No needs posted yet</p>
                  <p className="text-gray-400 text-sm mb-4">Share what you're looking for</p>
                  <button className="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold">
                    Post a Need
                  </button>
                </div>
              </div>
            )}

            {/* Offer Section */}
            {activeTab === 'Offer' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Offers</h3>
                  <button className="bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors">
                    Create Offer
                  </button>
                </div>

                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No offers available</p>
                  <p className="text-gray-400 text-sm mb-4">Share special deals with your followers</p>
                  <button className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold">
                    Create Special Offer
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {activeTab === 'Reviews' && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Ratings & Reviews</h3>
                  <button className="text-[#00008F] text-sm font-semibold hover:underline">
                    See All
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[#00008F]/5 to-blue-50 rounded-xl p-6 border border-[#00008F]/10">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-[#00008F] mb-2">0.0</div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-5 h-5 text-gray-300 fill-gray-300"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">0 reviews</p>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3 mb-2">
                          <span className="text-xs text-gray-600 w-8">{rating} ★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-yellow-400 h-full rounded-full transition-all"
                              style={{ width: '0%' }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No reviews yet</p>
                  <p className="text-gray-400 text-sm">Be the first to leave a review!</p>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <SkeletonCircle className="w-12 h-12 flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div>
                            <SkeletonText className="w-32 h-4 mb-2" />
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                                ))}
                              </div>
                              <SkeletonText className="w-16 h-3" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <SkeletonText className="w-full h-3" />
                            <SkeletonText className="w-4/5 h-3" />
                            <SkeletonText className="w-3/5 h-3" />
                          </div>
                          <div className="flex items-center gap-4">
                            <SkeletonText className="w-12 h-4" />
                            <SkeletonText className="w-12 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Save Button with proper disabled state */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg
              ${isSubmitDisabled 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-[#00008F] hover:bg-[#00006F] text-white'
              }`}
          >
            {isProcessingPayment ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </>
            ) : creating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Page...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Page
              </>
            )}
          </button>
        </div>

        {/* Edit Modals */}
        
        {/* Page Type Modal */}
        <EditModal
          isOpen={editingSection === 'pageType'}
          onClose={() => setEditingSection(null)}
          title="Select Page Type"
        >
          {loadingPageTypes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 border-2 border-gray-200 rounded-xl space-y-4">
                  <SkeletonBox className="h-6 w-3/4" />
                  <div className="space-y-2">
                    <SkeletonText className="w-full" />
                    <SkeletonText className="w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pageTypesData?.data?.map((type) => {
                const priceInfo = getPriceForCountry(type.prices, currencyConfig);
                const isFree = priceInfo.price === 0;
                const isSelected = pageType?._id === type._id;
                const typeIcon = getPageTypeIcon(type.name);
                const TypeIcon = typeIcon.icon;

                return (
                  <div
                    key={type._id}
                    onClick={() => {
                      dispatch(setPageType(type));
                      setEditingSection(null);
                    }}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-[#00008F] bg-[#00008F]/5'
                        : 'border-gray-200 hover:border-[#00008F]/50'
                    }`}
                  >
                    <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${typeIcon.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex items-start justify-between mb-3 pr-16">
                      <h3 className="text-lg font-bold text-gray-900">{type.name}</h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-[#00008F]" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{type.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-[#00008F]">
                          {isFree ? 'Free' : `${currencyConfig.symbol}${priceInfo.price}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid Days:</span>
                        <span className="font-bold text-gray-900">{type.validdays || 'Unlimited'}</span>
                      </div>
                      {!isFree && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment via:</span>
                          <span className="font-semibold text-gray-700 capitalize">{priceInfo.gateway}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </EditModal>

        {/* Basic Info Modal */}
        <EditModal
          isOpen={editingSection === 'basic'}
          onClose={() => setEditingSection(null)}
          title="Edit Basic Information"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => dispatch(updateFormData({ title: e.target.value }))}
                placeholder="Enter your page title"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => dispatch(updateFormData({ description: e.target.value }))}
                placeholder="Describe your page..."
                rows={5}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    dispatch(updateFormData({ category: e.target.value }));
                    dispatch(updateFormData({ childCategory: null }));
                    setSelectedSubcategory(null);
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                >
                  <option value="">Select Category</option>
                  {categoriesData?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {availableSubcategories.length > 0 && (
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.childCategory || ''}
                    onChange={(e) => {
                      dispatch(updateFormData({ childCategory: e.target.value }));
                      setSelectedSubcategory(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
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

              <div className={availableSubcategories.length === 0 ? '' : 'md:col-span-2'}>
                <label className="block text-gray-900 font-semibold mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => dispatch(updateFormData({ language: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
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

            <div>
              <label className="block text-gray-900 font-semibold mb-2">Tags</label>
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-[#00008F]/10 border border-[#00008F] text-[#00008F] px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      onClick={() => dispatch(removeTag(tag))}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setEditingSection(null)}
              className="w-full bg-[#00008F] text-white py-3 rounded-xl font-semibold hover:bg-[#00006F] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </EditModal>

        {/* Location Modal */}
        <EditModal
          isOpen={editingSection === 'location'}
          onClose={() => setEditingSection(null)}
          title="Edit Location"
        >
          <div className="space-y-6">
            {formData.location.countryName && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Currency Based on Location</p>
                    <p className="text-lg font-bold text-blue-600">
                      {currencyConfig.name} ({currencyConfig.symbol})
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      All prices will be shown in {currencyConfig.code}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <LocationSelect
              geoLocations={geoLocationsData?.data || []}
              selectedLocation={formData.location}
              onChange={(locationData) => {
                dispatch(updateNestedFormData({ 
                  field: 'location', 
                  data: locationData 
                }));
              }}
            />

            <button
              onClick={() => setEditingSection(null)}
              className="w-full bg-[#00008F] text-white py-3 rounded-xl font-semibold hover:bg-[#00006F] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </EditModal>

        {/* Contact Modal */}
        <EditModal
          isOpen={editingSection === 'contact'}
          onClose={() => setEditingSection(null)}
          title="Edit Contact Information"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  international
                  defaultCountry="LK"
                  value={formData.contact.phone}
                  onChange={(value) =>
                    dispatch(
                      updateNestedFormData({
                        field: 'contact',
                        data: { phone: value }
                      })
                    )
                  }
                  className="phone-input-wrapper"
                />
                {formData.contact.phone && !isValidPhoneNumber(formData.contact.phone) && (
                  <p className="text-sm text-red-600 mt-1">
                    Invalid phone number
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  WhatsApp
                </label>
                <PhoneInput
                  international
                  defaultCountry="LK"
                  value={formData.contact.whatsapp}
                  onChange={(value) =>
                    dispatch(
                      updateNestedFormData({
                        field: 'contact',
                        data: { whatsapp: value }
                      })
                    )
                  }
                  placeholder="+94 77 123 4567"
                  className="phone-input-wrapper"
                />
                {formData.contact.whatsapp && !isValidPhoneNumber(formData.contact.whatsapp) && (
                  <p className="text-sm text-red-600 mt-1">
                    Invalid WhatsApp number
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  You can use a different number or same as Phone.
                </p>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) =>
                    dispatch(
                      updateNestedFormData({
                        field: 'contact',
                        data: { email: e.target.value }
                      })
                    )
                  }
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Telegram</label>
                <input
                  type="text"
                  value={formData.contact.telegram}
                  onChange={(e) =>
                    dispatch(
                      updateNestedFormData({
                        field: 'contact',
                        data: { telegram: e.target.value }
                      })
                    )
                  }
                  placeholder="@username"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.social.website}
                    onChange={(e) =>
                      dispatch(updateNestedFormData({ field: 'social', data: { website: e.target.value } }))
                    }
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.social.facebook}
                    onChange={(e) =>
                      dispatch(updateNestedFormData({ field: 'social', data: { facebook: e.target.value } }))
                    }
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.social.instagram}
                    onChange={(e) =>
                      dispatch(updateNestedFormData({ field: 'social', data: { instagram: e.target.value } }))
                    }
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditingSection(null)}
              className="w-full bg-[#00008F] text-white py-3 rounded-xl font-semibold hover:bg-[#00006F] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </EditModal>

        {/* ✅ Confirmation Modal */}
        {costData && (
          <PageCreationConfirmationModal
            isOpen={showConfirmationModal}
            onClose={() => !isProcessingPayment && setShowConfirmationModal(false)}
            onConfirm={handleConfirmationAction}
            costData={costData}
            isCreating={creating}
            isProcessingPayment={isProcessingPayment}
            setIsProcessingPayment={setIsProcessingPayment}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Page_create;