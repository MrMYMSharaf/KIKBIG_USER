import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
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
  CheckCircle,
  Trash2,
  DollarSign,
  Crown,
  Zap,
  Info,
  Award,
  Gem
} from 'lucide-react';
import Swal from 'sweetalert2';

// RTK Query
import { useGetPageByIdQuery, useUpdatePageMutation } from '../../features/pageApiSlice';
import { useCategoryQuery } from '../../features/categorySlice';
import { useLanguageQuery } from '../../features/languageSlice';
import { useLocationQuery } from '../../features/locationSlice';
import { useGetAllImagePricesQuery } from '../../features/page.imagePriceApi';
import { useGetPageTypesQuery } from '../../features/pagetypeApi';

// Components
import LocationSelect from '../component/_Location.page';

// Utils
import { formatCurrency } from '../../functions/calculatePageCost';
import { handlePagePayment } from '../../functions/handlePagePayment';

// ✅ Page Type Icons
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

// ✅ Helper to get currency from location
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

// ✅ Helper to get price for country
const getPriceForCountry = (prices, countryCode) => {
  if (!prices) return { price: 0, gateway: 'stripe' };
  const key = countryCode || 'US';
  
  const currencyCodeMap = {
    'US': 'USD',
    'LK': 'LK',
    'AU': 'AUD',
    'IN': 'INR',
    'AE': 'AED'
  };
  
  const currencyCode = currencyCodeMap[key] || key;
  
  return prices[key] || prices[currencyCode] || prices['LK'] || prices['US'] || prices['USD'] || Object.values(prices)[0] || { price: 0, gateway: 'stripe' };
};

const PageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // RTK Queries
  const { data: pageData, isLoading: loadingPage, error: pageError } = useGetPageByIdQuery(id);
  const { data: categoriesData } = useCategoryQuery();
  const { data: languagesData } = useLanguageQuery();
  const { data: geoLocationsData } = useLocationQuery();
  const { data: imagePricesData } = useGetAllImagePricesQuery();
  const { data: pageTypesData } = useGetPageTypesQuery();
  
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
    logo: null,
    gallery: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [showPageTypeModal, setShowPageTypeModal] = useState(false);
  const [selectedPageType, setSelectedPageType] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // ✅ Track original values for payment detection
  const [originalPageType, setOriginalPageType] = useState(null);
  const [originalGalleryCount, setOriginalGalleryCount] = useState(0);

  // Subcategory management
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  const page = pageData?.data;
  const isOwner = page?.isOwner === true;

  // ✅ Get currency config from location
  const currencyConfig = getCurrencyFromLocation(formData.location);
  const country = currencyConfig.countryCode;

  // ✅ Calculate gallery pricing
  const [pricingPlan, setPricingPlan] = useState(null);

  const calculatePricing = (imageCount, plans, countryCode, currency) => {
    const freePlan = plans.find(p => p.name.toLowerCase() === 'free');
    const basicPlan = plans.find(p => p.name.toLowerCase() === 'basic');
    const proPlan = plans.find(p => p.name.toLowerCase() === 'pro');
    
    if (!basicPlan || !proPlan) return null;

    const basicPriceInfo = getPriceForCountry(basicPlan.prices, countryCode);
    const proPriceInfo = getPriceForCountry(proPlan.prices, countryCode);

    let totalCost = 0;
    let breakdown = [];
    
    const freeImages = freePlan?.imageLimit || 2;
    const basicLimit = basicPlan.imageLimit;
    const basicPrice = basicPriceInfo.price;
    const proPrice = proPriceInfo.price;

    if (imageCount <= freeImages) {
      breakdown.push(`${imageCount} images: Free`);
    } else if (imageCount <= basicLimit) {
      totalCost = basicPrice;
      breakdown.push(`${freeImages} images: Free`);
      breakdown.push(`${imageCount - freeImages} additional images: ${currency.symbol}${basicPrice}`);
    } else {
      const proImages = imageCount - basicLimit;
      totalCost = basicPrice + (proImages * proPrice);
      breakdown.push(`${freeImages} images: Free`);
      breakdown.push(`${basicLimit - freeImages} images (Basic): ${currency.symbol}${basicPrice}`);
      breakdown.push(`${proImages} extra images (Pro): ${currency.symbol}${(proImages * proPrice).toFixed(2)} (${currency.symbol}${proPrice}/image)`);
    }

    return {
      imageCount,
      totalCost,
      breakdown,
      freeImages,
      basicLimit,
      basicPrice,
      proPrice,
      currency: currency.code,
      currencySymbol: currency.symbol,
      isInFreeRange: imageCount <= freeImages,
      isInBasicRange: imageCount > freeImages && imageCount <= basicLimit,
      isInProRange: imageCount > basicLimit,
      gateway: imageCount > freeImages ? (imageCount <= basicLimit ? basicPriceInfo.gateway : proPriceInfo.gateway) : null,
    };
  };

  useEffect(() => {
    if (!imagePricesData?.data) return;

    const imageCount = imagePreview.gallery.length;
    const plans = imagePricesData.data;

    const pricingInfo = calculatePricing(imageCount, plans, country, currencyConfig);
    setPricingPlan(pricingInfo);
  }, [imagePreview.gallery.length, imagePricesData, country, currencyConfig]);

  // ✅ Load page data into form - FIXED to show all data
  useEffect(() => {
    if (page) {
      console.log('📥 Loading page data:', page);
      
      // ✅ Set original values for payment detection
      setOriginalPageType(page.pagetype?._id);
      setOriginalGalleryCount(page.images?.length || 0);
      setSelectedPageType(page.pagetype?._id);

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
        logo: page.logo_image || null,
        gallery: page.images || []
      });

      console.log('✅ Data loaded - Category:', page.category?._id, 'SubCategory:', page.childCategory?._id, 'Tags:', page.tags);
    }
  }, [page]);

  // ✅ Update subcategories - FIXED to preserve subcategory on load
  useEffect(() => {
    if (formData.category && categoriesData?.data) {
      const category = categoriesData.data.find(cat => cat._id === formData.category);
      if (category) {
        console.log('📂 Category found:', category.name, 'Children:', category.children);
        setAvailableSubcategories(category.children || []);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category, categoriesData]);

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
      setImagePreview(prev => ({ ...prev, [type]: base64 }));
    } catch (error) {
      console.error('Error converting image:', error);
      setErrorMessage('Failed to upload image');
    }
  };

  const handleGalleryImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    try {
      const base64Promises = files.map(file => convertToBase64(file));
      const base64Images = await Promise.all(base64Promises);
      
      setImagePreview(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...base64Images]
      }));
    } catch (error) {
      console.error('Error converting gallery images:', error);
      setErrorMessage('Failed to upload some gallery images');
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setImagePreview(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
  };

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

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ✅ PAYMENT DETECTION LOGIC
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

    let requiresPayment = false;
    let paymentAmount = 0;
    let paymentReason = [];

    // 1️⃣ Check if page type changed
    const pageTypeChanged = selectedPageType !== originalPageType;
    console.log('🔍 Page type check:', { selectedPageType, originalPageType, changed: pageTypeChanged });

    if (pageTypeChanged && pageTypesData?.data) {
      const newPageType = pageTypesData.data.find(pt => pt._id === selectedPageType);
      const oldPageType = pageTypesData.data.find(pt => pt._id === originalPageType);
      
      if (newPageType) {
        const newPriceInfo = getPriceForCountry(newPageType.prices, country);
        const oldPriceInfo = oldPageType ? getPriceForCountry(oldPageType.prices, country) : { price: 0 };
        
        console.log('💰 Page type pricing:', {
          old: oldPageType?.name,
          oldPrice: oldPriceInfo.price,
          new: newPageType.name,
          newPrice: newPriceInfo.price
        });

        if (newPriceInfo.price > oldPriceInfo.price) {
          const priceDifference = newPriceInfo.price - oldPriceInfo.price;
          paymentAmount += priceDifference;
          requiresPayment = true;
          paymentReason.push(`Page type upgrade: ${oldPageType?.name || 'Basic'} → ${newPageType.name} (+${currencyConfig.symbol}${priceDifference.toFixed(2)})`);
        }
      }
    }

    // 2️⃣ Check if gallery images increased
    const currentGalleryCount = imagePreview.gallery.length;
    const galleryIncreased = currentGalleryCount > originalGalleryCount;
    
    console.log('🖼️ Gallery check:', { 
      current: currentGalleryCount, 
      original: originalGalleryCount, 
      increased: galleryIncreased 
    });

    if (galleryIncreased && imagePricesData?.data) {
      const currentPricing = calculatePricing(currentGalleryCount, imagePricesData.data, country, currencyConfig);
      const originalPricing = calculatePricing(originalGalleryCount, imagePricesData.data, country, currencyConfig);
      
      const additionalImageCost = currentPricing.totalCost - originalPricing.totalCost;
      
      console.log('💰 Gallery pricing:', {
        currentTotal: currentPricing.totalCost,
        originalTotal: originalPricing.totalCost,
        difference: additionalImageCost
      });

      if (additionalImageCost > 0) {
        const newImagesCount = currentGalleryCount - originalGalleryCount;
        paymentAmount += additionalImageCost;
        requiresPayment = true;
        paymentReason.push(`${newImagesCount} new gallery images (+${currencyConfig.symbol}${additionalImageCost.toFixed(2)})`);
      }
    }

    console.log('💳 Payment decision:', { requiresPayment, paymentAmount, paymentReason });

    // ✅ If payment required, show confirmation and process payment
    if (requiresPayment && paymentAmount > 0) {
      const confirmResult = await Swal.fire({
        title: '<strong>💳 Payment Required</strong>',
        html: `
          <div class="text-left p-4">
            <p class="text-gray-700 mb-3 font-semibold">The following changes require payment:</p>
            <ul class="list-disc list-inside space-y-2 text-gray-600 mb-4">
              ${paymentReason.map(reason => `<li class="text-sm">${reason}</li>`).join('')}
            </ul>
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4">
              <p class="text-sm text-gray-600 mb-1">Total Payment Due</p>
              <p class="text-4xl font-black text-blue-600">${currencyConfig.symbol}${paymentAmount.toFixed(2)}</p>
              <p class="text-xs text-gray-500 mt-1">${currencyConfig.name} • via Payment Gateway</p>
            </div>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#00008F',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '💳 Proceed to Payment',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'rounded-2xl'
        }
      });

      if (!confirmResult.isConfirmed) {
        console.log('❌ User cancelled payment');
        return;
      }

      // ✅ Process payment
      setIsProcessingPayment(true);

      try {
        const pageTypeForPayment = pageTypesData?.data?.find(pt => pt._id === selectedPageType);
        
        console.log('🚀 Calling handlePagePayment...');
        const paymentSuccess = await handlePagePayment({
          pageType: pageTypeForPayment,
          amount: paymentAmount,
          currency: currencyConfig.code,
          countryCode: country,
          imagesCost: pricingPlan?.totalCost || 0,
          metadata: {
            pageId: id,
            pageTypeChanged,
            galleryIncreased,
            originalGalleryCount,
            newGalleryCount: currentGalleryCount,
            paymentReason: paymentReason.join(', ')
          }
        });

        setIsProcessingPayment(false);

        if (!paymentSuccess) {
          console.log('❌ Payment failed or cancelled');
          return;
        }

        console.log('✅ Payment successful');
      } catch (error) {
        console.error('❌ Payment error:', error);
        setIsProcessingPayment(false);
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: 'Failed to process payment. Please try again.'
        });
        return;
      }
    }

    // ✅ Proceed with update
    try {
      const cleanLocation = {};
      Object.keys(formData.location).forEach(key => {
        const value = formData.location[key];
        if (value && value !== '' && value !== null) {
          cleanLocation[key] = value;
        }
      });

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

      // ✅ Add page type if changed
      if (pageTypeChanged) {
        updatePayload.pagetype = selectedPageType;
      }

      if (imagePreview.cover && imagePreview.cover !== page?.cover_image) {
        updatePayload.cover_image = imagePreview.cover;
      }
      
      if (imagePreview.logo && imagePreview.logo !== page?.logo_image) {
        updatePayload.logo_image = imagePreview.logo;
      }

      const originalGallery = page?.images || [];
      const hasGalleryChanges = JSON.stringify(imagePreview.gallery) !== JSON.stringify(originalGallery);
      
      if (hasGalleryChanges) {
        updatePayload.images = imagePreview.gallery;
      }

      console.log('📤 Updating page:', updatePayload);

      await updatePage(updatePayload).unwrap();
      
      setShowSuccessMessage(true);
      setErrorMessage('');
      
      setTimeout(() => {
        navigate(`/page/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to update page:', error);
      setErrorMessage(error.data?.message || 'Failed to update page. Please try again.');
    }
  };

  // ✅ Get current page type info with pricing
  const currentPageType = selectedPageType && pageTypesData?.data 
    ? pageTypesData.data.find(pt => pt._id === selectedPageType)
    : null;

  const pageTypePriceInfo = currentPageType 
    ? getPriceForCountry(currentPageType.prices, country)
    : null;

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

  // ✅ Pricing Badge Component
  const PricingBadge = () => {
    if (!pricingPlan) return null;

    return (
      <div className="bg-gradient-to-r from-[#00008F] to-blue-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {pricingPlan.isInFreeRange && (
              <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                FREE
              </div>
            )}
            {pricingPlan.isInBasicRange && (
              <div className="bg-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                BASIC
              </div>
            )}
            {pricingPlan.isInProRange && (
              <div className="bg-purple-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                PRO
              </div>
            )}
            <span className="text-sm font-semibold">
              {pricingPlan.imageCount} {pricingPlan.imageCount === 1 ? 'Image' : 'Images'}
            </span>
          </div>
          <button
            onClick={() => setShowPricingInfo(!showPricingInfo)}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black">
            {pricingPlan.currencySymbol}{pricingPlan.totalCost.toFixed(2)}
          </span>
          <span className="text-sm opacity-80">
            {pricingPlan.currency} total
          </span>
        </div>

        {pricingPlan.gateway && (
          <div className="mt-2 text-xs opacity-80">
            Payment via: <span className="font-semibold capitalize">{pricingPlan.gateway}</span>
          </div>
        )}

        {showPricingInfo && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs font-semibold mb-2 opacity-90">Pricing Breakdown:</p>
            <div className="space-y-1">
              {pricingPlan.breakdown.map((item, index) => (
                <p key={index} className="text-xs opacity-80">• {item}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/page/${id}`)}
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
            disabled={updating || isProcessingPayment}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingPayment ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : updating ? (
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

        {/* ✅ Page Type Display - EDITABLE */}
        {currentPageType && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-900 mb-1">Current Page Type</h3>
                <p className="text-2xl font-black text-purple-600">{currentPageType.name}</p>
                <p className="text-sm text-gray-600 mt-1">{currentPageType.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Original Cost</p>
                <p className="text-3xl font-black text-purple-600">
                  {pageTypePriceInfo?.price === 0 ? 'FREE' : `${currencyConfig.symbol}${pageTypePriceInfo?.price}`}
                </p>
                {pageTypePriceInfo?.price > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    via {pageTypePriceInfo.gateway}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowPageTypeModal(true)}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                title="Change Page Type"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200 flex items-center justify-between">
              <p className="text-sm text-purple-700 flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Valid for <strong>{currentPageType.validdays || 'Unlimited'}</strong> days • Pricing in <strong>{currencyConfig.name}</strong></span>
              </p>
              <button
                onClick={() => setShowPageTypeModal(true)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Edit3 className="w-4 h-4" />
                Change Type
              </button>
            </div>
          </div>
        )}

        {/* Section Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'basic', label: 'Basic Info', icon: FileText },
              { id: 'images', label: 'Images', icon: Camera },
              { id: 'gallery', label: 'Gallery', icon: ImageIcon },
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

          {/* Gallery Section */}
          {activeSection === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Photo Gallery</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {imagePreview.gallery.length} {imagePreview.gallery.length === 1 ? 'image' : 'images'} uploaded
                    {originalGalleryCount > 0 && (
                      <span className="ml-2 text-blue-600 font-semibold">
                        ({originalGalleryCount} original + {imagePreview.gallery.length - originalGalleryCount} new)
                      </span>
                    )}
                  </p>
                </div>
                <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Add Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* ✅ Pricing Info */}
              {pricingPlan && imagePreview.gallery.length > 0 && <PricingBadge />}

              {imagePreview.gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreview.gallery.map((img, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square rounded-xl overflow-hidden group border-2 border-gray-200 hover:border-blue-400 transition-all"
                    >
                      <img 
                        src={img} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                        #{index + 1}
                      </div>

                      {index < (pricingPlan?.freeImages || 2) && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          FREE
                        </div>
                      )}

                      {index >= originalGalleryCount && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                          NEW
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-lg transform hover:scale-110"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-2xl">
                  <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">No photos yet</p>
                  <p className="text-gray-400 text-sm mb-6">Upload photos to showcase your page</p>
                  <label className="inline-flex cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Location</h2>
              
              {formData.location.countryName && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
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
                        All prices shown in {currencyConfig.code}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
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
            onClick={() => navigate(`/page/${id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={updating || isProcessingPayment}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingPayment ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : updating ? (
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

        {/* ✅ Page Type Selection Modal */}
        {showPageTypeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Change Page Type</h2>
                <button
                  onClick={() => setShowPageTypeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageTypesData?.data?.map((type) => {
                    const priceInfo = getPriceForCountry(type.prices, country);
                    const isFree = priceInfo.price === 0;
                    const isSelected = selectedPageType === type._id;
                    const isCurrent = originalPageType === type._id;
                    const typeIcon = getPageTypeIcon(type.name);
                    const TypeIcon = typeIcon.icon;

                    return (
                      <div
                        key={type._id}
                        onClick={() => setSelectedPageType(type._id)}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-[#00008F] bg-[#00008F]/5 shadow-lg'
                            : isCurrent
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 hover:border-[#00008F]/50 hover:shadow-md'
                        }`}
                      >
                        <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${typeIcon.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>

                        {isCurrent && (
                          <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            CURRENT
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-3 pr-16">
                          <h3 className="text-lg font-bold text-gray-900">{type.name}</h3>
                          {isSelected && !isCurrent && (
                            <CheckCircle className="w-5 h-5 text-[#00008F]" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{type.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-bold text-[#00008F]">
                              {isFree ? 'FREE' : `${currencyConfig.symbol}${priceInfo.price}`}
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

                {/* ✅ Show upgrade/downgrade info */}
                {selectedPageType && selectedPageType !== originalPageType && (
                  <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          {(() => {
                            const newType = pageTypesData?.data?.find(pt => pt._id === selectedPageType);
                            const oldType = pageTypesData?.data?.find(pt => pt._id === originalPageType);
                            const newPrice = newType ? getPriceForCountry(newType.prices, country).price : 0;
                            const oldPrice = oldType ? getPriceForCountry(oldType.prices, country).price : 0;
                            
                            if (newPrice > oldPrice) {
                              const difference = newPrice - oldPrice;
                              return `⬆️ Upgrade: Pay ${currencyConfig.symbol}${difference.toFixed(2)} difference`;
                            } else if (newPrice < oldPrice) {
                              return '⬇️ Downgrade: No additional payment required';
                            } else {
                              return '➡️ Same price tier - No additional payment';
                            }
                          })()}
                        </p>
                        <p className="text-xs text-blue-700">
                          {selectedPageType !== originalPageType && 'Payment will be processed when you save changes (if upgrading).'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedPageType(originalPageType);
                    setShowPageTypeModal(false);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPageTypeModal(false)}
                  disabled={!selectedPageType}
                  className="flex-1 px-6 py-3 bg-[#00008F] text-white rounded-xl font-bold hover:bg-[#00006F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageEdit;