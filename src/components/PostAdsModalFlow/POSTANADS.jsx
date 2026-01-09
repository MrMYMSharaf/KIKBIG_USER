import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFormData, setExtraImagesCount,updateContact } from "../../features/redux/adPostSlice";
import { useLanguageQuery } from "../../features/languageSlice";
import { useCategoryQuery } from "../../features/categorySlice";
import { useLocationQuery } from "../../features/locationSlice";
import { Navigate } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import LanguageSelect from "./_LanguageSelect";
import LocationSelect from "./_LocationSelect";
import DescriptionEditor from "../component/DescriptionEditor";
import ImageUpload from "../component/ImageUpload";
import CategorySelect from "./_CategorySelect";



const POSTANADS = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.adPost.formData);
  const isAuthenticated = useSelector(
  (state) => state.auth.isAuthenticated
);
  


// if (authLoading) return null; // wait until auth check is done
if (!isAuthenticated) return <Navigate to="/auth" replace />;



/////////////////////////////////////////////////////////////////////////////////////////////////////
// Optional: dynamic subtitle helper (if needed separately)
// ✅ Dynamic title and subtitle based on ad type
 const getAdHeaderTitle = () => {
  const adType = formData.typeofads || formData.adType;
  // console.log("Getting header title for:", adType);
  
  // Convert to lowercase and remove the 's' if present
  const normalizedType = adType?.toLowerCase().replace(/s$/, '');
  
  switch (normalizedType) {
    case "need":
      return "Post Your Need";
    case "offer":
      return "Post Your Offer";
    default:
      return "Post Your Ad";
  }
};

const getAdSubTitle = () => {
  const adType = formData.typeofads || formData.adType;
  
  // Convert to lowercase and remove the 's' if present
  const normalizedType = adType?.toLowerCase().replace(/s$/, '');
  
  switch (normalizedType) {
    case "need":
      return "Fill in the details to let others know what you're looking for";
    case "offer":
      return "Fill in the details to showcase your offer";
    default:
      return "Fill in the details below to create your listing";
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////

  const [locationOptions, setLocationOptions] = useState({
    regions: [],
    states: [],
    provinces: [],
    districts: [],
    counties: [],
    subDistricts: [],
    localAdministrativeUnits: [],
    municipalities: [],
    towns: [],
    villages: [],
  });

  // Use refs to track previous values and prevent unnecessary updates
  const previousLocationValues = useRef({});

  // Fetch data from APIs
  const { data: languagesData } = useLanguageQuery();
  const { data: categoriesData } = useCategoryQuery();
  const { data: locationsData } = useLocationQuery();

  const languages = languagesData?.data || [];
  // Only show categories where showAddPost === true
  const categories = (categoriesData?.data || []).filter(cat => cat.showAddPost);
  const countries = locationsData?.data || [];

  // 🔥 NEW: Get category pricing data from backend
  const getCategoryPricing = useCallback(() => {
    if (!formData.childCategory || !categories.length) {
      // Return default values if no category selected
      return {
        freeImages: 2,
        pricePerExtraImage: 100,
        maxImages: 10,
        showImageUpload: true,
        categoryName: ''
      };
    }

    // Search through all categories and their children to find the selected one
    for (const category of categories) {
      // Check if this category has the selected child category
      if (category.children && category.children.length > 0) {
        const childCategory = category.children.find(
          child => child._id === formData.childCategory
        );
        
        if (childCategory) {
          // 🔥 FIXED: Check parent category's showImageUpload first, then child's
          const parentShowImages = category.showImageUpload !== false;
          const childShowImages = childCategory.showImageUpload !== false;
          
          return {
            freeImages: childCategory.freeImages || 2,
            pricePerExtraImage: childCategory.pricePerExtraImage || 100,
            maxImages: childCategory.maxImages || 10,
            showImageUpload: parentShowImages && childShowImages, // Both must be true
            categoryName: childCategory.name
          };
        }
      }
      
      // Also check if the parent category itself is selected
      if (category._id === formData.childCategory) {
        return {
          freeImages: category.freeImages || 2,
          pricePerExtraImage: category.pricePerExtraImage || 100,
          maxImages: category.maxImages || 10,
          showImageUpload: category.showImageUpload !== false,
          categoryName: category.name
        };
      }
    }

    // Fallback to default values
    return {
      freeImages: 2,
      pricePerExtraImage: 100,
      maxImages: 10,
      showImageUpload: true,
      categoryName: ''
    };
  }, [formData.childCategory, categories]);

  // 🔥 NEW: Memoize the category pricing data
  const categoryPricing = useMemo(() => getCategoryPricing(), [getCategoryPricing]);

  // Handle image upload
  const handleImageChange = useCallback((newImages) => {
    dispatch(updateFormData({ images: newImages }));
  }, [dispatch]);

  // Add handler for extra images count
  const handleExtraImagesChange = useCallback((count) => {
    dispatch(setExtraImagesCount(count));
  }, [dispatch]);

  // ✅ Handler for special category specialQuestions
  const handleQuestionChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Update the specialspecialQuestions object in formData
    dispatch(updateFormData({
      specialQuestions: {
        ...formData.specialQuestions,
        [name]: value
      }
    }));
  }, [dispatch, formData.specialQuestions]);

  // ✅ Handle contact info updates (for regular text inputs like email and telegram)
  const handleContactChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch(updateContact({ [name]: value }));
  }, [dispatch]);

  // ✅ NEW: Handle phone input changes (for PhoneInput components)
  const handlePhoneInputChange = useCallback((field, value) => {
    dispatch(updateContact({ [field]: value || "" }));
  }, [dispatch]);


  // FIXED: Handle location field changes with proper reset logic
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Reset map for location fields
    const resetMap = {
      country: ['region', 'state', 'province', 'district', 'county', 'subDistrict', 'localAdministrativeUnit', 'municipality', 'town', 'village'],
      region: ['state', 'province', 'district', 'county', 'subDistrict', 'localAdministrativeUnit', 'municipality', 'town', 'village'],
      state: ['province', 'district', 'county', 'subDistrict', 'localAdministrativeUnit', 'municipality', 'town', 'village'],
      province: ['district', 'county', 'subDistrict', 'localAdministrativeUnit', 'municipality', 'town', 'village'],
      district: ['county', 'subDistrict', 'localAdministrativeUnit', 'municipality', 'town', 'village'],
      county: ['subDistrict', 'localAdministrativeUnit', 'municipality', 'town', 'village'],
      subDistrict: ['localAdministrativeUnit', 'municipality', 'town', 'village'],
      localAdministrativeUnit: ['municipality', 'town', 'village'],
      municipality: ['town', 'village'],
      town: ['village'],
      category: ['childCategory'], // Reset child category when parent changes
    };

    const updates = { [name]: value };
    
    // Add reset fields if this field has dependencies
    if (resetMap[name]) {
      resetMap[name].forEach(field => {
        updates[field] = "";
      });
    }
    
    if (name === 'price') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        dispatch(updateFormData(updates));
      }
    } else {
      dispatch(updateFormData(updates));
    }
  }, [dispatch]);

  // SIMPLIFIED location hierarchy management
  useEffect(() => {
    const updateLocationHierarchy = () => {
      const selectedCountry = countries.find((c) => c._id === formData.country);
      const regions = selectedCountry?.children || [];

      const selectedRegion = regions.find(r => r._id === formData.region);
      const states = selectedRegion?.children || [];

      const selectedState = states.find(s => s._id === formData.state);
      const provinces = selectedState?.children || [];

      const selectedProvince = provinces.find(p => p._id === formData.province);
      const districts = selectedProvince?.children || [];

      const selectedDistrict = districts.find(d => d._id === formData.district);
      const counties = selectedDistrict?.children || [];

      const selectedCounty = counties.find(c => c._id === formData.county);
      const subDistricts = selectedCounty?.children || [];

      const selectedSubDistrict = subDistricts.find(sd => sd._id === formData.subDistrict);
      const localAdministrativeUnits = selectedSubDistrict?.children || [];

      const selectedLAU = localAdministrativeUnits.find(lau => lau._id === formData.localAdministrativeUnit);
      const municipalities = selectedLAU?.children || [];

      const selectedMunicipality = municipalities.find(m => m._id === formData.municipality);
      const towns = selectedMunicipality?.children || [];

      const selectedTown = towns.find(t => t._id === formData.town);
      const villages = selectedTown?.children || [];

      // Only update if something actually changed
      const newLocationOptions = {
        regions,
        states,
        provinces,
        districts,
        counties,
        subDistricts,
        localAdministrativeUnits,
        municipalities,
        towns,
        villages,
      };

      if (JSON.stringify(newLocationOptions) !== JSON.stringify(locationOptions)) {
        setLocationOptions(newLocationOptions);
      }
    };

    updateLocationHierarchy();
  }, [
    formData.country,
    formData.region,
    formData.state,
    formData.province,
    formData.district,
    formData.county,
    formData.subDistrict,
    formData.localAdministrativeUnit,
    formData.municipality,
    formData.town,
    countries,
    locationOptions // Only depend on the entire locationOptions object
  ]);

  const handleNext = () => {

    if (!formData.title?.trim()) {
      alert("Please enter a title for your ad");
      return;
    }

    if (!formData.description?.trim()) {
      alert("Please enter a description for your ad");
      return;
    }

    if (!formData.typeofads) {
    alert("⚠️ Ad type is missing! Please go back and select an ad type.");
    console.error("❌ typeofads is missing from formData:", formData);
    return;
  }

    // ✅ Validate required specialQuestions
    const selectedSubCategory = categories
      .find(cat => cat._id === formData.category)
      ?.children?.find(sub => sub._id === formData.childCategory);

    if (selectedSubCategory?.specialQuestions) {
      const requiredspecialQuestions = selectedSubCategory.specialQuestions.filter(q => q.required);
      
      for (const question of requiredspecialQuestions) {
        if (!formData.specialQuestions?.[question.key]) {
          alert(`Please fill in the required field: ${question.label}`);
          return;
        }
      }
    }

    // 🔥 UPDATED: Check if image upload is enabled for this category
    if (categoryPricing.showImageUpload && formData.images?.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    console.log("Form data:", formData);
    console.log("Category pricing:", categoryPricing);
     console.log("✅ All validations passed, proceeding to next step");
  console.log("📋 Final formData being sent:", formData);
    onNext();
  };

  // Progress Steps
  const steps = [
    { number: 1, label: "Ad Details", active: true },
    { number: 2, label: "Payment", active: false },
    { number: 3, label: "Verification", active: false },
    { number: 4, label: "Published", active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <style>{`
        /* Custom styles for PhoneInput in ad posting form */
        .PhoneInput {
          width: 100%;
        }
        
        .PhoneInputInput {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          background-color: #ffffff;
          transition: all 0.2s ease;
          color: #111827;
        }

        @media (min-width: 640px) {
          .PhoneInputInput {
            font-size: 16px;
          }
        }
        
        .PhoneInputInput:hover {
          border-color: #d1d5db;
        }
        
        .PhoneInputInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .PhoneInputInput::placeholder {
          color: #9ca3af;
        }
        
        .PhoneInputCountry {
          padding-right: 12px;
          margin-right: 12px;
          border-right: 1px solid #e5e7eb;
        }
        
        .PhoneInputCountryIcon {
          width: 24px;
          height: 18px;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        
        .PhoneInputCountrySelect {
          font-size: 14px;
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 500;
        }

        @media (min-width: 640px) {
          .PhoneInputCountrySelect {
            font-size: 16px;
          }
        }
        
        .PhoneInputCountrySelect:focus {
          outline: none;
        }

        .PhoneInputCountrySelectArrow {
          color: #6b7280;
          margin-left: 4px;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg transition-all duration-300 ${
                    step.active 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-center ${
                    step.active ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 rounded transition-all duration-300 ${
                    step.active ? 'bg-primary' : 'bg-gray-200'
                  }`} style={{ marginTop: '-20px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mb-4 sm:mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-primary to-blue-700 p-4 sm:p-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-playfair tracking-tight">{getAdHeaderTitle()}</h2>
            <p className="text-blue-50 mt-2 sm:mt-3 text-sm sm:text-lg">{getAdSubTitle()}</p>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 space-y-6 sm:space-y-8 border border-gray-100">
          
          {/* Category & Language Section - UPDATED */}
          <div className="space-y-4 sm:space-y-6">
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-playfair">Classification</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Choose the appropriate category and language</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <CategorySelect
                  categories={categories}
                  categoryValue={formData.category}
                  childCategoryValue={formData.childCategory}
                  onChange={handleChange}
                  onQuestionChange={handleQuestionChange}
                  specialQuestionsValues={formData.specialQuestions || {}}
                />
                
                {/* 🔥 NEW: Display dynamic category pricing info */}
                {formData.childCategory && categoryPricing.categoryName && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          {categoryPricing.categoryName} Pricing
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {categoryPricing.freeImages} free images • 
                          ${categoryPricing.pricePerExtraImage} per extra • 
                          Max {categoryPricing.maxImages} images
                        </p>
                      </div>
                      {!categoryPricing.showImageUpload && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                          No Images
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <LanguageSelect
                  languages={languages}
                  value={formData.language}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t-2 border-gray-100">
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-playfair">Basic Information</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Enter the main details of your ad</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Ad Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter a catchy title for your ad"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Description <span className="text-primary">*</span>
              </label>
              <DescriptionEditor
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            {/* Price */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Price 
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-primary font-bold text-lg sm:text-xl">$</span>
                <input
                  type="text"
                  placeholder="0.00"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 pl-9 sm:pl-12 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section - UPDATED with backend data */}
          <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2 border-gray-100">
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-playfair">Images</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {categoryPricing.showImageUpload 
                  ? `Upload up to ${categoryPricing.maxImages} images • ${categoryPricing.freeImages} free images included`
                  : 'Image upload not available for this category'
                }
              </p>
            </div>
            
            {/* 🔥 UPDATED: Passing backend category data to ImageUpload */}
            <ImageUpload
              images={formData.images}
              onChange={handleImageChange}
              maxImages={categoryPricing.maxImages} // From backend
              freeImages={categoryPricing.freeImages} // From backend
              pricePerExtraImage={categoryPricing.pricePerExtraImage} // From backend
              adType={formData.adType}
              showImageUpload={categoryPricing.showImageUpload} // From backend
              onExtraImagesChange={handleExtraImagesChange}
            />
          </div>

          {/* Contact Information Section - UPDATED with PhoneInput */}
          <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2 border-gray-100">
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-playfair">Contact Information</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Provide at least one method for buyers to contact you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Phone with Country Code */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Phone Number
                </label>
                <PhoneInput
                  international
                  defaultCountry="LK"
                  value={formData.contact?.phone || ""}
                  onChange={(value) => handlePhoneInputChange('phone', value)}
                  placeholder="Enter phone number"
                />
              </div>

              {/* WhatsApp with Country Code */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  WhatsApp
                </label>
                <PhoneInput
                  international
                  defaultCountry="LK"
                  value={formData.contact?.whatsapp || ""}
                  onChange={(value) => handlePhoneInputChange('whatsapp', value)}
                  placeholder="Enter WhatsApp number"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.contact?.email || ""}
                  onChange={handleContactChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300"
                />
              </div>

              {/* Telegram */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  placeholder="@username"
                  value={formData.contact?.telegram || ""}
                  onChange={handleContactChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300"
                />
              </div>
            </div>
          </div>


          {/* Location Section */}
          <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2 border-gray-100">
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-playfair">Location</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Specify where your item is located</p>
            </div>
            <LocationSelect
              countries={countries}
              locationOptions={locationOptions}
              locationValues={{
                country: formData.country,
                region: formData.region,
                state: formData.state,
                province: formData.province,
                district: formData.district,
                county: formData.county,
                subDistrict: formData.subDistrict,
                localAdministrativeUnit: formData.localAdministrativeUnit,
                municipality: formData.municipality,
                town: formData.town,
                village: formData.village,
              }}
              onChange={handleChange}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 pt-6 sm:pt-8 border-t-2 border-gray-100">
            <button 
              onClick={onBack} 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-primary to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 text-sm sm:text-base"
            >
              Continue to Payment →
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm px-4">
          <p>Fields marked with <span className="text-primary font-bold">*</span> are required</p>
        </div>
      </div>
    </div>
  );
};

export default POSTANADS;