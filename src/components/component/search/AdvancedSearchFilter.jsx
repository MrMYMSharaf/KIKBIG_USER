// src/components/search/AdvancedSearchFilter.jsx
import React, { useState, useEffect } from "react";
import { X, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useCategoryQuery } from "../../../features/categorySlice";
import { useLanguageQuery } from "../../../features/languageSlice";
import { useLocationQuery } from "../../../features/locationSlice";

const AdvancedSearchFilter = ({ isOpen, onClose, onApplyFilters, initialFilters, countrySlug, searchType }) => {
  const [filters, setFilters] = useState({
    query: "",
    category: "",
    childCategory: "",
    language: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "relevance",
    ...initialFilters,
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: false,
    language: false,
    sort: false,
  });

  // ✅ Fetch data using your existing API slices
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoryQuery();
  const { data: languagesData, isLoading: languagesLoading } = useLanguageQuery();
  const { data: locationsData, isLoading: locationsLoading } = useLocationQuery();

  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      // Clear child category if category changes
      ...(field === "category" ? { childCategory: "" } : {}),
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApply = () => {
    // Remove empty values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "" && value !== null)
    );
    onApplyFilters(cleanedFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: "",
      category: "",
      childCategory: "",
      language: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "relevance",
    });
  };

  if (!isOpen) return null;

  // ✅ Filter categories based on searchType visibility
  const availableCategories = categoriesData?.data?.filter(cat => {
    if (!cat.visibility) return true; // If no visibility set, show for all
    return cat.visibility.includes(searchType);
  }) || [];

  // Find selected category
  const selectedCategory = availableCategories.find(
    (cat) => cat.slug === filters.category
  );

  // ✅ Filter subcategories based on visibility
  const availableSubcategories = selectedCategory?.children?.filter(child => {
    if (!child.visibility) return true;
    return child.visibility.includes(searchType);
  }) || [];

  const sortOptions = [
    { value: "relevance", label: "🎯 Most Relevant" },
    { value: "date_desc", label: "🕒 Newest First" },
    { value: "price_asc", label: "💰 Price: Low to High" },
    { value: "price_desc", label: "💰 Price: High to Low" },
    { value: "views", label: "👁️ Most Viewed" },
  ];

  const isLoading = categoriesLoading || languagesLoading || locationsLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Advanced Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading filters...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Query */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 Search Keywords
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleInputChange("query", e.target.value)}
                    placeholder="Enter keywords to search..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("category")}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">📂 Category</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedSections.category ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSections.category && (
                  <div className="p-4 space-y-4">
                    {/* Main Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                      >
                        <option value="">All Categories</option>
                        {availableCategories.map((cat) => (
                          <option key={cat._id} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {availableCategories.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          No categories available for {searchType}
                        </p>
                      )}
                    </div>

                    {/* Subcategory */}
                    {selectedCategory && availableSubcategories.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subcategory
                        </label>
                        <select
                          value={filters.childCategory}
                          onChange={(e) => handleInputChange("childCategory", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                          <option value="">All Subcategories</option>
                          {availableSubcategories.map((child) => (
                            <option key={child._id} value={child.slug}>
                              {child.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Range - Only show for Advertisements, Needs, Offers */}
              {searchType !== "Page" && (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection("price")}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">💰 Price Range</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedSections.price ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedSections.price && (
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Price
                          </label>
                          <input
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => handleInputChange("minPrice", e.target.value)}
                            placeholder="0"
                            min="0"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Price
                          </label>
                          <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                            placeholder="∞"
                            min="0"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Language Filter */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("language")}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">🌐 Language</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedSections.language ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSections.language && (
                  <div className="p-4">
                    <select
                      value={filters.language}
                      onChange={(e) => handleInputChange("language", e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      <option value="">All Languages</option>
                      {languagesData?.data?.filter(lang => lang.isActive).map((lang) => (
                        <option key={lang._id} value={lang.slug}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Sort By */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("sort")}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">⚡ Sort By</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedSections.sort ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSections.sort && (
                  <div className="p-4 space-y-2">
                    {sortOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-primary cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={filters.sortBy === option.value}
                          onChange={(e) => handleInputChange("sortBy", e.target.value)}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Debug Info (remove in production) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-gray-100 rounded text-xs">
                  <p className="font-semibold mb-1">Debug Info:</p>
                  <p>Categories: {availableCategories.length}</p>
                  <p>Languages: {languagesData?.data?.length || 0}</p>
                  <p>Search Type: {searchType}</p>
                  <p>Country: {countrySlug}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchFilter;