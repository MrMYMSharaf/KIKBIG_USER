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
    setStep: (state, action) => {
      state.step = action.payload;
    },

    nextStep: (state) => {
      state.step += 1;
    },

    prevStep: (state) => {
      state.step -= 1;
    },

    setPageType: (state, action) => {
      state.pageType = action.payload;
      state.formData.pagetype = action.payload._id;
    },

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

    setErrors: (state, action) => {
      state.errors = action.payload;
    },

    clearErrors: (state) => {
      state.errors = {};
    },

    resetPageCreate: (state) => {
      return initialState;
    },

    // Add tag
    addTag: (state, action) => {
      if (!state.formData.tags.includes(action.payload)) {
        state.formData.tags.push(action.payload);
      }
    },

    // Remove tag
    removeTag: (state, action) => {
      state.formData.tags = state.formData.tags.filter(
        (tag) => tag !== action.payload
      );
    },

    // Add image
    addImage: (state, action) => {
      state.formData.images.push(action.payload);
    },

    // Remove image
    removeImage: (state, action) => {
      state.formData.images = state.formData.images.filter(
        (_, index) => index !== action.payload
      );
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
  setErrors,
  clearErrors,
  resetPageCreate,
  addTag,
  removeTag,
  addImage,
  removeImage,
} = pageCreateSlice.actions;

export default pageCreateSlice.reducer;