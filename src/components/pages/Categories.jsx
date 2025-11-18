import React, { useEffect, useState, useRef, useMemo } from "react";
import { useCategoryQuery } from "../../features/categorySlice";
import { useLocationQuery } from "../../features/locationSlice";
import { useNavigate } from "react-router-dom";
import DashboardSkeleton from "../component/SkeletonLoading/DashboardSkeleton";

const MODE_CONFIGS = {
  viewallads: { label: "Ads", gradient: "from-blue-600 to-blue-700" },
  offers: { label: "Offers", gradient: "from-green-600 to-green-700" },
  myneeds: { label: "Needs", gradient: "from-orange-600 to-orange-700" },
};

const Categories = () => {
  const { data: categories, isLoading, isError } = useCategoryQuery();
  const { 
    data: locations, 
    isLoading: locationLoading, 
    isError: locationError 
  } = useLocationQuery();
  
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState("viewallads");
  const [selectedCountry, setSelectedCountry] = useState("");

  const categoryRefs = useRef({});

  useEffect(() => {
    if (isError) {
      navigate("*");
    }
  }, [isError, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = Object.values(categoryRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
      if (!isClickInside) {
        setClickedCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set Sri Lanka as default country when locations load
  useEffect(() => {
    if (locations?.data?.length && !selectedCountry) {
      const sriLanka = locations.data.find(
        (country) => country.name.toLowerCase() === "sri lanka"
      );
      if (sriLanka) {
        setSelectedCountry(sriLanka._id);
      }
    }
  }, [locations?.data, selectedCountry]);

  // Get counties for selected country
  const counties = useMemo(() => {
    if (!selectedCountry || !locations?.data) return [];
    const country = locations.data.find(c => c._id === selectedCountry);
    return country?.children || [];
  }, [selectedCountry, locations]);

  // Get selected location slug
  const getLocationSlug = useMemo(() => {
    if (!locations?.data || !selectedCountry) return null;
    const country = locations.data.find(c => c._id === selectedCountry);
    return country?.slug || null;
  }, [selectedCountry, locations]);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <div>Failed to load categories.</div>;

  // Calculate dropdown position
  const getDropdownPosition = (categoryId) => {
    const element = categoryRefs.current[categoryId];
    if (!element) return "center";

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 256;

    const centerPosition = rect.left + rect.width / 2;
    const dropdownLeft = centerPosition - dropdownWidth / 2;
    const dropdownRight = centerPosition + dropdownWidth / 2;

    const padding = 20;

    if (dropdownLeft < padding) return "left";
    else if (dropdownRight > viewportWidth - padding) return "right";
    return "center";
  };

  const handleCategoryClick = (category) => {
    // Check if category has subcategories
    if (category?.children && category.children.length > 0) {
      // If clicking on already opened category (2nd click), navigate to category page
      if (clickedCategory === category._id) {
        // Navigate using slugs
        if (getLocationSlug) {
          navigate(`/${selectedMode}/${getLocationSlug}/${category.slug}`);
        } else {
          navigate(`/${selectedMode}/${category.slug}`);
        }
        setClickedCategory(null);
      } else {
        // First click - show subcategories
        setClickedCategory(category._id);
        setHoveredCategory(null);
      }
    } else {
      // No subcategories - navigate directly using slugs
      if (getLocationSlug) {
        navigate(`/${selectedMode}/${getLocationSlug}/${category.slug}`);
      } else {
        navigate(`/${selectedMode}/${category.slug}`);
      }
    }
  };

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    // Navigate with slugs (location, category, subcategory)
    if (getLocationSlug) {
      navigate(`/${selectedMode}/${getLocationSlug}/${categorySlug}/${subcategorySlug}`);
    } else {
      navigate(`/${selectedMode}/${categorySlug}/${subcategorySlug}`);
    }
  };

  const handleCountryChange = (countryId) => {
    setSelectedCountry(countryId);
  };

  const handleMouseEnter = (categoryId) => {
    if (!clickedCategory) {
      setHoveredCategory(categoryId);
    }
  };

  const handleMouseLeave = () => {
    if (!clickedCategory) {
      setHoveredCategory(null);
    }
  };

  const isDropdownOpen = (categoryId) =>
    hoveredCategory === categoryId || clickedCategory === categoryId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto mt-1">
        {/* Combined Mode Selection & Location Filters */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
          {/* Mode Selection Buttons */}
          {Object.entries(MODE_CONFIGS).map(([mode, config]) => (
            <button
              key={mode}
              className={`group relative px-8 py-3 font-semibold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden ${
                selectedMode === mode
                  ? `bg-gradient-to-r ${config.gradient} text-white`
                  : "bg-white text-gray-700 border-2 border-gray-300"
              }`}
              onClick={() => setSelectedMode(mode)}
              aria-pressed={selectedMode === mode}
              aria-label={`Select ${config.label} mode`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {config.label}
                {selectedMode === mode && (
                  <span className="ml-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
                )}
              </span>
            </button>
          ))}

          {/* Divider */}
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2 hidden sm:block"></div>

          {/* Country Dropdown */}
          <div className="relative group">
            <select
              className={`px-6 py-3 border-2 rounded-full shadow-lg font-semibold transition-all duration-300 appearance-none pr-10 cursor-pointer ${
                selectedCountry 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-black border-purple-600 hover:shadow-2xl transform hover:scale-105' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-500 hover:shadow-xl'
              }`}
              onChange={(e) => handleCountryChange(e.target.value)}
              disabled={locationLoading}
              value={selectedCountry}
              aria-label="Select country"
            >
              <option value="">🌍 Country</option>
              {locations?.data?.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </select>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${selectedCountry ? 'text-white' : 'text-gray-500'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Clear Location Button */}
          {selectedCountry && (
            <button
              onClick={() => {
                setSelectedCountry("");
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 animate-fadeIn"
              aria-label="Clear location selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Location Error Message */}
        {locationError && (
          <div className="text-center mb-6">
            <p className="text-sm text-red-600 bg-red-50 inline-block px-4 py-2 rounded-full">
              ⚠️ Failed to load locations
            </p>
          </div>
        )}

        {/* Selected Mode & Location Indicator */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Selected:{" "}
            <span className="font-semibold text-primary capitalize">
              {MODE_CONFIGS[selectedMode].label}
            </span>
            {selectedCountry && (
              <>
                <span className="text-gray-400 mx-2">•</span>
                <span className="font-semibold text-primary">
                  {locations?.data?.find(c => c._id === selectedCountry)?.name}
                </span>
              </>
            )}
            <span className="text-gray-400 ml-2">
              • Click a category to continue {clickedCategory && "(Click again to view all)"}
            </span>
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-32">
          {categories?.data && categories.data.length > 0 ? (
            categories.data.map((category) => {
              const position = getDropdownPosition(category._id);

              return (
                <div
                  key={category.id || category._id}
                  ref={(el) => (categoryRefs.current[category._id] = el)}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(category._id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => handleCategoryClick(category)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${category.name} category`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCategoryClick(category);
                      }
                    }}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center bg-gray-100 rounded-full p-6 w-24 h-24 mb-3 transition-all duration-300 group-hover:bg-primary group-hover:shadow-xl group-hover:scale-110">
                        <div
                          className="category-icon transition-all duration-300"
                          dangerouslySetInnerHTML={{ __html: category.icon }}
                        />
                      </div>

                      <div className="absolute inset-0 rounded-full border-4 border-primary opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none"></div>
                    </div>

                    <h3 className="text-center font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300 mb-1 px-2">
                      {category.name}
                    </h3>

                    <span className="text-xs text-gray-500 group-hover:text-primary transition-colors duration-300">
                      {category.children?.length || 0} options
                    </span>
                  </div>

                  {category.children &&
                    category.children.length > 0 &&
                    isDropdownOpen(category._id) && (
                      <div
                        className={`absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-primary z-50 overflow-hidden animate-fadeIn w-64 ${
                          position === "right"
                            ? "right-0"
                            : position === "left"
                            ? "left-0"
                            : "left-1/2 -translate-x-1/2"
                        }`}
                        role="menu"
                        aria-label={`${category.name} subcategories`}
                      >
                        <div className="p-3 bg-gradient-to-r from-primary to-blue-700">
                          <h4 className="text-white font-semibold text-sm text-center">
                            Choose from {category.name}
                          </h4>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {category.children.map((child, index) => (
                            <div
                              key={child._id || index}
                              className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 group/item"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (getLocationSlug) {
                                  navigate(`/${selectedMode}/${getLocationSlug}/${category.slug}/${child.slug}`);
                                } else {
                                  navigate(`/${selectedMode}/${category.slug}/${child.slug}`);
                                }
                              }}
                              role="menuitem"
                              tabIndex={0}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  if (getLocationSlug) {
                                    navigate(`/${selectedMode}/${getLocationSlug}/${category.slug}/${child.slug}`);
                                  } else {
                                    navigate(`/${selectedMode}/${category.slug}/${child.slug}`);
                                  }
                                }
                              }}
                            >
                              <div className="flex items-center justify-center bg-gray-100 rounded-full p-2 w-12 h-12 flex-shrink-0 group-hover/item:bg-primary transition-colors duration-200">
                                <div
                                  className="child-icon"
                                  dangerouslySetInnerHTML={{ __html: child.icon }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm group-hover/item:text-primary transition-colors duration-200">
                                  {child.name}
                                </p>
                                {child.description && (
                                  <p className="text-xs text-gray-500 line-clamp-1">
                                    {child.description}
                                  </p>
                                )}
                              </div>

                              <svg
                                className="w-5 h-5 text-gray-400 group-hover/item:text-primary flex-shrink-0 transform group-hover/item:translate-x-1 transition-all duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 py-20">
              <p className="text-xl">No categories found</p>
            </div>
          )}
        </div>
      </div>

      {/* Animation + Styling */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .category-icon svg {
          width: 48px;
          height: 48px;
          stroke: #374151;
          transition: all 0.3s ease;
        }
        .group:hover .category-icon svg {
          stroke: white;
          transform: rotate(5deg);
        }
        .child-icon svg {
          width: 28px;
          height: 28px;
          stroke: #374151;
          transition: all 0.2s ease;
        }
        .group\\/item:hover .child-icon svg {
          stroke: white;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #00008F;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #000070;
        }
      `}</style>
    </div>
  );
};

export default Categories;