import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: "choose",
  adType: "",
  formData: {
    userId: "",
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
    typeofads: "", // 🔥 FIXED: Don't set default value here - let user choose
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
    setUserId: (state, action) => {
      state.formData.userId = action.payload;
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
        ...action.payload
      };
    },
    // 🔥 FIXED: Ensure this reducer sets the exact value passed
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
    resetAdPost: () => initialState,
  },
});

export const {
  setStep,
  setAdType,
  setUserId,
  updateFormData,
  updateSpecialQuestions,
  updateContact,
  setTypeOfAds,
  updatePricing,
  setExtraImagesCount,
  resetAdPost,
} = adPostSlice.actions;

export default adPostSlice.reducer;