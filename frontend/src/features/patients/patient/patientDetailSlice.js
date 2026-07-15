import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api.js";

export const getPatientDetails = createAsyncThunk('patients/patient', async (patientId, thunkApi) => {
    try {
        const result = await api.get(`patients/${patientId}`);
        return result.data;
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data || error.message)
    }
})

const patientDetailSlice = createSlice({
    name: 'patient',
    initialState: {
        data: null,
        loading: false,
        message: null,
        error: null
    },
    reducers: {
        clearPatientDetails: (state) => {
            state.data = null;
            state.loading = false;
            state.message = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getPatientDetails.pending, (state) => {
            state.loading = true;
            state.message = null;
            state.error = null;
        });
        builder.addCase(getPatientDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload?.data;
            state.message = action.payload?.message;
        });
        builder.addCase(getPatientDetails.rejected, (state, action)=> {
            state.error = action.payload?.message || action.payload;
            state.loading = false;
        });
    }
});

export const { clearPatientDetails } = patientDetailSlice.actions;
export default patientDetailSlice.reducer;