import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, AlertCircle, Check } from "lucide-react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Import your actual RTK Query hooks and components
import {
  useGetAdvertisementByIdQuery,
  useUpdateAdvertisementMutation,
} from "../../features/postadsSlice";
import { useLanguageQuery } from "../../features/languageSlice";
import { useCategoryQuery } from "../../features/categorySlice";
import { useLocationQuery } from "../../features/locationSlice";

// Import your reusable components
import CategorySelect from "../PostAdsModalFlow/_CategorySelect";
import LanguageSelect from "../PostAdsModalFlow/_LanguageSelect";
import LocationSelect from "../PostAdsModalFlow/_LocationSelect";
import ImageUpload from "../component/ImageUpload";
import DescriptionEditor from "../component/DescriptionEditor";

const EditAdPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: adData, isLoading, error: fetchError } = useGetAdvertisementByIdQuery(id);
  const [updateAdvertisement, { isLoading: isSaving }] = useUpdateAdvertisementMutation();
  
  const { data: languagesData } = useLanguageQuery();
  const { data: categoriesData } = useCategoryQuery();
  const { data: locationsData } = useLocationQuery();

  const languages = languagesData?.data || [];
  const categories = (categoriesData?.data || []).filter(cat => cat.showAddPost);
  const countries = locationsData?.data || [];

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    typeofads: "Advertisement",
    images: [],
    contact: {
      phone: "",
      whatsapp: "",
      email: "",
      telegram: "",
    },
    language: "",
    category: "",
    childCategory: "",
    country: "",
    region: "",
    state: "",
    province: "",
    district: "",
    county: "",
    subDistrict: "",
    localAdministrativeUnit: "",
    municipality: "",
    town: "",
    village: "",
    specialQuestions: {},
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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

  // Populate form when data is fetched
  useEffect(() => {
    if (adData) {
      const ad = adData.data || adData;
      
      setFormData({
        title: ad.title || "",
        description: ad.description || "",
        price: ad.price || "",
        typeofads: ad.typeofads || "Advertisement",
        images: ad.images || [],
        contact: ad.contact || {
          phone: "",
          whatsapp: "",
          email: "",
          telegram: "",
        },
        language: ad.language?._id || ad.language || "",
        category: ad.category?._id || ad.category || "",
        childCategory: ad.childCategory?._id || ad.childCategory || "",
        country: ad.country?._id || ad.country || "",
        region: ad.region?._id || ad.region || "",
        state: ad.state?._id || ad.state || "",
        province: ad.province?._id || ad.province || "",
        district: ad.district?._id || ad.district || "",
        county: ad.county?._id || ad.county || "",
        subDistrict: ad.subDistrict?._id || ad.subDistrict || "",
        localAdministrativeUnit: ad.localAdministrativeUnit?._id || ad.localAdministrativeUnit || "",
        municipality: ad.municipality?._id || ad.municipality || "",
        town: ad.town?._id || ad.town || "",
        village: ad.village?._id || ad.village || "",
        specialQuestions: ad.specialQuestions || {},
      });
    }
  }, [adData]);

  // Update location hierarchy
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

      setLocationOptions({
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
      });
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
  ]);

  // Get category pricing info
  const categoryPricing = useMemo(() => {
    if (!formData.childCategory) return { maxImages: 10, showImageUpload: true };
    
    for (const category of categories) {
      if (category.children && category.children.length > 0) {
        const childCategory = category.children.find(
          child => child._id === formData.childCategory
        );
        
        if (childCategory) {
          const parentShowImages = category.showImageUpload !== false;
          const childShowImages = childCategory.showImageUpload !== false;
          
          return {
            maxImages: childCategory.maxImages || 10,
            showImageUpload: parentShowImages && childShowImages,
          };
        }
      }
    }
    return { maxImages: 10, showImageUpload: true };
  }, [formData.childCategory, categories]);

  // Handle fetch error
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.data?.message || "Failed to fetch advertisement");
    }
  }, [fetchError]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
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
      category: ['childCategory', 'specialQuestions'],
    };

    const updates = { [name]: value };
    
    if (resetMap[name]) {
      resetMap[name].forEach(field => {
        if (field === 'specialQuestions') {
          updates[field] = {};
        } else {
          updates[field] = "";
        }
      });
    }
    
    if (name === 'price') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, ...updates }));
      }
    } else {
      setFormData((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const handleContactChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [name]: value,
      },
    }));
  }, []);

  const handlePhoneInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value || "",
      },
    }));
  }, []);

  const handleQuestionChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      specialQuestions: {
        ...prev.specialQuestions,
        [name]: value
      }
    }));
  }, []);

  const handleImageChange = useCallback((newImages) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title?.trim()) {
      setError("Please enter a title for your ad");
      return;
    }

    if (!formData.description?.trim()) {
      setError("Please enter a description for your ad");
      return;
    }

    // Validate special questions
    const selectedSubCategory = categories
      .find(cat => cat._id === formData.category)
      ?.children?.find(sub => sub._id === formData.childCategory);

    if (selectedSubCategory?.specialQuestions) {
      const requiredQuestions = selectedSubCategory.specialQuestions.filter(q => q.required);
      
      for (const question of requiredQuestions) {
        if (!formData.specialQuestions?.[question.key]) {
          setError(`Please fill in the required field: ${question.label}`);
          return;
        }
      }
    }

    try {
      await updateAdvertisement({ id, formData }).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigate("/myads");
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.data?.message || "Failed to update advertisement");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading advertisement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <style>{`
        /* Custom styles for PhoneInput */
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
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/myads")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Edit Advertisement
                </h1>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">Update your listing details</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">
                ID: {id?.slice(-8)}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-800 font-medium">
              Advertisement updated successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Location Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="border-l-4 border-blue-600 pl-3 sm:pl-4 py-1 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Location</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Select your location</p>
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

          {/* Category & Language Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="border-l-4 border-blue-600 pl-3 sm:pl-4 py-1 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Classification</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Choose category and language</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <CategorySelect
                categories={categories}
                categoryValue={formData.category}
                childCategoryValue={formData.childCategory}
                onChange={handleChange}
                onQuestionChange={handleQuestionChange}
                specialQuestionsValues={formData.specialQuestions || {}}
              />

              <LanguageSelect
                languages={languages}
                value={formData.language}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="border-l-4 border-blue-600 pl-3 sm:pl-4 py-1 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Basic Information</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Enter the main details</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Ad Title <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900"
                  placeholder="Enter a catchy title..."
                />
              </div>

              {/* Type of Ad */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Type of Ad <span className="text-blue-600">*</span>
                </label>
                <select
                  name="typeofads"
                  value={formData.typeofads}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900"
                >
                  <option value="Advertisement">Advertisement</option>
                  <option value="Needs">Needs</option>
                  <option value="Offers">Offers</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold text-lg sm:text-xl">
                    Rs.
                  </span>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 pl-12 sm:pl-16 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900 font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Description <span className="text-blue-600">*</span>
                </label>
                <DescriptionEditor
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="border-l-4 border-blue-600 pl-3 sm:pl-4 py-1 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Images</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {categoryPricing.showImageUpload 
                  ? `Upload up to ${categoryPricing.maxImages} images`
                  : 'Image upload not available for this category'
                }
              </p>
            </div>

            <ImageUpload
              images={formData.images}
              onChange={handleImageChange}
              maxImages={categoryPricing.maxImages}
              adType={formData.typeofads}
              showImageUpload={categoryPricing.showImageUpload}
            />
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="border-l-4 border-blue-600 pl-3 sm:pl-4 py-1 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Information</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Provide contact methods</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Phone */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
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

              {/* WhatsApp */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
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
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.contact?.email || ""}
                  onChange={handleContactChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900"
                  placeholder="your@email.com"
                />
              </div>

              {/* Telegram */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.contact?.telegram || ""}
                  onChange={handleContactChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate("/myads")}
                className="flex-1 px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base shadow-lg hover:shadow-xl"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdPage;