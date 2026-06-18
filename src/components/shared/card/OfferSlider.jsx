// components/shared/card/OfferSlider.jsx

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useActiveBannersQuery } from "../../../features/bannerSlice";

const OfferSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  // Fetch active banners using RTK Query
  const { data, isLoading, isError, error } = useActiveBannersQuery();

  const banners = data?.data || [];

  const handleNext = () => {
    if (!isTransitioning && banners.length > 0) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }
  };

  const handlePrev = () => {
    if (!isTransitioning && banners.length > 0) {
      setIsTransitioning(true);
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + banners.length) % banners.length
      );
      setTimeout(() => setIsTransitioning(false), 50);
    }
  };

  const handleDotClick = (index) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  // Auto-play effect - changes slide every 0.1 second
  useEffect(() => {
    if (!isHovered && banners.length > 0) {
      intervalRef.current = setInterval(handleNext, 100); // 0.1 second interval
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, banners.length, currentIndex]);

  // Reset currentIndex if it's out of bounds
  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  const getSlideStyle = (index) => {
    const isActive = index === currentIndex;
    return {
      opacity: isActive ? 1 : 0,
      transition: "opacity 0.1s ease-in-out",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: "2rem",
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl shadow-lg overflow-hidden relative h-[500px] bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading offers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="relative w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl shadow-lg overflow-hidden relative h-[500px] bg-white flex items-center justify-center">
            <div className="text-center text-red-600">
              <p>Failed to load offers. Please try again later.</p>
              {error && <p className="text-sm mt-2">{error?.message || 'Unknown error'}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (banners.length === 0) {
    return (
      <div className="relative w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl shadow-lg overflow-hidden relative h-[500px] bg-white flex items-center justify-center">
            <div className="text-center text-gray-600">
              <p>No active offers available at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative group">
          <div className="rounded-2xl shadow-lg overflow-hidden relative h-[500px] bg-white">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                style={getSlideStyle(index)}
                className="rounded-2xl"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-xl p-6 max-w-xl shadow-lg">
                  <div className="flex items-center mb-2">
                    <Star
                      className="w-6 h-6 text-yellow-500 mr-2"
                      fill="currentColor"
                    />
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800">
                      {banner.title}
                    </h2>
                  </div>
                  <p className="text-xl mb-4 text-gray-600">
                    {banner.description}
                  </p>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full inline-block text-lg font-bold shadow-md">
                    Up to {banner.discount} Off
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {banners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 
                  bg-white hover:bg-gray-50 
                  rounded-full p-3 shadow-lg transition-all duration-300 
                  opacity-0 group-hover:opacity-100 disabled:opacity-50"
                aria-label="Previous offer"
              >
                <ChevronLeft className="text-gray-800 w-8 h-8" />
              </button>

              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 
                  bg-white hover:bg-gray-50
                  rounded-full p-3 shadow-lg transition-all duration-300 
                  opacity-0 group-hover:opacity-100 disabled:opacity-50"
                aria-label="Next offer"
              >
                <ChevronRight className="text-gray-800 w-8 h-8" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    disabled={isTransitioning}
                    className={`h-3 rounded-full transition-all duration-300 
                      ${
                        index === currentIndex
                          ? "bg-blue-500 w-8"
                          : "bg-blue-200 w-3 hover:bg-blue-300"
                      }`}
                    aria-label={`Go to offer ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferSlider;