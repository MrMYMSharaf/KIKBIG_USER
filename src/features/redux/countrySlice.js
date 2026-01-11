import { createSlice } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

const initialState = { country: null };

const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {
    setCountry: (state, action) => {
      state.country = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      // Only update if we have valid persisted data
      if (action.payload && action.payload.country && action.payload.country.country) {
        state.country = action.payload.country.country;
      }
      // Otherwise keep the current state (which defaults to "sri-lanka")
    });
  },
});

export const { setCountry } = countrySlice.actions;
export default countrySlice.reducer;

