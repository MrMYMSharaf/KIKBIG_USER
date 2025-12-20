// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// API slices
import { authApi } from "../features/authSlice";
import { languageApi } from "../features/languageSlice";
import { categoryApi } from "../features/categorySlice";
import { locationApi } from "../features/locationSlice";
import { adtypeApi } from "../features/adtypeSlice";
import { usertypeApi } from "../features/UserTypesSlice";
import { paymentApi } from "../features/paymentApiSlice";
import { postadvertisementApi } from "../features/postadsSlice";
import { chatApi } from "../features/chatSlice";
import { groupApi } from "../features/groupSlice";
import { awsVerificationApi } from "../features/AwsVerficationapislice";
import { aiVerificationApi } from "../features/aiverificationoutputSlice";
import {pagetypeApi} from "../features/pagetypeApi";
import {pageApiSlice} from "../features/pageApiSlice";

// Reducers
import authReducer from "../features/redux/authSlice";
import adPostReducer from "../features/redux/adPostSlice";
import countryReducer from "../features/redux/countrySlice";
import pageCreateReducer from "../features/redux/pagecreationSlice";

// ---------------- Persist Configs ---------------- //
// ✅ Auth persist - ONLY persist user and isAuthenticated (NO TOKEN!)
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"], // ❌ Don't persist token (it's in cookie)
};
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// AdPost persist
const adPostPersistConfig = {
  key: "adPost",
  storage,
  whitelist: ["formData", "step", "adType"],
};
const persistedAdPostReducer = persistReducer(adPostPersistConfig, adPostReducer);

// Country persist
const countryPersistConfig = {
  key: "country",
  storage,
  whitelist: ["country"],
};
const persistedCountryReducer = persistReducer(countryPersistConfig, countryReducer);

// PageCreate persist
const pageCreatePersistConfig = {
  key: "pageCreate",
  storage,
  whitelist: ["formData", "step", "pageType"],
};
const persistedPageCreateReducer = persistReducer(pageCreatePersistConfig, pageCreateReducer);


// ---------------- Store ---------------- //
export const store = configureStore({
  reducer: {
    // API slices
    [authApi.reducerPath]: authApi.reducer,
    [languageApi.reducerPath]: languageApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [adtypeApi.reducerPath]: adtypeApi.reducer,
    [usertypeApi.reducerPath]: usertypeApi.reducer,
    [postadvertisementApi.reducerPath]: postadvertisementApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [groupApi.reducerPath]: groupApi.reducer,
    [awsVerificationApi.reducerPath]: awsVerificationApi.reducer,
    [aiVerificationApi.reducerPath]: aiVerificationApi.reducer,
    [pagetypeApi.reducerPath]: pagetypeApi.reducer,
    [pageApiSlice.reducerPath]: pageApiSlice.reducer,

    // Persisted reducers
    auth: persistedAuthReducer,
    adPost: persistedAdPostReducer,
    country: persistedCountryReducer,
    pageCreate: persistedPageCreateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }).concat(
      authApi.middleware,
      languageApi.middleware,
      categoryApi.middleware,
      locationApi.middleware,
      adtypeApi.middleware,
      usertypeApi.middleware,
      postadvertisementApi.middleware,
      paymentApi.middleware,
      chatApi.middleware,
      groupApi.middleware,
      awsVerificationApi.middleware,
      aiVerificationApi.middleware,
      pagetypeApi.middleware,
      pageApiSlice.middleware
    ),
});

// ---------------- Persistor ---------------- //
export const persistor = persistStore(store);