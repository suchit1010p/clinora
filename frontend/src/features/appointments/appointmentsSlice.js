import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// url: /appointments?page=1&limit=10
// get appointments in pagination by doctorId
export const getAppointments = createAsyncThunk('appointments',async (pageData, thunkAPI) => {
    try {
        const { page, limit, search, status, startDate, endDate } = pageData;
        let url = `appointments?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
        if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
        
        const result = await api.get(url);
        return result.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});


export const createAppointment = createAsyncThunk('appointments/create', async (appointmentData, thunkAPI) => {
    try {
        const result = await api.post('appointments/create', appointmentData);
        return result.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const updateStatus = createAsyncThunk('appointments/update', async (appointmentStatus, thunkAPI) => {
    try {
        const result = await api.patch('appointments/status', appointmentStatus)
        return result.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const deleteAppointment = createAsyncThunk('appointments/delete', async (appointmentId, thunkAPI) => {
    try {
        const result = await api.delete('appointments/delete', { data: { appointmentId } });
        return { appointmentId, ...result.data };
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

const appointmentsSlice = createSlice({
    name: 'appointments',
    initialState: {
        items: [],
        loading: false,
        message: null

    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAppointments.pending, (state) => {
            state.loading = true;
            state.message = null;
        }),
        builder.addCase(getAppointments.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload?.data;
            state.message = action.payload?.message
        }),
        builder.addCase(getAppointments.rejected, (state, action)=> {
            state.error = action.payload?.message || action.payload
            state.loading = false
        })
        builder.addCase(updateStatus.pending, (state) => {
            state.message = null
        })
        builder.addCase(updateStatus.fulfilled, (state, action) => {
            const changedId = action.payload?.data?.appointment?.id;
            const index = state.items.findIndex(item => item.id === changedId)
            if (index >= 0) {
                state.items[index].status = action.payload?.data?.appointment?.status;
            }
            state.message = action.payload?.message
        })
        builder.addCase(createAppointment.fulfilled, (state, action) => {
            const appointment = action.payload?.data?.appointment;
            if (appointment) {
                state.items.unshift(appointment);
            }
            state.message = action.payload?.message;
        })
        builder.addCase(deleteAppointment.pending, (state) => {
            state.message = null;
        })
        builder.addCase(deleteAppointment.fulfilled, (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload.appointmentId);
            state.message = action.payload?.message;
        })
        builder.addCase(deleteAppointment.rejected, (state, action) => {
            state.error = action.payload?.message || action.payload;
        })
    }
})

export default appointmentsSlice.reducer