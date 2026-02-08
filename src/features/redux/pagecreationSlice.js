import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: 1,
  pageType: null,
  formData: {
    // Basic Info
    title: "",
    description: "",
    category: "",
    childCategory: "",
    language: "",
    tags: [],
    accountType: "page",

    // Location
    location: {
      country: "",
      region: "",
      state: "",
      province: "",
      district: "",
      county: "",
      sub_district: "",
      local_admin: "",
      municipality: "",
      town: "",
      village: "",
    },

    // Images
    cover_image: null,
    logo_image: null,
    images: [],
    imagePrices: null, // <-- added image price field

    // Contact Info
    contact: {
      phone: "",
      whatsapp: "",
      email: "",
      telegram: "",
    },

    // Social Media
    social: {
      facebook: "",
      instagram: "",
      youtube: "",
      twitter: "",
      website: "",
    },

    // Page Type
    pagetype: "",
  },
  errors: {},
};

const pageCreateSlice = createSlice({
  name: "pageCreate",
  initialState,
  reducers: {
    // Steps
    setStep: (state, action) => {
      state.step = action.payload;
    },
    nextStep: (state) => {
      state.step += 1;
    },
    prevStep: (state) => {
      state.step -= 1;
    },

    // Page Type
    setPageType: (state, action) => {
      state.pageType = action.payload;
      state.formData.pagetype = action.payload._id;
    },

    // General form updates
    updateFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },

    updateNestedFormData: (state, action) => {
      const { field, data } = action.payload;
      state.formData[field] = {
        ...state.formData[field],
        ...data,
      };
    },

    // Field-level updates
    setField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },

    // Images
    setCoverImage: (state, action) => {
      state.formData.cover_image = action.payload;
    },
    setLogoImage: (state, action) => {
      state.formData.logo_image = action.payload;
    },
    addImage: (state, action) => {
      state.formData.images.push(action.payload);
    },
    removeImage: (state, action) => {
      state.formData.images = state.formData.images.filter(
        (_, index) => index !== action.payload
      );
    },
    resetImages: (state) => {
      state.formData.cover_image = null;
      state.formData.logo_image = null;
      state.formData.images = [];
    },

    // Image Prices
    setImagePrice: (state, action) => {
      state.formData.imagePrices = action.payload; // expects ID
    },
    clearImagePrice: (state) => {
      state.formData.imagePrices = null;
    },

    // Tags
    addTag: (state, action) => {
      if (!state.formData.tags.includes(action.payload)) {
        state.formData.tags.push(action.payload);
      }
    },
    removeTag: (state, action) => {
      state.formData.tags = state.formData.tags.filter(
        (tag) => tag !== action.payload
      );
    },

    // Errors
    setErrors: (state, action) => {
      state.errors = action.payload;
    },
    clearErrors: (state) => {
      state.errors = {};
    },

    // Reset
    resetPageCreate: () => initialState,

    // Reset nested sections
    resetLocation: (state) => {
      state.formData.location = { ...initialState.formData.location };
    },
    resetContact: (state) => {
      state.formData.contact = { ...initialState.formData.contact };
    },
    resetSocial: (state) => {
      state.formData.social = { ...initialState.formData.social };
    },
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  setPageType,
  updateFormData,
  updateNestedFormData,
  setField,
  setCoverImage,
  setLogoImage,
  addImage,
  removeImage,
  resetImages,
  setImagePrice,
  clearImagePrice,
  addTag,
  removeTag,
  setErrors,
  clearErrors,
  resetPageCreate,
  resetLocation,
  resetContact,
  resetSocial,
} = pageCreateSlice.actions;

export default pageCreateSlice.reducer;
