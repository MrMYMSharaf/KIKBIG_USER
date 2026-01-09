import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Upload, X, ImageIcon, AlertCircle, Info, Crown, Zap } from 'lucide-react';
import { addImage, removeImage } from '../../../features/redux/pagecreationSlice';
import { useGetAllImagePricesQuery } from '../../../features/page.imagePriceApi';

// ✅ FIXED: Helper function to get price - handles both country codes AND currency codes
const getPriceForCountry = (prices, countryCode) => {
  if (!prices) return { price: 0, gateway: 'stripe' };
  const key = countryCode || 'US';
  
  console.log('🔍 Getting price for country:', key, 'Available prices:', Object.keys(prices || {}));
  
  // Map country codes to currency codes for backend compatibility
  const currencyCodeMap = {
    'US': 'USD',
    'LK': 'LK',
    'AU': 'AUD',
    'IN': 'INR',
    'AE': 'AED'
  };
  
  const currencyCode = currencyCodeMap[key] || key;
  
  // Try in order: country code -> currency code -> LK -> US/USD -> first available
  const result = prices[key] || prices[currencyCode] || prices['LK'] || prices['US'] || prices['USD'] || Object.values(prices)[0] || { price: 0, gateway: 'stripe' };
  
  console.log('💰 Found price:', result, 'for country:', key, '(checked as', currencyCode, ')');
  
  return result;
};

const GalleryWithPricing = ({ imagePreview, setImagePreview, formData, country, currencyConfig }) => {
  const dispatch = useDispatch();
  const { data: imagePricesData, isLoading: loadingPrices } = useGetAllImagePricesQuery();
  
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [pricingPlan, setPricingPlan] = useState(null);

  // 🔥 DEBUG: Log when country prop changes
  useEffect(() => {
    console.log('🌍 Country prop changed to:', country);
    console.log('💱 Currency:', currencyConfig?.code, currencyConfig?.symbol);
  }, [country]);

  // ✅ Calculate pricing based on image count with country-aware pricing
  useEffect(() => {
    if (!imagePricesData?.data) {
      console.log('⏳ Waiting for pricing data...');
      return;
    }

    const imageCount = imagePreview.gallery.length;
    const plans = imagePricesData.data;

    console.log('🔄 Recalculating pricing with:', {
      imageCount,
      country,
      currencyCode: currencyConfig?.code,
      availablePlans: plans.map(p => p.name)
    });

    const pricingInfo = calculatePricing(
      imageCount,
      plans,
      country,
      currencyConfig
    );

    console.log('✅ New pricing calculated:', pricingInfo);
    setPricingPlan(pricingInfo);
  }, [
    imagePreview.gallery.length,
    imagePricesData,
    country,
  ]);

  // Calculate pricing logic
  const calculatePricing = (imageCount, plans, countryCode, currency) => {
    console.log('💵 Calculating pricing for:', { imageCount, countryCode, currency });
    
    const freePlan = plans.find(p => p.name.toLowerCase() === 'free');
    const basicPlan = plans.find(p => p.name.toLowerCase() === 'basic');
    const proPlan = plans.find(p => p.name.toLowerCase() === 'pro');
    
    if (!basicPlan || !proPlan) {
      console.warn('❌ Required pricing plans not found');
      return null;
    }

    const basicPriceInfo = getPriceForCountry(basicPlan.prices, countryCode);
    const proPriceInfo = getPriceForCountry(proPlan.prices, countryCode);

    console.log('📊 Plan prices:', {
      basic: basicPriceInfo,
      pro: proPriceInfo
    });

    let totalCost = 0;
    let breakdown = [];
    
    const freeImages = freePlan?.imageLimit || 2;
    const basicLimit = basicPlan.imageLimit;
    const basicPrice = basicPriceInfo.price;
    const proPrice = proPriceInfo.price;

    if (imageCount <= freeImages) {
      breakdown.push(`${imageCount} images: Free`);
    } else if (imageCount <= basicLimit) {
      totalCost = basicPrice;
      breakdown.push(`${freeImages} images: Free`);
      breakdown.push(`${imageCount - freeImages} additional images: ${currency.symbol}${basicPrice}`);
    } else {
      const proImages = imageCount - basicLimit;
      totalCost = basicPrice + (proImages * proPrice);
      breakdown.push(`${freeImages} images: Free`);
      breakdown.push(`${basicLimit - freeImages} images (Basic): ${currency.symbol}${basicPrice}`);
      breakdown.push(`${proImages} extra images (Pro): ${currency.symbol}${(proImages * proPrice).toFixed(2)} (${currency.symbol}${proPrice}/image)`);
    }

    const result = {
      imageCount,
      totalCost,
      breakdown,
      freeImages,
      basicLimit,
      basicPrice,
      proPrice,
      currency: currency.code,
      currencySymbol: currency.symbol,
      isInFreeRange: imageCount <= freeImages,
      isInBasicRange: imageCount > freeImages && imageCount <= basicLimit,
      isInProRange: imageCount > basicLimit,
      gateway: imageCount > freeImages ? (imageCount <= basicLimit ? basicPriceInfo.gateway : proPriceInfo.gateway) : null,
    };

    console.log('✨ Final pricing result:', result);
    return result;
  };

  // ✅ FIXED: Handle multiple image uploads properly by batching them
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Convert all files to base64 first
    const base64Promises = files.map(file => convertToBase64(file));
    
    try {
      const base64Images = await Promise.all(base64Promises);
      
      // Batch update all images at once
      base64Images.forEach(base64 => {
        dispatch(addImage(base64));
      });
      
      // Update preview with all new images at once
      setImagePreview({ 
        ...imagePreview, 
        gallery: [...imagePreview.gallery, ...base64Images] 
      });
      
      console.log('✅ Successfully uploaded', base64Images.length, 'images');
    } catch (error) {
      console.error('Error converting images:', error);
      alert('Failed to upload some images. Please try again.');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    dispatch(removeImage(index));
    setImagePreview({
      ...imagePreview,
      gallery: imagePreview.gallery.filter((_, i) => i !== index),
    });
  };

  // Pricing badge component
  const PricingBadge = () => {
    if (!pricingPlan || loadingPrices) return null;

    return (
      <div 
        key={`${country}-${pricingPlan.imageCount}`}
        className="bg-gradient-to-r from-[#00008F] to-blue-600 rounded-xl p-4 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {pricingPlan.isInFreeRange && (
              <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                FREE
              </div>
            )}
            {pricingPlan.isInBasicRange && (
              <div className="bg-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                BASIC
              </div>
            )}
            {pricingPlan.isInProRange && (
              <div className="bg-purple-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                PRO
              </div>
            )}
            <span className="text-sm font-semibold">
              {pricingPlan.imageCount} {pricingPlan.imageCount === 1 ? 'Image' : 'Images'}
            </span>
          </div>
          <button
            onClick={() => setShowPricingInfo(!showPricingInfo)}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black">
            {pricingPlan.currencySymbol}{pricingPlan.totalCost.toFixed(2)}
          </span>
          <span className="text-sm opacity-80">
            {pricingPlan.currency} total
          </span>
        </div>

        {pricingPlan.gateway && (
          <div className="mt-2 text-xs opacity-80">
            Payment via: <span className="font-semibold capitalize">{pricingPlan.gateway}</span>
          </div>
        )}

        {showPricingInfo && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs font-semibold mb-2 opacity-90">Pricing Breakdown:</p>
            <div className="space-y-1">
              {pricingPlan.breakdown.map((item, index) => (
                <p key={index} className="text-xs opacity-80">• {item}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Pricing info panel
  const PricingInfoPanel = () => {
    if (loadingPrices) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-blue-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                  <div className="h-3 bg-blue-200 rounded w-full"></div>
                  <div className="h-3 bg-blue-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!imagePricesData?.data || imagePricesData.data.length === 0) return null;

    return (
      <div 
        key={`pricing-panel-${country}`}
        className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00008F] to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">Image Pricing Plans</h4>
            <p className="text-sm text-gray-600">
              Prices in {currencyConfig?.name} ({currencyConfig?.symbol}) - Country: {country}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {imagePricesData.data
            .filter(plan => plan.status === 'active')
            .sort((a, b) => a.imageLimit - b.imageLimit)
            .map((plan) => {
              const priceInfo = getPriceForCountry(plan.prices, country);
              
              const isPro = plan.name.toLowerCase() === 'pro';
              const isBasic = plan.name.toLowerCase() === 'basic';
              const isFree = plan.name.toLowerCase() === 'free';
              
              let bgColor = 'from-gray-400 to-gray-600';
              let iconColor = 'bg-gray-500';
              let icon = <ImageIcon className="w-6 h-6 text-white" />;
              
              if (isFree) {
                bgColor = 'from-green-400 to-green-600';
                iconColor = 'bg-green-500';
                icon = <Zap className="w-6 h-6 text-white" />;
              } else if (isBasic) {
                bgColor = 'from-blue-400 to-blue-600';
                iconColor = 'bg-blue-500';
                icon = <ImageIcon className="w-6 h-6 text-white" />;
              } else if (isPro) {
                bgColor = 'from-purple-400 to-purple-600';
                iconColor = 'bg-purple-500';
                icon = <Crown className="w-6 h-6 text-white" />;
              }

              return (
                <div
                  key={`${plan._id}-${country}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-gray-200 hover:border-blue-400 p-5 relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${bgColor} opacity-10 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  <div className={`w-14 h-14 ${iconColor} rounded-full flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                    {icon}
                  </div>

                  <h5 className="text-lg font-black text-gray-900 mb-2 relative z-10">{plan.name}</h5>
                  
                  <div className="mb-3 relative z-10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">
                        {currencyConfig?.symbol}{priceInfo.price}
                      </span>
                      {isPro && <span className="text-sm text-gray-500 font-semibold">/image</span>}
                    </div>
                    {priceInfo.price > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        via <span className="font-semibold capitalize">{priceInfo.gateway}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 relative z-10">
                    {plan.description}
                  </p>

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">
                        {plan.imageLimit === 999 ? 'Unlimited images' : `Up to ${plan.imageLimit} images`}
                      </span>
                    </div>

                    {isFree && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">No payment required</span>
                      </div>
                    )}

                    {isBasic && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">One-time payment</span>
                      </div>
                    )}

                    {isPro && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">Pay per additional image</span>
                      </div>
                    )}
                  </div>

                  {isPro && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-12">
                      BEST VALUE
                    </div>
                  )}

                  {isBasic && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      POPULAR
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <div className="mt-6 bg-white rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">How it works:</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Upload your first 2 images for free. Images 3-5 cost {currencyConfig?.symbol}
                {(() => {
                  const basicPlan = imagePricesData.data.find(p => p.name.toLowerCase() === 'basic');
                  if (basicPlan) {
                    const priceInfo = getPriceForCountry(basicPlan.prices, country);
                    return priceInfo.price;
                  }
                  return '10';
                })()}{' '}
                total (Basic plan). 
                After 5 images, each additional image costs {currencyConfig?.symbol}
                {(() => {
                  const proPlan = imagePricesData.data.find(p => p.name.toLowerCase() === 'pro');
                  if (proPlan) {
                    const priceInfo = getPriceForCountry(proPlan.prices, country);
                    return priceInfo.price;
                  }
                  return '2';
                })()}{' '}
                (Pro plan). The total cost is calculated automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      <PricingInfoPanel />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Photo Gallery</h3>
          <p className="text-sm text-gray-500 mt-1">
            {imagePreview.gallery.length} {imagePreview.gallery.length === 1 ? 'image' : 'images'} uploaded
          </p>
        </div>
        <label className="cursor-pointer bg-[#00008F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00006F] transition-colors flex items-center gap-2 shadow-lg">
          <Upload className="w-4 h-4" />
          Add Photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {imagePreview.gallery.length > 0 && <PricingBadge />}

      {imagePreview.gallery.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {imagePreview.gallery.map((img, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-lg overflow-hidden group border-2 border-gray-200"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
                
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                  #{index + 1}
                </div>

                {index < 2 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    FREE
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold mb-2">No photos yet</p>
          <p className="text-gray-400 text-sm mb-2">Upload photos to showcase your page</p>
          <p className="text-green-600 text-sm font-semibold mb-4">
            🎉 First 2 images are FREE!
          </p>
          <label className="inline-flex cursor-pointer bg-[#00008F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00006F] transition-colors shadow-lg">
            <Upload className="w-5 h-5 mr-2" />
            Upload Photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {pricingPlan && pricingPlan.imageCount > 10 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 mb-1">
              High Image Count
            </p>
            <p className="text-xs text-yellow-700">
              You have {pricingPlan.imageCount} images. Consider optimizing your gallery for better performance and lower costs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryWithPricing;


