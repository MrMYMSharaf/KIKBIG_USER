import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // Array of cart items
  totalItems: 0,
};

const addToCartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add item to local cart (optimistic update)
    addItemToCart: (state, action) => {
      const { post_id, title, image, price, typeofads } = action.payload;
      
      // Check if item already exists
      const existingItem = state.items.find(item => item.post_id === post_id);
      
      if (!existingItem) {
        state.items.push({
          post_id,
          title,
          image,
          price,
          typeofads,
          addedAt: new Date().toISOString(),
        });
        state.totalItems = state.items.length;
      }
    },

    // Remove item from local cart
    removeItemFromCart: (state, action) => {
      const post_id = action.payload;
      state.items = state.items.filter(item => item.post_id !== post_id);
      state.totalItems = state.items.length;
    },

    // Clear entire cart
    clearCartItems: (state) => {
      state.items = [];
      state.totalItems = 0;
    },

    // Sync cart from API response
    syncCartFromAPI: (state, action) => {
      state.items = action.payload || [];
      state.totalItems = state.items.length;
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  clearCartItems,
  syncCartFromAPI,
} = addToCartSlice.actions;

export default addToCartSlice.reducer;