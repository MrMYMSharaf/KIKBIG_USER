import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useCategoryQuery } from "../../features/categorySlice";
import { useLocationQuery } from "../../features/locationSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCountry } from "../../features/redux/countrySlice";
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
    isError: locationError,
  } = useLocationQuery();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { countrySlug, mode, categorySlug, subcategorySlug } = useParams();

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState(mode || "viewallads");
  const [selectedCountry, setSelectedCountry] = useState("");

  const categoryRefs = useRef({});

  // --- Initialize selectedCountry from URL slug or default to Sri Lanka ---
  useEffect(() => {
    if (!locations?.data?.length) return;

    // If route has a countrySlug, use it
    if (countrySlug) {
      const country = locations.data.find((c) => c.slug === countrySlug);
      if (country) {
        setSelectedCountry(country._id);
        // make sure redux is in sync
        dispatch(setCountry(country.slug));
        return;
      }
    }

    // If no countrySlug or slug not found, set default (Sri Lanka) only if not already set
    if (!selectedCountry) {
      const sriLanka = locations.data.find(
        (c) => c.name?.toLowerCase() === "sri lanka" || c.name?.toLowerCase() === "sri-lanka"
      );
      if (sriLanka) {
        setSelectedCountry(sriLanka._id);
        // don't force navigate; only sync redux so other parts rely on it
        dispatch(setCountry(sriLanka.slug));
      }
    }
    // intentional: exclude selectedCountry from deps to avoid infinite loop; locations & countrySlug control initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations?.data, countrySlug, dispatch]);

  // Update mode if URL changes
  useEffect(() => {
    if (mode) setSelectedMode(mode);
  }, [mode]);

  // Navigate to not-found if categories failed
  useEffect(() => {
    if (isError) navigate("*");
  }, [isError, navigate]);

  // Close dropdown when clicking outside of category elements
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = Object.values(categoryRefs.current).some(
        (ref) => ref && ref.contains && ref.contains(event.target)
      );
      if (!isClickInside) setClickedCategory(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Memoized selected country slug based on selectedCountry id
  const getLocationSlug = useMemo(() => {
    if (!locations?.data || !selectedCountry) return null;
    const country = locations.data.find((c) => c._id === selectedCountry);
    return country?.slug || null;
  }, [selectedCountry, locations]);

  // Memoized selected country name for display
  const selectedCountryName = useMemo(() => {
    if (!locations?.data || !selectedCountry) return "";
    const country = locations.data.find((c) => c._id === selectedCountry);
    return country?.name || "";
  }, [selectedCountry, locations]);

  // Helper to compute dropdown position (left/center/right)
  const getDropdownPosition = useCallback((categoryId) => {
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
    if (dropdownRight > viewportWidth - padding) return "right";
    return "center";
  }, []);

  // Category click handler (open subcategories or navigate)
  const handleCategoryClick = useCallback(
    (category) => {
      if (category?.children && category.children.length > 0) {
        if (clickedCategory === category._id) {
          // second click: navigate to category page
          if (getLocationSlug) {
            navigate(`/${getLocationSlug}/${selectedMode}/${category.slug}`);
          } else {
            navigate(`/${selectedMode}/${category.slug}`);
          }
          setClickedCategory(null);
        } else {
          // open dropdown
          setClickedCategory(category._id);
          setHoveredCategory(null);
        }
      } else {
        // no children -> navigate directly
        if (getLocationSlug) {
          navigate(`/${getLocationSlug}/${selectedMode}/${category.slug}`);
        } else {
          navigate(`/${selectedMode}/${category.slug}`);
        }
      }
    },
    [clickedCategory, getLocationSlug, navigate, selectedMode]
  );

  // Immediately update country when select changes: update Redux and navigate to new path
  const handleCountryChange = useCallback(
    (countryId) => {
      if (!countryId) {
        // If user clears selection, do nothing
        setSelectedCountry("");
        dispatch(setCountry("")); // optional: clear redux value
        return;
      }

      const newCountry = locations?.data?.find((c) => c._id === countryId);
      if (!newCountry) {
        // fallback: just set id
        setSelectedCountry(countryId);
        return;
      }

      // Update selected country id
      setSelectedCountry(countryId);

      // Update redux immediately
      dispatch(setCountry(newCountry.slug));

    },
    [locations, dispatch, selectedMode, navigate, categorySlug, subcategorySlug]
  );

  const handleMouseEnter = (categoryId) => {
    if (!clickedCategory) setHoveredCategory(categoryId);
  };

  const handleMouseLeave = () => {
    if (!clickedCategory) setHoveredCategory(null);
  };

  const isDropdownOpen = (categoryId) =>
    hoveredCategory === categoryId || clickedCategory === categoryId;

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <div>Failed to load categories.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto mt-1">
        {/* Mode selection + Country selector */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
          {Object.entries(MODE_CONFIGS).map(([modeKey, config]) => (
            <button
              key={modeKey}
              className={`group relative px-8 py-3 font-semibold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden ${
                selectedMode === modeKey
                  ? `bg-gradient-to-r ${config.gradient} text-white`
                  : "bg-white text-gray-700 border-2 border-gray-300"
              }`}
              onClick={() => setSelectedMode(modeKey)}
              aria-pressed={selectedMode === modeKey}
              aria-label={`Select ${config.label} mode`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {config.label}
                {selectedMode === modeKey && (
                  <span className="ml-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </span>
            </button>
          ))}

          <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2 hidden sm:block" />

          {/* Country Dropdown: value is selectedCountry and updates immediately */}
          <div className="relative group flex items-center gap-2">
            <select
              className={`px-6 py-3 border-2 rounded-full shadow-lg font-semibold transition-all duration-300 appearance-none pr-10 cursor-pointer ${
                selectedCountry
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600 hover:shadow-2xl transform hover:scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-purple-500 hover:shadow-xl"
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

            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                selectedCountry ? "text-white" : "text-gray-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Location error */}
        {locationError && (
          <div className="text-center mb-6">
            <p className="text-sm text-red-600 bg-red-50 inline-block px-4 py-2 rounded-full">
              ⚠️ Failed to load locations
            </p>
          </div>
        )}

        {/* Selected Mode & Location */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Selected:{" "}
            <span className="font-semibold text-primary capitalize">
              {MODE_CONFIGS[selectedMode].label}
            </span>
            {selectedCountryName && (
              <>
                <span className="text-gray-400 mx-2">•</span>
                <span className="font-semibold text-primary">{selectedCountryName}</span>
              </>
            )}
            <span className="text-gray-400 ml-2">• Click a category to continue {clickedCategory && "(Click again to view all)"}</span>
          </p>
        </div>

        {/* Category cards */}
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
                      if (e.key === "Enter" || e.key === " ") handleCategoryClick(category);
                    }}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center bg-gray-100 rounded-full p-6 w-24 h-24 mb-3 transition-all duration-300 group-hover:bg-primary group-hover:shadow-xl group-hover:scale-110">
                        <div className="category-icon transition-all duration-300" dangerouslySetInnerHTML={{ __html: category.icon }} />
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-primary opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
                    </div>

                    <h3 className="text-center font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300 mb-1 px-2">
                      {category.name}
                    </h3>

                    <span className="text-xs text-gray-500 group-hover:text-primary transition-colors duration-300">
                      {category.children?.length || 0} options
                    </span>
                  </div>

                  {category.children && category.children.length > 0 && isDropdownOpen(category._id) && (
                    <div
                      className={`absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-primary z-50 overflow-hidden animate-fadeIn w-64 ${
                        position === "right" ? "right-0" : position === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
                      }`}
                      role="menu"
                      aria-label={`${category.name} subcategories`}
                    >
                      <div className="p-3 bg-gradient-to-r from-primary to-blue-700">
                        <h4 className="text-white font-semibold text-sm text-center">Choose from {category.name}</h4>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {category.children.map((child, index) => (
                          <div
                            key={child._id || index}
                            className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 group/item"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (getLocationSlug) {
                                navigate(`/${getLocationSlug}/${selectedMode}/${category.slug}/${child.slug}`);
                              } else {
                                navigate(`/${selectedMode}/${category.slug}/${child.slug}`);
                              }
                            }}
                            role="menuitem"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                if (getLocationSlug) {
                                  navigate(`/${getLocationSlug}/${selectedMode}/${category.slug}/${child.slug}`);
                                } else {
                                  navigate(`/${selectedMode}/${category.slug}/${child.slug}`);
                                }
                              }
                            }}
                          >
                            <div className="flex items-center justify-center bg-gray-100 rounded-full p-2 w-12 h-12 flex-shrink-0 group-hover/item:bg-primary transition-colors duration-200">
                              <div className="child-icon" dangerouslySetInnerHTML={{ __html: child.icon }} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm group-hover/item:text-primary transition-colors duration-200">
                                {child.name}
                              </p>
                              {child.description && <p className="text-xs text-gray-500 line-clamp-1">{child.description}</p>}
                            </div>

                            <svg className="w-5 h-5 text-gray-400 group-hover/item:text-primary flex-shrink-0 transform group-hover/item:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .category-icon svg { width: 48px; height: 48px; stroke: #374151; transition: all 0.3s ease; }
        .group:hover .category-icon svg { stroke: white; transform: rotate(5deg); }
        .child-icon svg { width: 28px; height: 28px; stroke: #374151; transition: all 0.2s ease; }
        .group\\/item:hover .child-icon svg { stroke: white; }
        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #00008F; border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #000070; }
      `}</style>
    </div>
  );
};

export default Categories;
