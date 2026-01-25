import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ImageUpload = ({ 
  images, 
  onChange, 
  maxImages, 
  adType,
  showImageUpload,
}) => {
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // 🔥 Get tiered pricing from Redux
  const pricingState = useSelector((state) => state.adPost.pricing) || {};

const {
  freeLimit = 0,
  bundleLimit = 0,
  bundlePrice = 0,
  perImagePrice = 0,
  totalImageCost = 0,
  currencySymbol = 'LKR',
  costBreakdown = {
    freeImages: 0,
    bundleImages: 0,
    bundleCost: 0,
    perImageImages: 0,
    perImageCost: 0
  }
} = pricingState;


  // Restore previews from persisted base64 data
  useEffect(() => {
    if (images.length > 0) {
      const restoredPreviews = images.map((img, index) => {
        let imageType = 'free';
        let price = 0;
        
        if (index >= freeLimit + bundleLimit) {
          imageType = 'per-image';
          price = perImagePrice;
        } else if (index >= freeLimit) {
          imageType = 'bundle';
          price = bundlePrice;
        }
        
        return {
          preview: img.base64 || img.preview,
          name: img.name || `Image ${index + 1}`,
          imageType,
          price,
          index
        };
      });
      setImagePreviews(restoredPreviews);
    } else {
      setImagePreviews([]);
    }
  }, [images, freeLimit, bundleLimit, bundlePrice, perImagePrice]);

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 🔥 Calculate additional cost for new images (TIERED)
  const calculateAdditionalCost = (currentCount, newCount) => {
    const totalAfter = currentCount + newCount;
    
    // Calculate current cost
    let currentCost = 0;
    if (currentCount > freeLimit + bundleLimit) {
      currentCost = bundlePrice + ((currentCount - freeLimit - bundleLimit) * perImagePrice);
    } else if (currentCount > freeLimit) {
      currentCost = bundlePrice;
    }
    
    // Calculate new cost
    let newCost = 0;
    if (totalAfter > freeLimit + bundleLimit) {
      newCost = bundlePrice + ((totalAfter - freeLimit - bundleLimit) * perImagePrice);
    } else if (totalAfter > freeLimit) {
      newCost = bundlePrice;
    }
    
    return {
      additionalCost: newCost - currentCost,
      totalCost: newCost,
      totalAfter
    };
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > maxImages) {
      alert(`You can upload maximum ${maxImages} images`);
      return;
    }

    // Calculate additional cost
    const { additionalCost, totalCost, totalAfter } = calculateAdditionalCost(images.length, files.length);
    
    if (additionalCost > 0) {
      let message = `You are uploading ${files.length} additional image(s).\n\n`;
      
      // Build breakdown message
      if (totalAfter > freeLimit + bundleLimit) {
        const freeImages = Math.min(freeLimit, totalAfter);
        const bundleImages = Math.min(bundleLimit, Math.max(0, totalAfter - freeLimit));
        const perImageImages = Math.max(0, totalAfter - freeLimit - bundleLimit);
        
        message += `Pricing breakdown:\n`;
        message += `• Free images: ${freeImages}\n`;
        if (bundleImages > 0) {
          message += `• Bundle (${bundleImages} images): ${currencySymbol}${bundlePrice}\n`;
        }
        if (perImageImages > 0) {
          message += `• Per-image (${perImageImages} images): ${currencySymbol}${perImagePrice} × ${perImageImages} = ${currencySymbol}${perImageImages * perImagePrice}\n`;
        }
        message += `\nTotal cost: ${currencySymbol}${totalCost}\n`;
      } else if (totalAfter > freeLimit) {
        const bundleImages = totalAfter - freeLimit;
        message += `Bundle pricing: ${currencySymbol}${bundlePrice} for up to ${bundleLimit} images\n`;
        message += `(You'll use ${bundleImages} of ${bundleLimit} bundle images)\n`;
      }
      
      message += `\nAdditional cost: ${currencySymbol}${additionalCost}\n\n`;
      message += `Do you want to continue?`;
      
      const confirmed = window.confirm(message);
      if (!confirmed) return;
    }

    try {
      const newImagesPromises = files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          base64: base64,
          preview: base64
        };
      });

      const newImages = await Promise.all(newImagesPromises);
      const allImages = [...images, ...newImages];
      
      onChange(allImages);
    } catch (error) {
      console.error('Error converting images:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  if (!showImageUpload) {
    return (
      <div className="w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">Image Upload Not Available</h4>
              <p className="text-sm text-blue-700 mt-1">
                Image upload is not available for {adType} listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Images * ({images.length}/{maxImages})
        </label>
        {totalImageCost > 0 && (
          <span className="text-sm font-semibold text-orange-600">
            Total: {currencySymbol}{totalImageCost}
          </span>
        )}
      </div>

      {/* 🔥 Tiered Pricing Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-900">Tiered Image Pricing</p>
            <div className="text-xs text-blue-700 mt-1 space-y-0.5">
              <p>• First {freeLimit} images: <span className="font-semibold text-green-600">FREE</span></p>
              <p>• Next {bundleLimit} images: <span className="font-semibold text-purple-600">{currencySymbol}{bundlePrice} (Bundle)</span></p>
              <p>• Additional images: <span className="font-semibold text-orange-600">{currencySymbol}{perImagePrice} each</span></p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side - Upload Area */}
        <div className="order-2 md:order-1">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors h-full min-h-[250px] flex items-center justify-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={images.length >= maxImages}
            />
            <label 
              htmlFor="image-upload" 
              className={`cursor-pointer w-full ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center">
                <svg 
                  className="w-12 h-12 text-gray-400 mb-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <p className="text-base text-gray-600 font-medium mb-1">
                  Click to upload images
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, JPEG up to 5MB
                </p>
                {images.length >= maxImages && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Maximum images reached
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Right Side - Image Previews */}
        <div className="order-1 md:order-2">
          <div className="border border-gray-300 rounded-lg p-4 min-h-[250px] bg-gray-50">
            {imagePreviews.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[218px]">
                <div className="text-center text-gray-400">
                  <svg 
                    className="w-16 h-16 mx-auto mb-2 opacity-30" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p className="text-sm">No images uploaded</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      preview.imageType === 'free' ? 'border-green-400' : 
                      preview.imageType === 'bundle' ? 'border-purple-400' : 
                      'border-orange-400'
                    }`}>
                      <img
                        src={preview.preview}
                        alt={preview.name || `Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 🔥 Tiered Badge */}
                    <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded font-semibold ${
                      preview.imageType === 'free' ? 'bg-green-500 text-white' : 
                      preview.imageType === 'bundle' ? 'bg-purple-500 text-white' : 
                      'bg-orange-500 text-white'
                    }`}>
                      {preview.imageType === 'free' ? 'FREE' : 
                       preview.imageType === 'bundle' ? 'BUNDLE' : 
                       `${currencySymbol}${perImagePrice}`}
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      ×
                    </button>
                    
                    {/* Image Number */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}/{imagePreviews.length}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 Detailed Cost Summary */}
      {images.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Free images:
              </span>
              <span className="text-green-600 font-bold">
                {costBreakdown.freeImages} × FREE
              </span>
            </div>
            
            {costBreakdown.bundleImages > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  Bundle images:
                </span>
                <span className="text-purple-600 font-bold">
                  {costBreakdown.bundleImages} = {currencySymbol}{costBreakdown.bundleCost}
                </span>
              </div>
            )}
            
            {costBreakdown.perImageImages > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  Per-image pricing:
                </span>
                <span className="text-orange-600 font-bold">
                  {costBreakdown.perImageImages} × {currencySymbol}{perImagePrice} = {currencySymbol}{costBreakdown.perImageCost}
                </span>
              </div>
            )}
            
            {totalImageCost > 0 && (
              <>
                <div className="border-t border-gray-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    Total Image Cost:
                  </span>
                  <span className="font-bold text-blue-900 text-lg">
                    {currencySymbol}{totalImageCost}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;