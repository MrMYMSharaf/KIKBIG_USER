import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAdtypeQuery } from "../../features/adtypeSlice";
import { useLocationQuery } from "../../features/locationSlice";
import { uploadAdData } from "../../functions/uploadAdData";
import { handlePayment } from "../../functions/handlePayment";

const PaymentForAds = ({ onBack, onNext }) => {

  const dispatch = useDispatch();
  
  const { data: adTypesData, error, isLoading } = useAdtypeQuery();
  const { data: locationsData } = useLocationQuery();
  
  // Get pricing data from Redux
  const extraImagesCount = useSelector((state) => state.adPost.pricing.extraImagesCount);
  const pricePerExtraImage = useSelector((state) => state.adPost.pricing.pricePerExtraImage);
  const formDataFromRedux = useSelector((state) => state.adPost.formData);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  // 🔥 FIXED: Get account type and selected page from Redux
  const accountType = useSelector((state) => state.adPost.accountType);
  const selectedPage = useSelector((state) => state.adPost.selectedPage);

  
  
  const [formData, setFormData] = useState({
    adType: "",
  });

  const adTypes = adTypesData || [];
  
  // 🔥 NEW: Get country information from selected location
  const getCountryInfo = useMemo(() => {
    const countries = locationsData?.data || [];
    const selectedCountry = countries.find((c) => c._id === formDataFromRedux.country);
    
    if (!selectedCountry) {
      return { code: 'US', currency: 'USD', symbol: '$' };
    }

    // Map country codes to currency info
    const currencyMap = {
      'LK': { code: 'LK', currency: 'LKR', symbol: 'Rs.' },
      'AU': { code: 'AU', currency: 'AU', symbol: 'A$' },
      'US': { code: 'US', currency: 'USD', symbol: '$' },
    };

    // Try to match by country code or name
    const countryCode = selectedCountry.code?.toUpperCase();
    const countryName = selectedCountry.name?.toLowerCase();

    if (countryCode === 'LK' || countryName?.includes('sri lanka')) {
      return currencyMap.LK;
    } else if (countryCode === 'AU' || countryName?.includes('australia')) {
      return currencyMap.AU;
    } else {
      return currencyMap.US; // Default to USD for all other countries
    }
  }, [formDataFromRedux.country, locationsData]);

  // 🔥 NEW: Get country-specific pricing for ad types
  const getAdTypePrice = (adType) => {
    if (!adType?.prices) return 0;
    
    // Try to get price for selected country
    const countryPrice = adType.prices[getCountryInfo.code];
    
    if (countryPrice) {
      return countryPrice.price;
    }
    
    // Fallback to USD if country not found
    return adType.prices.US?.price || 0;
  };

  const selectedAdType = adTypes.find(type => type._id === formData.adType);

  // 🔥 Auto-select the first ad type if none is selected
  useEffect(() => {
    if (adTypes.length > 0 && !formData.adType) {
      console.log("Auto-selecting first ad type:", adTypes[0]._id);
      setFormData({ adType: adTypes[0]._id });
    }
  }, [adTypes, formData.adType]);

  // 🔥 UPDATED: Calculate total costs with country-specific pricing
  const costBreakdown = useMemo(() => {
    const extraImagesCost = extraImagesCount * pricePerExtraImage;
    const adTypeCost = selectedAdType ? getAdTypePrice(selectedAdType) : 0;
    const totalCost = extraImagesCost + adTypeCost;
    
    return {
      extraImagesCost,
      adTypeCost,
      totalCost,
      hasExtraImages: extraImagesCount > 0,
      isFree: totalCost === 0,
      currency: getCountryInfo.currency,
      currencySymbol: getCountryInfo.symbol
    };
  }, [extraImagesCount, pricePerExtraImage, selectedAdType, getCountryInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentClick = async () => {
    if (!isAuthenticated) {
      alert("Please login to post an ad");
      return;
    }

    if (!selectedAdType) {
      alert("Please select ad type");
      return;
    }

    // 🔥 FIXED: Validate accountType before proceeding
    if (!accountType) {
      console.error("❌ accountType is missing!");
      alert("Account type is missing. Please go back and select your account type.");
      return;
    }

    try {
      // 🔥 FIXED: Build the upload payload with accountType and selectedPage
      const uploadPayload = {
        ...formDataFromRedux,
        adType: selectedAdType._id,
        accountType: accountType, // 'user' or 'page'
        ...(accountType === 'page' && selectedPage && { 
          page: selectedPage._id || selectedPage.id 
        }),
        countryCode: getCountryInfo.code,
      };

      console.log("📤 Upload payload being sent:", uploadPayload);

      // FREE AD
      if (costBreakdown.isFree) {
        await uploadAdData({
          ...uploadPayload,
          totalCost: 0,
          currency: costBreakdown.currency,
        });

        onNext();
        return;
      }

      // PAID AD
      const paymentSuccess = await handlePayment({
        amount: costBreakdown.totalCost,
        currency: costBreakdown.currency,
        adType: selectedAdType.name,
        countryCode: getCountryInfo.code,
      });

      if (!paymentSuccess) {
        alert("Payment failed");
        return;
      }

      await uploadAdData({
        ...uploadPayload,
        price: costBreakdown.adTypeCost,
        extraImagesCost: costBreakdown.extraImagesCost,
        totalCost: costBreakdown.totalCost,
        currency: costBreakdown.currency,
      });

      onNext();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };


  // Progress Steps
  const steps = [
    { number: 1, label: "Ad Details", active: false },
    { number: 2, label: "Payment", active: true },
    { number: 3, label: "Verification", active: false },
    { number: 4, label: "Published", active: false },
  ];

  // Ad placement visualization based on priority
  const getAdPlacementVisualization = (priority) => {
    const placements = {
      0: {
        title: "VIP Placement",
        features: ["Maximum visibility", "Top of all sections", "Priority badge", "Extended duration", "5x more exposure"],
        color: "from-purple-500 to-pink-600",
        badge: "👑 VIP",
      },
      1: {
        title: "Premium Featured Placement",
        features: ["Top of search results", "Homepage featured section", "Highlighted border", "Badge display", "3x more visibility"],
        color: "from-yellow-400 to-orange-500",
        badge: "⭐ PREMIUM",
      },
      2: {
        title: "Standard Highlighted Placement",
        features: ["Regular search results", "Light highlighting", "Standard visibility", "Good exposure"],
        color: "from-blue-400 to-blue-600",
        badge: "✨ HIGHLIGHTED",
      },
      3: {
        title: "Free Basic Placement",
        features: ["Standard listing", "Regular search results", "No special highlighting", "Basic visibility"],
        color: "from-gray-400 to-gray-600",
        badge: "📋 BASIC",
      }
    };

    return placements[priority] || placements[3];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading ad types...</p>
        </div>
      </div>
    );
  }

  if (error || adTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <p className="text-red-500 text-xl font-bold text-center">Failed to load ad types</p>
          <p className="text-gray-600 text-center mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg transition-all duration-300 ${
                    step.active 
                      ? 'bg-primary text-white shadow-lg' 
                      : step.number < 2 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number < 2 ? '✓' : step.number}
                  </div>
                  <span className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-center ${
                    step.active ? 'text-primary' : step.number < 2 ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 rounded transition-all duration-300 ${
                    step.number < 2 ? 'bg-green-500' : step.active ? 'bg-primary' : 'bg-gray-200'
                  }`} style={{ marginTop: '-20px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 🔥 NEW: Country & Currency Info Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌍</div>
              <div>
                <p className="text-sm font-semibold opacity-90">Selected Location</p>
                <p className="text-lg font-bold">{getCountryInfo.currency} Pricing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Currency</p>
              <p className="text-2xl font-bold">{costBreakdown.currencySymbol}</p>
            </div>
          </div>
        </div>

        {/* 🔥 NEW: Account Type Display Banner */}
        {accountType && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {accountType === 'page' ? '📄' : '👤'}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">
                  Posting As
                </h3>
                <p className="text-xl font-bold text-blue-600">
                  {accountType === 'page' 
                    ? (selectedPage?.pagename || selectedPage?.title || selectedPage?.name || 'Page')
                    : 'Personal Account'}
                </p>
                {accountType === 'page' && selectedPage && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {selectedPage.category?.name || 'Page'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedPage.pagetype?.isPaid || 
                      ['vip', 'premium', 'standard'].some(type => 
                        (selectedPage.pagetype?.name || '').toLowerCase().includes(type)
                      )
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedPage.pagetype?.name || selectedPage.pagetype?.typename || 'Basic'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mb-4 sm:mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-primary to-blue-700 p-4 sm:p-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-playfair tracking-tight">Choose Your Ad Package</h2>
            <p className="text-blue-50 mt-2 sm:mt-3 text-sm sm:text-lg">Select the best option for maximum visibility</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Ad Type Selection */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 border border-gray-100">
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-playfair">Select Ad Type</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Choose how you want your ad to be displayed</p>
            </div>

            {/* Ad Type Cards */}
            <div className="space-y-3 sm:space-y-4">
              {adTypes.map((type) => {
                const isSelected = formData.adType === type._id;
                const typePrice = getAdTypePrice(type);
                const isFree = typePrice === 0;
                
                return (
                  <div
                    key={type._id}
                    onClick={() => setFormData({ adType: type._id })}
                    className={`cursor-pointer border-2 rounded-xl p-4 sm:p-5 transition-all duration-300 ${
                      isSelected
                        ? 'border-primary bg-blue-50 shadow-lg transform scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base sm:text-lg font-bold text-gray-900">{type.name}</h4>
                          {isFree && (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{type.description}</p>
                        <p className="text-xs text-gray-500 mb-3">Valid for {type.validdays} days</p>
                        
                        <div className="flex items-baseline gap-2">
                          {isFree ? (
                            <span className="text-2xl sm:text-3xl font-bold text-green-600">Free</span>
                          ) : (
                            <>
                              <span className="text-xs sm:text-sm text-gray-500">Price:</span>
                              <span className="text-2xl sm:text-3xl font-bold text-primary">
                                {costBreakdown.currencySymbol}{typePrice.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">{costBreakdown.currency}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Summary */}
            {selectedAdType && (
              <div className="border-t-2 border-gray-100 pt-4 sm:pt-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 border-2 border-blue-200">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Payment Summary</h4>
                  
                  <div className="space-y-3">
                    {/* Ad Package Cost */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ad Package:</span>
                      <span className="text-sm font-bold text-gray-900">{selectedAdType.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                      <span className="text-sm text-gray-600">Package Price:</span>
                      <span className={`text-base font-bold ${costBreakdown.adTypeCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {costBreakdown.adTypeCost === 0 ? 'FREE' : `${costBreakdown.currencySymbol}${costBreakdown.adTypeCost.toLocaleString()}`}
                      </span>
                    </div>

                    {/* Extra Images Cost */}
                    {costBreakdown.hasExtraImages && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Extra Images:</span>
                          <span className="text-sm text-gray-900">{extraImagesCount} image{extraImagesCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                          <span className="text-sm text-gray-600">Images Cost:</span>
                          <span className="text-base font-bold text-orange-600">
                            {costBreakdown.currencySymbol}{costBreakdown.extraImagesCost.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Total Amount */}
                    <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-blue-100 to-indigo-100 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 rounded-b-lg">
                      <span className="text-base font-bold text-gray-900">Total Amount:</span>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${costBreakdown.isFree ? 'text-green-600' : 'text-primary'}`}>
                          {costBreakdown.isFree ? 'FREE' : `${costBreakdown.currencySymbol}${costBreakdown.totalCost.toLocaleString()}`}
                        </span>
                        {!costBreakdown.isFree && (
                          <p className="text-xs text-gray-500 mt-1">{costBreakdown.currency}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Ad Preview */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 border border-gray-100">
            <div className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-playfair">Ad Placement Preview</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">See how your ad will appear</p>
            </div>

            {selectedAdType ? (
              <div className="space-y-4 sm:space-y-6">
                {(() => {
                  const placement = getAdPlacementVisualization(selectedAdType.priority);
                  return (
                    <>
                      {/* Badge */}
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${placement.color} text-white font-bold text-sm`}>
                        {placement.badge}
                      </div>

                      {/* Placement Title */}
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{placement.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Duration: {selectedAdType.validdays} days</p>
                      </div>

                      {/* Features */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        {placement.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl sm:text-7xl mb-4">📢</div>
                <p className="text-gray-500 text-sm sm:text-base">Select an ad type to see the placement preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 mt-4 sm:mt-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
            <button 
              onClick={onBack} 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              ← Back to Ad Details
            </button>
            <button
              onClick={handlePaymentClick}
              disabled={!formData.adType}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 font-bold rounded-xl transition-all duration-200 shadow-lg text-sm sm:text-base ${
                formData.adType
                  ? 'bg-gradient-to-r from-primary to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {costBreakdown.isFree 
                ? 'Post Ad for Free →' 
                : `Pay ${costBreakdown.currencySymbol}${costBreakdown.totalCost.toLocaleString()} & Continue →`
              }
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="text-center mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm px-4">
          <p>💡 Prices shown in {costBreakdown.currency} based on your selected location</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForAds;