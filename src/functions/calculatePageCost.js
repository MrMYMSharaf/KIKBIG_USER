/**
 * Calculate total page creation cost with country-based pricing
 * Supports dynamic pricing from backend
 * 
 * FIXED: Basic plan is a ONE-TIME flat fee, not per-image!
 * FIXED: Handles both country codes (US, AU) and currency codes (USD, AUD)
 */

// ✅ FIXED: Helper function to get price for country from pricing map
// Now handles both country codes AND currency codes from backend
const getPriceForCountry = (prices, countryCode) => {
  if (!prices) return { price: 0, gateway: 'stripe' };
  const key = countryCode || 'US';
  
  // ✅ Map country codes to currency codes for backend compatibility
  const currencyCodeMap = {
    'US': 'USD',
    'LK': 'LK',     // Sri Lanka uses LK for both
    'AU': 'AUD',
    'IN': 'INR',
    'AE': 'AED',
    'GB': 'GBP',
    'EU': 'EUR',
    'CA': 'CAD',
    'JP': 'JPY',
    'CN': 'CNY',
    'NZ': 'NZD',
    'SG': 'SGD',
    'MY': 'MYR',
    'TH': 'THB',
    'ID': 'IDR',
    'PH': 'PHP',
    'VN': 'VND',
    'BD': 'BDT',
    'PK': 'PKR',
    'SA': 'SAR',
    'EG': 'EGP',
    'ZA': 'ZAR',
    'NG': 'NGN',
    'KE': 'KES',
    'BR': 'BRL',
    'MX': 'MXN',
    'AR': 'ARS',
    'CL': 'CLP',
    'CO': 'COP'
  };
  
  const currencyCode = currencyCodeMap[key] || key;
  
  // Try in order: country code -> currency code -> LK -> US -> USD -> first available
  return prices[key] || prices[currencyCode] || prices['LK'] || prices['US'] || prices['USD'] || Object.values(prices)[0] || { price: 0, gateway: 'stripe' };
};


/**
 * Calculate total page cost including page type and images
 * @param {Object} params - Cost calculation parameters
 * @param {Object} params.pageType - Selected page type with prices
 * @param {number} params.imageCount - Number of images to upload
 * @param {Array} params.imagePricingPlans - Array of image pricing plans from backend
 * @param {Object} params.currencyConfig - Currency configuration with symbol and code
 * @returns {Object} Cost breakdown with totals
 */
export const calculateTotalPageCost = ({
  pageType,
  imageCount = 0,
  imagePricingPlans = [],
  currencyConfig = { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'US' }
}) => {
  // Extract country code from currencyConfig
  const country = currencyConfig.countryCode || 'US';
  
  // Get page type price for user's country
  const pageTypePriceInfo = getPriceForCountry(pageType?.prices, country);
  const pageTypeCost = pageTypePriceInfo?.price || 0;
  
  // Calculate image costs using backend pricing plans
  let imageCost = 0;
  let imageBreakdown = [];
  
  if (imageCount > 0 && imagePricingPlans.length > 0) {
    // ✅ Find pricing plans from backend (case-insensitive)
    const freePlan = imagePricingPlans.find(p => 
      p.name.toLowerCase() === 'free'
    );
    const basicPlan = imagePricingPlans.find(p => 
      p.name.toLowerCase() === 'basic'
    );
    const proPlan = imagePricingPlans.find(p => 
      p.name.toLowerCase() === 'pro'
    );
    
    if (!basicPlan || !proPlan) {
      console.warn('Basic or Pro plan not found in backend data');
      return {
        currency: currencyConfig.code,
        currencySymbol: currencyConfig.symbol,
        currencyName: currencyConfig.name,
        country,
        pageType: {
          name: pageType?.name || 'Not selected',
          cost: pageTypeCost,
          validDays: pageType?.validdays || 0,
          gateway: pageTypePriceInfo?.gateway
        },
        images: {
          count: imageCount,
          cost: 0,
          breakdown: []
        },
        subtotal: pageTypeCost,
        taxRate: 0,
        taxAmount: 0,
        total: pageTypeCost,
        isFree: pageTypeCost === 0,
        requiresPayment: pageTypeCost > 0,
        primaryGateway: pageTypePriceInfo?.gateway,
        metadata: {
          imageCount,
          countryCode: country
        }
      };
    }
    
    // ✅ Get limits from backend
    const freeImages = freePlan?.imageLimit || 2;  // First 2 images free
    const basicLimit = basicPlan?.imageLimit || 5; // Up to 5 images with basic
    
    // ✅ Get country-specific prices from backend
    const basicPriceInfo = getPriceForCountry(basicPlan.prices, country);
    const proPriceInfo = getPriceForCountry(proPlan.prices, country);
    
    const basicPrice = basicPriceInfo.price;  // ✅ ONE-TIME flat fee (e.g., $10)
    const proPrice = proPriceInfo.price;      // ✅ Per-image cost (e.g., $2/image)
    
    
    // ✅ FIXED CALCULATION LOGIC
    if (imageCount <= freeImages) {
      // Scenario 1: All images are free (0-2 images)
      imageCost = 0;
      imageBreakdown.push({
        range: `1-${imageCount}`,
        quantity: imageCount,
        description: `Free images (${imageCount} of ${freeImages} free)`,
        cost: 0
      });
    } else if (imageCount <= basicLimit) {
      // Scenario 2: Within basic plan limit (3-5 images)
      // ✅ Basic plan is a ONE-TIME flat fee, NOT per image!
      imageCost = basicPrice;
      
      imageBreakdown.push({
        range: `1-${freeImages}`,
        quantity: freeImages,
        description: 'Free images',
        cost: 0
      });
      imageBreakdown.push({
        range: `${freeImages + 1}-${imageCount}`,
        quantity: imageCount - freeImages,
        description: `Basic plan (flat fee for up to ${basicLimit} images)`,
        cost: basicPrice,
        gateway: basicPriceInfo.gateway
      });
    } else {
      // Scenario 3: Exceeds basic limit (6+ images)
      // Basic plan flat fee + Pro pricing for extras
      const proImages = imageCount - basicLimit;
      const proCost = proImages * proPrice;
      imageCost = basicPrice + proCost;
      
      imageBreakdown.push({
        range: `1-${freeImages}`,
        quantity: freeImages,
        description: 'Free images',
        cost: 0
      });
      imageBreakdown.push({
        range: `${freeImages + 1}-${basicLimit}`,
        quantity: basicLimit - freeImages,
        description: `Basic plan (flat fee for images ${freeImages + 1}-${basicLimit})`,
        cost: basicPrice,
        gateway: basicPriceInfo.gateway
      });
      imageBreakdown.push({
        range: `${basicLimit + 1}-${imageCount}`,
        quantity: proImages,
        description: `Pro plan (${proImages} images × ${currencyConfig.symbol}${proPrice} each)`,
        cost: proCost,
        perImageCost: proPrice,
        gateway: proPriceInfo.gateway
      });
    }
  }
  
  // Calculate totals
  const subtotal = pageTypeCost + imageCost;
  const taxRate = 0; // No tax for now, can be configured per country
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  // Determine primary payment gateway
  let primaryGateway = pageTypePriceInfo?.gateway || 'stripe';
  if (total === 0) {
    primaryGateway = null; // No payment needed
  }  
  
  return {
    // Currency info
    currency: currencyConfig.code,
    currencySymbol: currencyConfig.symbol,
    currencyName: currencyConfig.name,
    country,
    
    // Page type costs
    pageType: {
      name: pageType?.name || 'Not selected',
      cost: pageTypeCost,
      validDays: pageType?.validdays || 0,
      gateway: pageTypePriceInfo?.gateway
    },
    
    // Image costs
    images: {
      count: imageCount,
      cost: imageCost,
      breakdown: imageBreakdown
    },
    
    // Totals
    subtotal,
    taxRate,
    taxAmount,
    total,
    
    // Payment info
    isFree: total === 0,
    requiresPayment: total > 0,
    primaryGateway,
    
    // Metadata
    metadata: {
      imageCount,
      countryCode: country
    }
  };
};

/**
 * Validate if user can create page based on pricing
 * @param {Object} costData - Cost calculation result
 * @param {Object} userBalance - User's current balance (optional)
 * @returns {Object} Validation result
 */
export const validatePageCreation = (costData, userBalance = null) => {
  // Free pages are always valid
  if (costData.isFree) {
    return {
      valid: true,
      message: 'Page can be created for free',
      requiresPayment: false
    };
  }
  
  // Check if payment is required
  if (costData.requiresPayment) {
    // If user balance is provided, check if sufficient
    if (userBalance !== null) {
      if (userBalance >= costData.total) {
        return {
          valid: true,
          message: 'Sufficient balance available',
          requiresPayment: false,
          useBalance: true
        };
      } else {
        return {
          valid: true,
          message: 'Payment required',
          requiresPayment: true,
          amountRequired: costData.total - userBalance
        };
      }
    }
    
    // No balance info, payment required
    return {
      valid: true,
      message: 'Payment required',
      requiresPayment: true,
      amountRequired: costData.total
    };
  }
  
  return {
    valid: true,
    message: 'Page can be created',
    requiresPayment: false
  };
};

/**
 * Format price for display
 * @param {number} price - Price amount
 * @param {Object} currencyConfig - Currency configuration
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currencyConfig) => {
  return `${currencyConfig.symbol}${price.toFixed(2)} ${currencyConfig.code}`;
};

/**
 * Get currency config by country code
 * @param {string} countryCode - Country code (LK, AU, etc.)
 * @returns {Object} Currency configuration
 */
export const getCurrencyByCountry = (countryCode) => {
  const CURRENCY_CONFIG = {
    LK: { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', countryCode: 'LK' },
    AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', countryCode: 'AU' },
    US: { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'US' },
    DEFAULT: { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'US' }
  };
  
  return CURRENCY_CONFIG[countryCode] || CURRENCY_CONFIG.DEFAULT;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currencySymbol - Currency symbol (e.g., '$', 'Rs.')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencySymbol = '$', decimals = 2) => {
  return `${currencySymbol}${amount.toFixed(decimals)}`;
};

// Export everything
export default {
  calculateTotalPageCost,
  validatePageCreation,
  formatPrice,
  formatCurrency,
  getCurrencyByCountry,
  getPriceForCountry
};

