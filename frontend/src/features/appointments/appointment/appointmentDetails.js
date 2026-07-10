import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api.js";

export const getAppointmentDetails = createAsyncThunk('appointments/appointment', async (appointmentId, thunkApi) => {
    try {
        const result = await api.get(`appointments/${appointmentId}`);
        return result.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

const appointmentSlice = createSlice({
    name: 'appointment',
    initialState: {
        items: [],
        loading: false,
        message: null

    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAppointmentDetails.pending, (state) => {
            state.loading = true;
            state.message = null;
        }),
        builder.addCase(getAppointmentDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload?.data;
            state.message = action.payload?.message
        }),
        builder.addCase(getAppointmentDetails.rejected, (state, action)=> {
            state.error = action.payload?.message || action.payload
            state.loading = false
        })
    }
});

export default appointmentSlice.reducer