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
    page: null, // 🔥 NEW: page ID when posting as page (extracted from selectedPage._id)
    specialQuestions: {},
    contact: {
      phone: "",
      whatsapp: "",
      email: "",
      telegram: "",
    },
  },

  // Pricing configuration
  pricing: {
    extraImagesCount: 0,
    pricePerExtraImage: 100,
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

    // Set account type (user or page)
    setAccountType: (state, action) => {
      state.accountType = action.payload;
      console.log("✅ Account type set to:", action.payload);
      
      // 🔥 NEW: If switching to 'user', clear page ID
      if (action.payload === 'user') {
        state.formData.page = null;
        console.log("🔥 Cleared page ID (posting as user)");
      }
    },

    // Set selected page
    setSelectedPage: (state, action) => {
      state.selectedPage = action.payload;
      console.log("✅ Selected page:", action.payload);
      
      // 🔥 NEW: Automatically set page ID in formData when page is selected
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

    updatePricing: (state, action) => {
      state.pricing = { ...state.pricing, ...action.payload };
    },

    setExtraImagesCount: (state, action) => {
      state.pricing.extraImagesCount = action.payload;
      state.pricing.extraImagesCost =
        action.payload * state.pricing.pricePerExtraImage;
    },

    // 🔥 NEW: Manually set page ID in formData (optional, if needed)
    setPageId: (state, action) => {
      state.formData.page = action.payload;
      console.log("🔥 Page ID manually set to:", action.payload);
    },

    resetAdPost: () => initialState,
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
  setPageId, // 🔥 NEW: Export setPageId action
  resetAdPost,
} = adPostSlice.actions;

export default adPostSlice.reducer;