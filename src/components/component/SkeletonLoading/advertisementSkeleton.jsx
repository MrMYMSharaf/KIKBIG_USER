import React from "react";

const AdvertisementSkeleton = ({ layout = "grid", count = 8 }) => {
  const skeletons = Array.from({ length: count });

  return (
    <div
      className={`grid ${
        layout === "grid"
          ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          : "grid-cols-1 gap-2"
      }`}
    >
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`relative flex flex-col bg-white border border-gray-200 rounded-lg shadow animate-pulse ${
            layout === "list" ? "sm:flex-row" : ""
          }`}
        >
          {/* Image Placeholder */}
          <div
            className={`bg-gray-200 ${
              layout === "grid"
                ? "w-full h-48 rounded-t-lg"
                : "w-full sm:w-48 h-48 sm:h-full rounded-t-lg sm:rounded-none sm:rounded-l-lg"
            }`}
          ></div>

          {/* Content Placeholder */}
          <div className="p-5 flex flex-col justify-between leading-normal space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-8 bg-gray-300 rounded w-24 mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdvertisementSkeleton;
