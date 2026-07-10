import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api.js";

export const getPatientDetails = createAsyncThunk('patients/patient', async (patientId, thunkApi) => {
    try {
        const result = await api.get(`patients/${patientId}`);
        return result.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

const patientDetailSlice = createSlice({
    name: 'patient',
    initialState: {
        items: [],
        loading: false,
        message: null

    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getPatientDetails.pending, (state) => {
            state.loading = true;
            state.message = null;
        }),
        builder.addCase(getPatientDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload?.data;
            state.message = action.payload?.message
        }),
        builder.addCase(getPatientDetails.rejected, (state, action)=> {
            state.error = action.payload?.message || action.payload
            state.loading = false
        })
    }
});

export default patientDetailSlice.reducer