import React, { useState, useEffect, useRef } from "react";
import AdsCard from "../shared/card/AdsCard";
import { FaTh, FaBars } from "react-icons/fa";
import { 
  useGetAllAdvertisementsAdsQuery, 
  useGetAdvertisementsByCategoryQuery,
  useGetAdvertisementsAdsByCountryQuery 
} from "../../features/postadsSlice";
import { useNavigate, useParams } from "react-router-dom";
import AdvertisementSkeleton from "../component/SkeletonLoading/advertisementSkeleton.jsx";

const ViewAllAds = () => {
  const [layout, setLayout] = useState("grid");
  const [page, setPage] = useState(1);
  const [allAds, setAllAds] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const observerTarget = useRef(null);

  const navigate = useNavigate();
  
  // ✅ Extract all params including mode
  const { countrySlug, mode, categorySlug, subCategorySlug } = useParams();

  const sidebarAds = [
    "/ads/160_600.png",
    "/ads/250_250.png",
    "/ads/300_600.png",
    "/ads/336_280.png",
  ];

  const toggleLayout = (newLayout) => setLayout(newLayout);

  // ✅ FIXED: Now passes mode to the category query
  const {
    data,
    isLoading,
    isError,
    error
  } = categorySlug
    ? useGetAdvertisementsByCategoryQuery({
        countrySlug,
        mode: mode || 'viewallads', // ✅ Pass the mode from URL
        categorySlug,
        subCategorySlug,
        page,
        limit: 12
      })
    : countrySlug
      ? useGetAdvertisementsAdsByCountryQuery({
          countrySlug,
          page,
          limit: 12
        })
      : useGetAllAdvertisementsAdsQuery({
          page,
          limit: 12
        });

  // Only navigate on critical errors like 404 for invalid routes
  useEffect(() => {
    if (isError && error?.status === 404 && error?.data?.message?.includes('route')) {
      navigate("/");
    }
  }, [isError, error, navigate]);

  // Append new data when it loads
  useEffect(() => {
    if (data?.data) {
      setAllAds((prev) => {
        const newAds = data.data.filter(
          (ad) => !prev.some((existingAd) => existingAd._id === ad._id)
        );
        return [...prev, ...newAds];
      });

      if (data.pagination) {
        setHasMore(page < data.pagination.totalPages);
      }
    }
  }, [data, page]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading]);

  // 🌀 Sponsored ads auto-loop every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % sidebarAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Function to inject demo ad placeholders
  const withDemoAds = (ads) => {
    const updated = [];
    ads.forEach((ad, index) => {
      updated.push(ad);
      if ((index + 1) % 4 === 0) {
        updated.push({ _id: `demo-ad-${index}`, isDemoAd: true });
      }
    });
    return updated;
  };

  const adsWithDemos = withDemoAds(allAds);

  // ✅ Show loading skeleton on initial load
  if (isLoading && page === 1) {
    return (
      <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">View All Ads</h1>
          </div>
          <AdvertisementSkeleton layout={layout} count={12} />
        </div>
      </div>
    );
  }

  // ✅ Show error state but stay on the page
  if (isError && !data) {
    return (
      <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">View All Ads</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Failed to load advertisements</h2>
            <p className="text-gray-500 mb-6">There was an error loading the ads. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get page title based on filters
  const getPageTitle = () => {
    let title = "View All Ads";
    if (categorySlug) {
      title = subCategorySlug ? "Subcategory Ads" : "Category Ads";
    }
    if (countrySlug) {
      title += ` in ${countrySlug}`;
    }
    return title;
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
      {/* 🏠 Main Ads Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Top Banner Ad */}
          <div className="w-full flex justify-center mb-4">
            <img
              src="/ads/728_90.png"
              alt="Top Banner Ad"
              className="rounded-lg border border-gray-200"
            />
          </div>

          {/* Breadcrumbs */}
          {(countrySlug || categorySlug) && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <button 
                onClick={() => navigate('/categories')}
                className="hover:text-primary transition-colors"
              >
                Home
              </button>
              {countrySlug && (
                <>
                  <span>›</span>
                  <span className="font-semibold capitalize">{countrySlug}</span>
                </>
              )}
              {categorySlug && (
                <>
                  <span>›</span>
                  <span className="font-semibold capitalize">{categorySlug}</span>
                </>
              )}
              {subCategorySlug && (
                <>
                  <span>›</span>
                  <span className="font-semibold capitalize">{subCategorySlug}</span>
                </>
              )}
            </div>
          )}

          {/* Layout Controls */}
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {getPageTitle()}
              {data?.pagination && (
                <span className="text-sm text-gray-500 ml-2">
                  ({data.pagination.totalItems} ads)
                </span>
              )}
            </h1>
            <div className="flex flex-row">
              <FaTh
                onClick={() => toggleLayout("grid")}
                className={`cursor-pointer mx-2 text-2xl ${layout === "grid" ? "text-blue-500" : "text-gray-400"}`}
              />
              <FaBars
                onClick={() => toggleLayout("list")}
                className={`cursor-pointer mx-2 text-2xl ${layout === "list" ? "text-blue-500" : "text-gray-400"}`}
              />
            </div>
          </div>

          {/* ✅ Show "No ads found" if data loaded but empty */}
          {!isLoading && allAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-32 h-32 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-3xl font-bold text-gray-700 mb-2">No Ads Found</h2>
              <p className="text-gray-500 text-center max-w-md mb-8">
                {categorySlug 
                  ? "There are no advertisements in this category yet. Check back later or browse other categories."
                  : "No advertisements available at the moment. Be the first to post one!"}
              </p>
              <button 
                onClick={() => navigate('/categories')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Browse Categories
              </button>
            </div>
          ) : (
            <>
              {/* Ads grid */}
              <div
                className={`grid ${
                  layout === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "grid-cols-1 gap-2"
                }`}
              >
                {adsWithDemos.map((ad) =>
                  ad.isDemoAd ? (
                    <div
                      key={ad._id}
                      className="flex justify-center items-center border border-gray-200 rounded-lg bg-gray-50 p-2"
                    >
                      <img
                        src={`/ads/${
                          ["250_250", "300_250", "336_280"][Math.floor(Math.random() * 3)]
                        }.png`}
                        alt="Demo Ad"
                        className="rounded-md"
                      />
                    </div>
                  ) : (
                    <AdsCard
                      key={ad._id}
                      layout={layout}
                      title={ad.title}
                      image={ad.images?.[0] || ad.image || ""}
                      description={ad.description}
                      id={ad._id}
                      category={ad.category}
                      childCategory={ad.childCategory}
                    />
                  )
                )}
              </div>

              {/* Infinite Scroll Loader */}
              {isLoading && page > 1 && (
                <div className="py-4">
                  <AdvertisementSkeleton layout={layout} count={4} />
                </div>
              )}

              {hasMore && <div ref={observerTarget} className="h-10" />}

              {!hasMore && allAds.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-block px-6 py-3 bg-gray-100 rounded-full text-gray-600">
                    🎉 You've reached the end! No more ads to load.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🎯 Sidebar Ads — Auto Loop */}
      <div className="hidden lg:flex w-[25%] md:w-[15%] bg-white flex-col justify-start items-center sticky top-0 h-screen p-4">
        <h2 className="text-lg font-semibold mb-4">Sponsored</h2>
        <div className="relative w-full flex justify-center items-center bg-gray-100 border border-gray-200 rounded-lg h-[600px] overflow-hidden">
          {sidebarAds.map((src, index) => (
            <img
              key={src}
              src={src}
              alt="Sponsored Ad"
              className={`absolute rounded-lg transition-opacity duration-700 ease-in-out ${
                index === currentAdIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAllAds;