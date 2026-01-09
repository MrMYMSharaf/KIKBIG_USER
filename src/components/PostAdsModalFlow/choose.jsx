import React, { useState } from "react";

const Choose = ({ handleChoose, handleClose }) => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'user' or 'page'
  const [selectedPage, setSelectedPage] = useState(null);

  // Mock data - replace with actual user pages
  const userPages = [
    { id: 1, name: "My Business Page", category: "Business" },
    { id: 2, name: "Community Group", category: "Community" },
    { id: 3, name: "Product Store", category: "Shopping" },
  ];

  // Define background images for each button hover state
  const backgroundImages = {
    Ads: "url('/bgimage/Add_bg_image_Ads.png')",
    Need: "url('/bgimage/need_bg.jpg')",
    Offer: "url('/bgimage/offer_bg.jpg')",
    default: "url('/bgimage/Add_bg_image.jpg')"
  };

  // Define colors for each option
  const buttonColors = {
    Ads: "from-blue-600 to-blue-800",
    Need: "from-purple-600 to-purple-800",
    Offer: "from-green-600 to-green-800"
  };

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    if (type === 'user') {
      setSelectedPage(null);
    }
  };

  const handlePageSelection = (page) => {
    setSelectedPage(page);
  };

  const handleFinalChoice = (postType) => {
    handleChoose({
      postType,
      accountType: selectedType,
      page: selectedType === 'page' ? selectedPage : null
    });
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative transition-all duration-700 p-4"
      style={{
        backgroundImage: hoveredButton ? backgroundImages[hoveredButton] : backgroundImages.default,
      }}
    >
      {/* Backdrop overlay with blur effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-700"></div>

      {/* Centered Content */}
      <div className="relative bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 sm:space-y-8 border-4 border-primary max-w-sm sm:max-w-lg md:max-w-3xl w-full mx-4 animate-slideUp">
        {/* Cancel/Close Button - Top Right */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-gradient-to-br from-red-500 to-red-700 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:from-red-600 hover:to-red-800 hover:scale-110 transition-all duration-300 flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg z-10 group"
          aria-label="Close"
        >
          <span className="group-hover:rotate-90 transition-transform duration-300">✕</span>
        </button>

        {/* Step 1: Choose User or Page */}
        {!selectedType && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Post As
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">Choose your account type</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
              {/* User Button */}
              <button
                className="group relative overflow-hidden px-6 py-8 sm:py-10 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl font-bold text-lg sm:text-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-indigo-300"
                onClick={() => handleTypeSelection('user')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-3">
                  <div className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">👤</div>
                  <span className="group-hover:tracking-wider transition-all duration-300">Personal Account</span>
                  <p className="text-xs sm:text-sm opacity-80">Post as yourself</p>
                </div>

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>

              {/* Page Button */}
              <button
                className="group relative overflow-hidden px-6 py-8 sm:py-10 bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-2xl font-bold text-lg sm:text-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-orange-300"
                onClick={() => handleTypeSelection('page')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-3">
                  <div className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">📄</div>
                  <span className="group-hover:tracking-wider transition-all duration-300">Page</span>
                  <p className="text-xs sm:text-sm opacity-80">Post from your page</p>
                </div>

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>
            </div>
          </>
        )}

        {/* Step 2: Select Page (if page type selected) */}
        {selectedType === 'page' && !selectedPage && (
          <>
            <div className="text-center space-y-2">
              <button
                onClick={() => setSelectedType(null)}
                className="text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-2 mx-auto"
              >
                <span>←</span> Back
              </button>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Select Your Page
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">Choose which page to post from</p>
            </div>

            <div className="w-full space-y-3 max-h-96 overflow-y-auto">
              {userPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handlePageSelection(page)}
                  className="w-full group relative overflow-hidden p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-lg border-2 border-gray-200 hover:border-orange-400"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                      {page.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-800 text-base sm:text-lg group-hover:text-orange-700 transition-colors">
                        {page.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">{page.category}</p>
                    </div>
                    <div className="text-orange-500 group-hover:translate-x-1 transition-transform">→</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Choose Post Type (after user/page selection) */}
        {(selectedType === 'user' || (selectedType === 'page' && selectedPage)) && (
          <>
            <div className="text-center space-y-2">
              <button
                onClick={() => {
                  if (selectedType === 'page' && selectedPage) {
                    setSelectedPage(null);
                  } else {
                    setSelectedType(null);
                  }
                }}
                className="text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-2 mx-auto"
              >
                <span>←</span> Back
              </button>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Choose Your Post Type
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {selectedType === 'user' 
                  ? "Posting as Personal Account" 
                  : `Posting as ${selectedPage.name}`}
              </p>
            </div>

            {/* Buttons Grid - Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
              {/* Ads Button */}
              <button
                className={`group relative overflow-hidden px-6 py-6 sm:py-8 bg-gradient-to-br ${buttonColors.Ads} text-white rounded-2xl font-bold text-lg sm:text-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-blue-300`}
                onClick={() => handleFinalChoice("Ads")}
                onMouseEnter={() => setHoveredButton("Ads")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-2">
                  <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">📢</div>
                  <span className="group-hover:tracking-wider transition-all duration-300">Ads</span>
                  <p className="text-xs sm:text-sm opacity-80">Promote your business</p>
                </div>

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>

              {/* Need Button */}
              <button
                className={`group relative overflow-hidden px-6 py-6 sm:py-8 bg-gradient-to-br ${buttonColors.Need} text-white rounded-2xl font-bold text-lg sm:text-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-purple-300`}
                onClick={() => handleFinalChoice("Need")}
                onMouseEnter={() => setHoveredButton("Need")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-2">
                  <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">🔍</div>
                  <span className="group-hover:tracking-wider transition-all duration-300">Need</span>
                  <p className="text-xs sm:text-sm opacity-80">Looking for something</p>
                </div>

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>

              {/* Offer Button */}
              <button
                className={`group relative overflow-hidden px-6 py-6 sm:py-8 bg-gradient-to-br ${buttonColors.Offer} text-white rounded-2xl font-bold text-lg sm:text-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-green-300`}
                onClick={() => handleFinalChoice("Offer")}
                onMouseEnter={() => setHoveredButton("Offer")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-2">
                  <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">🎁</div>
                  <span className="group-hover:tracking-wider transition-all duration-300">Offer</span>
                  <p className="text-xs sm:text-sm opacity-80">Share your services</p>
                </div>

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>
            </div>

            {/* Bottom hint text */}
            <p className="text-gray-500 text-xs sm:text-sm text-center italic">
              Click on any option to continue
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Choose;