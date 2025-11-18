import React from 'react';

const DashboardSkeleton = () => {
  // Create an array of 12 skeleton items to match typical category grid
  const skeletonItems = Array(19).fill(null);

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-4 sm:p-6'>
      <div className="max-w-7xl mx-auto mt-4 sm:mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 pb-20 sm:pb-32">
          {skeletonItems.map((_, index) => (
            <div key={index} className="flex flex-col items-center justify-center animate-pulse">
              {/* Round Icon Skeleton */}
              <div className="bg-gray-200 rounded-full w-20 h-20 sm:w-24 sm:h-24 mb-2 sm:mb-3"></div>
              
              {/* Category Name Skeleton */}
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24 mb-1.5 sm:mb-2"></div>
              
              {/* Subcategory Count Skeleton */}
              <div className="h-3 bg-gray-200 rounded w-14 sm:w-16"></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardSkeleton;