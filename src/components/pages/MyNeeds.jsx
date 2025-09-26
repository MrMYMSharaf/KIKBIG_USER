import React, { useState } from 'react';
import AdsCard from '../shared/card/AdsCard';
import { FaTh, FaBars } from 'react-icons/fa';

const MyNeeds = () => {
  const [layout, setLayout] = useState('grid');

  const toggleLayout = (newLayout) => {
    setLayout(newLayout);
  };

  const ads = Array.from({ length: 12 }).map((_, index) => (
    <AdsCard key={index} layout={layout} />
  ));

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex-1 p-4">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">View All Needs</h1>
          <div className="flex flex-row">
            <FaTh
              onClick={() => toggleLayout('grid')}
              className={`cursor-pointer mx-2 ${layout === 'grid' ? 'text-blue-500' : ''}`}
            />
            <FaBars
              onClick={() => toggleLayout('list')}
              className={`cursor-pointer mx-2 ${layout === 'list' ? 'text-blue-500' : ''}`}
            />
          </div>
        </div>
        <div
          className={`grid 
            ${layout === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
              : 'grid-cols-1 gap-2'
            } 
            overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-32`}
          style={{ maxHeight: 'calc(100vh - 150px)' }}
        >
          {ads}
        </div>
      </div>
      
      {/* Google AdSense Section - Responsive */}
      <div className="hidden lg:block w-[25%] md:w-[15%] h-screen bg-white">
        {/* AdSense content */}
        <div className="p-4 bg-gray-100 h-full">
          <h2 className="text-lg font-semibold mb-4">Advertisements</h2>
          {/* Placeholder for Google AdSense */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <p className="text-gray-500 text-center">Google AdSense</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNeeds;