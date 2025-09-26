import React, { useState, useEffect } from "react";
import { useLanguageQuery } from "../../features/languageSlice";
import { useCategoryQuery } from "../../features/categorySlice";
import { useLocationQuery } from "../../features/locationSlice";

import LanguageSelect from "./LanguageSelect";
import LocationSelect from "./LocationSelect";

const POSTANADS = ({ onBack, onNext }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    images: [],
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
  });

  const [imagePreviews, setImagePreviews] = useState([]);
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

  // Fetch data from APIs
  const { data: languagesData } = useLanguageQuery();
  const { data: categoriesData } = useCategoryQuery();
  const { data: locationsData } = useLocationQuery();

  const languages = languagesData?.data || [];
  const categories = categoriesData?.data || [];
  const countries = locationsData?.data || [];

  // Categories
  const childCategories =
    categories.find((cat) => cat._id === formData.category)?.children || [];

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + formData.images.length > 5) {
      alert("You can upload maximum 5 images");
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    setImagePreviews(prev => [...prev, ...newImages]);
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.preview));
    };
  }, []);

  // Location hierarchy management
  useEffect(() => {
    if (!formData.country) {
      setLocationOptions({
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
      return;
    }

    const selectedCountry = countries.find((c) => c._id === formData.country);
    const regions = selectedCountry?.children || [];
    
    setLocationOptions(prev => ({
      ...prev,
      regions,
      states: [],
      provinces: [],
      districts: [],
      counties: [],
      subDistricts: [],
      localAdministrativeUnits: [],
      municipalities: [],
      towns: [],
      villages: [],
    }));

    // Reset downstream fields when country changes
    setFormData(prev => ({
      ...prev,
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
    }));
  }, [formData.country, countries]);

  useEffect(() => {
    if (!formData.region) {
      setLocationOptions(prev => ({ ...prev, states: [] }));
      return;
    }

    const selectedRegion = locationOptions.regions.find(r => r._id === formData.region);
    const states = selectedRegion?.children || [];
    setLocationOptions(prev => ({ ...prev, states }));
    
    // Reset downstream fields
    setFormData(prev => ({
      ...prev,
      state: "",
      province: "",
      district: "",
      county: "",
      subDistrict: "",
      localAdministrativeUnit: "",
      municipality: "",
      town: "",
      village: "",
    }));
  }, [formData.region, locationOptions.regions]);

  useEffect(() => {
    if (!formData.state) {
      setLocationOptions(prev => ({ ...prev, provinces: [] }));
      return;
    }

    const selectedState = locationOptions.states.find(s => s._id === formData.state);
    const provinces = selectedState?.children || [];
    setLocationOptions(prev => ({ ...prev, provinces }));
    
    setFormData(prev => ({
      ...prev,
      province: "",
      district: "",
      county: "",
      subDistrict: "",
      localAdministrativeUnit: "",
      municipality: "",
      town: "",
      village: "",
    }));
  }, [formData.state, locationOptions.states]);

  useEffect(() => {
    if (!formData.province) {
      setLocationOptions(prev => ({ ...prev, districts: [] }));
      return;
    }

    const selectedProvince = locationOptions.provinces.find(p => p._id === formData.province);
    const districts = selectedProvince?.children || [];
    setLocationOptions(prev => ({ ...prev, districts }));
    
    setFormData(prev => ({
      ...prev,
      district: "",
      county: "",
      subDistrict: "",
      localAdministrativeUnit: "",
      municipality: "",
      town: "",
      village: "",
    }));
  }, [formData.province, locationOptions.provinces]);

  useEffect(() => {
    if (!formData.district) {
      setLocationOptions(prev => ({ ...prev, counties: [] }));
      return;
    }

    const selectedDistrict = locationOptions.districts.find(d => d._id === formData.district);
    const counties = selectedDistrict?.children || [];
    setLocationOptions(prev => ({ ...prev, counties }));
    
    setFormData(prev => ({
      ...prev,
      county: "",
      subDistrict: "",
      localAdministrativeUnit: "",
      municipality: "",
      town: "",
      village: "",
    }));
  }, [formData.district, locationOptions.districts]);

  // Continue this pattern for all levels...
  useEffect(() => {
    if (!formData.county) {
      setLocationOptions(prev => ({ ...prev, subDistricts: [] }));
      return;
    }

    const selectedCounty = locationOptions.counties.find(c => c._id === formData.county);
    const subDistricts = selectedCounty?.children || [];
    setLocationOptions(prev => ({ ...prev, subDistricts }));
    
    setFormData(prev => ({
      ...prev,
      subDistrict: "",
      localAdministrativeUnit: "",
      municipality: "",
      town: "",
      village: "",
    }));
  }, [formData.county, locationOptions.counties]);

  useEffect(() => {
    if (!formData.subDistrict) {
      setLocationOptions(prev => ({ ...prev, localAdministrativeUnits: [] }));
      return;
    }

    const selectedSubDistrict = locationOptions.subDistricts.find(sd => sd._id === formData.subDistrict);
    const localAdministrativeUnits = selectedSubDistrict?.children || [];
    setLocationOptions(prev => ({ ...prev, localAdministrativeUnits }));
    
    setFormData(prev => ({
      ...prev,
      localAdministrativeUnit: "",
      municipality: "",
      town: "",
      village: "",
    }));
  }, [formData.subDistrict, locationOptions.subDistricts]);

  useEffect(() => {
    if (!formData.localAdministrativeUnit) {
      setLocationOptions(prev => ({ ...prev, municipalities: [] }));
      return;
    }

    const selectedLAU = locationOptions.localAdministrativeUnits.find(lau => lau._id === formData.localAdministrativeUnit);
    const municipalities = selectedLAU?.children || [];
    setLocationOptions(prev => ({ ...prev, municipalities }));
    
    setFormData(prev => ({
      ...prev,
      municipality: "",
      town: "",
      village: "",
    }));
  }, [formData.localAdministrativeUnit, locationOptions.localAdministrativeUnits]);

  useEffect(() => {
    if (!formData.municipality) {
      setLocationOptions(prev => ({ ...prev, towns: [] }));
      return;
    }

    const selectedMunicipality = locationOptions.municipalities.find(m => m._id === formData.municipality);
    const towns = selectedMunicipality?.children || [];
    setLocationOptions(prev => ({ ...prev, towns }));
    
    setFormData(prev => ({
      ...prev,
      town: "",
      village: "",
    }));
  }, [formData.municipality, locationOptions.municipalities]);

  useEffect(() => {
    if (!formData.town) {
      setLocationOptions(prev => ({ ...prev, villages: [] }));
      return;
    }

    const selectedTown = locationOptions.towns.find(t => t._id === formData.town);
    const villages = selectedTown?.children || [];
    setLocationOptions(prev => ({ ...prev, villages }));
    
    setFormData(prev => ({
      ...prev,
      village: "",
    }));
  }, [formData.town, locationOptions.towns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle price validation - only allow numbers and decimal point
    if (name === 'price') {
      // Allow only numbers and one decimal point
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    // Basic validation
    if (!formData.title.trim()) {
      alert("Please enter a title for your ad");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter a description for your ad");
      return;
    }

    if (!formData.price) {
      alert("Please enter a price for your ad");
      return;
    }

    if (formData.images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    console.log("Form data:", formData);
    onNext(); // move to next step
  };

  const getLocationName = (location, level) => {
    if (!location) return "Unnamed";
    
    // Try different property names based on level
    const name = location[level] || 
                 location.name || 
                 location.region_name || 
                 location.states || 
                 location.provinces || 
                 location.districts || 
                 location.counties || 
                 location.sub_districts || 
                 location.local_administrative_units || 
                 location.municipalities || 
                 location.towns || 
                 location.villages;
    
    return name || "Unnamed Location";
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Post an Ad</h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Ad Title *</label>
        <input
          type="text"
          placeholder="Enter ad title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          placeholder="Enter ad description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          rows={3}
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1">Price *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            type="text"
            placeholder="0.00"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="border p-2 rounded w-full pl-8"
            required
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Images * ({formData.images.length}/5)
        </label>
        
        {/* Image Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600">
                Click to upload images or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, JPEG up to 5MB (max 5 images)
              </p>
            </div>
          </label>
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Language Component */}
      <LanguageSelect
        languages={languages}
        value={formData.language}
        onChange={handleChange}
      />

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Child/Subcategory Dropdown */}
      {childCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Subcategory</label>
          <select
            name="childCategory"
            value={formData.childCategory}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Subcategory</option>
            {childCategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Location Hierarchy */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">Location</h3>
        
        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        {locationOptions.regions.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Region</option>
              {locationOptions.regions.map((region) => (
                <option key={region._id} value={region._id}>
                  {getLocationName(region, 'region_name')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* State */}
        {locationOptions.states.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select State</option>
              {locationOptions.states.map((state) => (
                <option key={state._id} value={state._id}>
                  {getLocationName(state, 'states')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Province */}
        {locationOptions.provinces.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Province</label>
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Province</option>
              {locationOptions.provinces.map((province) => (
                <option key={province._id} value={province._id}>
                  {getLocationName(province, 'provinces')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* District */}
        {locationOptions.districts.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select District</option>
              {locationOptions.districts.map((district) => (
                <option key={district._id} value={district._id}>
                  {getLocationName(district, 'districts')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Continue with other levels (County, Sub District, etc.) */}
        {locationOptions.counties.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">County</label>
            <select
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select County</option>
              {locationOptions.counties.map((county) => (
                <option key={county._id} value={county._id}>
                  {getLocationName(county, 'counties')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Town */}
        {locationOptions.towns.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Town</label>
            <select
              name="town"
              value={formData.town}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Town</option>
              {locationOptions.towns.map((town) => (
                <option key={town._id} value={town._id}>
                  {getLocationName(town, 'towns')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Village */}
        {locationOptions.villages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <select
              name="village"
              value={formData.village}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Village</option>
              {locationOptions.villages.map((village) => (
                <option key={village._id} value={village._id}>
                  {getLocationName(village, 'villages')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default POSTANADS;