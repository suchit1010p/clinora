import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const getPatientKpi = createAsyncThunk("patientKpi", async (_, thunkAPI) => {
  try {
    const result = await api.get("patients/kpi");
    return result.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const patientKpiSlice = createSlice({
  name: "patientKpi",
  initialState: {
    items: null,
    loading: false,
    message: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPatientKpi.pending, (state) => {
      state.loading = true;
      state.message = null;
      state.error = null;
    });
    builder.addCase(getPatientKpi.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.data || null;
      state.message = action.payload?.message || null;
    });
    builder.addCase(getPatientKpi.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || action.payload || "Failed to fetch patient KPI";
    });
  },
});

export default patientKpiSlice.reducer;
