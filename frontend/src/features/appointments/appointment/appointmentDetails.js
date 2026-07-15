import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api.js";

export const getAppointmentDetails = createAsyncThunk('appointments/appointment', async (appointmentId, thunkApi) => {
    try {
        console.log("sending appointment id: ", appointmentId)
        const result = await api.get(`appointments/${appointmentId}`);
        console.log("result: ", result.data)
        return result.data;
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data || error.message)
    }
})

const appointmentSlice = createSlice({
    name: 'appointment',
    initialState: {
        data: null,
        loading: false,
        message: null,
        error: null
    },
    reducers: {
        clearAppointmentDetails: (state) => {
            state.data = null;
            state.loading = false;
            state.message = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getAppointmentDetails.pending, (state) => {
            state.loading = true;
            state.message = null;
            state.error = null;
        });
        builder.addCase(getAppointmentDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload?.data;
            state.message = action.payload?.message;
        });
        builder.addCase(getAppointmentDetails.rejected, (state, action)=> {
            state.error = action.payload?.message || action.payload;
            state.loading = false;
        });
    }
});

export const { clearAppointmentDetails } = appointmentSlice.actions;
export default appointmentSlice.reducer;