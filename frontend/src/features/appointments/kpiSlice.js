import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const getKPI = createAsyncThunk('kpi',async (_, thunkAPI) => {
    try {
        const result = await api.get('appointments/kpi');

        return result.data;
    } catch (error) {
        return new thunkAPI.rejectWithValue(error.payload.message)
    }
})

const kpiSlice = createSlice({
    name: 'kpi',
    initialState: {
        items: null,
        loading: false,
        message: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getKPI.pending, (state) => {
            state.loading = true;
            state.message = null;
        }),
        builder.addCase(getKPI.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload?.data[0];
            state.message = action.payload?.message
        }),
        builder.addCase(getKPI.rejected, (state, action)=> {
            state.error = action.payload?.message || action.payload
            state.loading = false
        })
    }
})

export default kpiSlice.reducer