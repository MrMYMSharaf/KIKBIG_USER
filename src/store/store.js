// store.js - Updated configuration
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import your API slices and reducers
import { authApi } from "../features/authSlice";
import { languageApi } from "../features/languageSlice";
import { categoryApi } from "../features/categorySlice";
import { locationApi } from "../features/locationSlice";
import { adtypeApi} from "../features/adtypeSlice";
import { usertypeApi } from "../features/UserTypesSlice";
import { paymentApi } from "../features/paymentApiSlice";
import {postadvertisementApi} from "../features/postadsSlice"
import {chatApi} from "../features/chatSlice";
import {groupApi} from "../features/groupSlice";

import authReducer from "../features/redux/authSlice";
import adPostReducer from "../features/redux/adPostSlice";

// Persist configuration for adPost - Now images are base64 strings, so they can be persisted
const adPostPersistConfig = {
  key: 'adPost',
  storage,
  whitelist: ['formData', 'step', 'adType'], // Persist all needed fields
};

const persistedAdPostReducer = persistReducer(adPostPersistConfig, adPostReducer);

// Persist configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token']
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [languageApi.reducerPath]: languageApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [adtypeApi.reducerPath]: adtypeApi.reducer,
    [usertypeApi.reducerPath]: usertypeApi.reducer,
    [postadvertisementApi.reducerPath]:postadvertisementApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [groupApi.reducerPath]: groupApi.reducer,
    auth: persistedAuthReducer,
    adPost: persistedAdPostReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        // No need to ignore image paths anymore since they're now base64 strings
      },
    })
      .concat(authApi.middleware)
      .concat(languageApi.middleware)
      .concat(categoryApi.middleware)
      .concat(locationApi.middleware)
      .concat(adtypeApi.middleware)
      .concat(usertypeApi.middleware)
      .concat(postadvertisementApi.middleware)
      .concat(paymentApi.middleware)
      .concat(chatApi.middleware)
      .concat(groupApi.middleware),
});

export const persistor = persistStore(store);