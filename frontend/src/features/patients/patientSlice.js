import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const getPatients = createAsyncThunk("patients", async (pageData, thunkAPI) => {
  try {
    const result = await api.get(`patients?page=${pageData?.page || 1}&limit=${pageData?.limit || 10}`);
    return result.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const patientSlice = createSlice({
  name: "patients",
  initialState: {
    items: [],
    loading: false,
    message: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPatients.pending, (state) => {
      state.loading = true;
      state.message = null;
      state.error = null;
    });
    builder.addCase(getPatients.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.data || [];
      state.message = action.payload?.message || null;
    });
    builder.addCase(getPatients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || action.payload || "Failed to fetch patients";
    });
  },
});

export default patientSlice.reducer;
