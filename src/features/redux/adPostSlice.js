import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: "choose",
  adType: "",
  uploadedAdId: null,
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
    typeofads: "", // user chooses
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

    resetAdPost: () => initialState,
  },
});

export const {
  setStep,
  setAdType,
  setUploadedAdId,
  updateFormData,
  updateSpecialQuestions,
  updateContact,
  setTypeOfAds,
  updatePricing,
  setExtraImagesCount,
  resetAdPost,
} = adPostSlice.actions;

export default adPostSlice.reducer;
