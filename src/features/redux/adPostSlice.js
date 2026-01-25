import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: "choose",
  adType: "",
  uploadedAdId: null,
  
  // Account/Page selection
  accountType: null, // 'user' or 'page'
  selectedPage: null, // page object when posting as page
  
  formData: {
    title: "",
    description: "",
    price: "",
    images: [],
    language: "",
    category: "",
    childCategory: "",
    country: "",
    region: "",
    state: "",
    province: "",
    district: "",
    county: "",
    subDistrict: "",
    localAdministrativeUnit: "",
    municipality: "",
    town: "",
    village: "",
    userType: "",
    typeofads: "", // user chooses: "Advertisement", "Needs", or "Offers"
    page: null,
    specialQuestions: {},
    contact: {
      phone: "",
      whatsapp: "",
      email: "",
      telegram: "",
    },
  },

  // 🔥 FIXED: Complete tiered pricing configuration
  pricing: {
    // Tiered pricing structure
    freeLimit: 2,              // Number of free images
    bundleLimit: 5,            // Number of images in bundle
    bundlePrice: 0,            // Price for the bundle
    perImagePrice: 0,          // Price per additional image
    
    // Cost calculations
    totalImageCost: 0,         // 🔥 ADDED: Total cost for images
    
    // Cost breakdown
    costBreakdown: {           // 🔥 ADDED: Detailed breakdown
      freeImages: 0,
      bundleImages: 0,
      bundleCost: 0,
      perImageImages: 0,
      perImageCost: 0,
    },
    
    // Currency
    currencySymbol: '$',
    
    // Legacy fields (kept for backward compatibility)
    extraImagesCount: 0,
    pricePerExtraImage: 0,
    extraImagesCost: 0,
    freeImagesLimit: 2,
    showImageUpload: true,
  },
};

const adPostSlice = createSlice({
  name: "adPost",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },

    setAdType: (state, action) => {
      state.adType = action.payload;
    },

    setUploadedAdId: (state, action) => {
      state.uploadedAdId = action.payload;
      console.log("✅ Uploaded Ad ID saved to Redux:", action.payload);
    },

    setAccountType: (state, action) => {
      state.accountType = action.payload;
      console.log("✅ Account type set to:", action.payload);
      
      if (action.payload === 'user') {
        state.formData.page = null;
        console.log("🔥 Cleared page ID (posting as user)");
      }
    },

    setSelectedPage: (state, action) => {
      state.selectedPage = action.payload;
      console.log("✅ Selected page:", action.payload);
      
      if (action.payload && action.payload._id) {
        state.formData.page = action.payload._id;
        console.log("🔥 Page ID set in formData:", action.payload._id);
      } else {
        state.formData.page = null;
        console.log("🔥 Page ID cleared from formData");
      }
    },

    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    updateSpecialQuestions: (state, action) => {
      state.formData.specialQuestions = {
        ...state.formData.specialQuestions,
        ...action.payload,
      };
    },

    updateContact: (state, action) => {
      state.formData.contact = {
        ...state.formData.contact,
        ...action.payload,
      };
    },

    setTypeOfAds: (state, action) => {
      console.log("🔥 setTypeOfAds called with:", action.payload);
      state.formData.typeofads = action.payload;
    },

    // 🔥 FIXED: Properly merge all pricing updates
    updatePricing: (state, action) => {
      console.log("💰 updatePricing called with:", action.payload);
      
      // Merge the new pricing data
      state.pricing = { 
        ...state.pricing, 
        ...action.payload 
      };
      
      // If costBreakdown is provided, merge it properly
      if (action.payload.costBreakdown) {
        state.pricing.costBreakdown = {
          ...state.pricing.costBreakdown,
          ...action.payload.costBreakdown
        };
      }
      
      console.log("💰 Updated pricing state:", state.pricing);
    },

    setExtraImagesCount: (state, action) => {
      state.pricing.extraImagesCount = action.payload;
      state.pricing.extraImagesCost =
        action.payload * state.pricing.pricePerExtraImage;
      console.log("📸 Extra images count:", action.payload);
      console.log("💰 Extra images cost:", state.pricing.extraImagesCost);
    },

    setPricePerExtraImage: (state, action) => {
      console.log("💰 setPricePerExtraImage called with:", action.payload);
      state.pricing.pricePerExtraImage = action.payload;
      state.pricing.extraImagesCost = 
        state.pricing.extraImagesCount * action.payload;
      console.log("💰 Price per extra image updated to:", action.payload);
      console.log("💰 Extra images cost recalculated:", state.pricing.extraImagesCost);
    },

    setCurrencySymbol: (state, action) => {
      console.log("💱 setCurrencySymbol called with:", action.payload);
      state.pricing.currencySymbol = action.payload;
    },

    setPageId: (state, action) => {
      state.formData.page = action.payload;
      console.log("🔥 Page ID manually set to:", action.payload);
    },

    resetAdPost: () => {
      console.log("🔄 Resetting ad post state to initial values");
      return initialState;
    },
  },
});

export const {
  setStep,
  setAdType,
  setUploadedAdId,
  setAccountType,
  setSelectedPage,
  updateFormData,
  updateSpecialQuestions,
  updateContact,
  setTypeOfAds,
  updatePricing,
  setExtraImagesCount,
  setPricePerExtraImage,
  setCurrencySymbol,
  setPageId,
  resetAdPost,
} = adPostSlice.actions;

export default adPostSlice.reducer;