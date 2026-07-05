import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

export const loginAuth = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        
        const response = await api.post('auth/login', userData)
        console.log(response.headers)


        return response.data
    }
    catch (error) {
        // returning error response from backend
        return thunkAPI.rejectWithValue(error )
    }
})

export const registerAuth = createAsyncThunk('auth/doctor/register', async (userData, thunkAPI) => {
    try {
        const response = await api.post('auth/doctor/register', userData)
        console.log(response)
        return response.data
    }
    catch (error) {
        console.log(error)
        return thunkAPI.rejectWithValue(error.payload.message )
    }
})

export const refreshAuth = createAsyncThunk(
    "auth/refresh",
    async (_, thunkAPI) => {
        try {
            const response = await api.post('auth/refresh-token');
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || { message: "Session expired" }
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        message: null,
        loading: false,
        token: null,
        error: null
    },
    reducers: {
        setCredentials: (state, action) => {
            const {user, accessToken} = action.payload;
            state.user = user;
            state.token = accessToken
        },
        logOut: (state) => {
            state.user = null;
            state.message = null;
            state.loading = false;
            state.token = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginAuth.pending, (state) => {
            state.message = null
            state.error = null
            state.loading = true
        })
        builder.addCase(loginAuth.fulfilled, (state, action) => {
            console.log(action.payload)
            console.log("login fulfilled")
            state.user = action.payload.data.user
            state.token = action.payload.data.accessToken
            state.message = action.payload.message
            state.loading = false
            console.log(state.message)
        })
        builder.addCase(loginAuth.rejected, (state, action) => {
            state.error = action.payload?.message || action.payload
            state.loading = false
        })
        builder.addCase(registerAuth.pending, (state) => {
            state.message = null
            state.error = null
            state.loading = true
        })
        builder.addCase(registerAuth.fulfilled, (state, action) => {
            console.log(action.payload)
            console.log("register fulfilled")
            state.user = action.payload.data.doctor || action.payload.data.patient
            state.token = action.payload.data.accessToken
            state.message = action.payload.message
            state.loading = false
            console.log(state.user)
        })
        builder.addCase(registerAuth.rejected, (state, action) => {
            state.error = action.payload?.message || action.payload
            state.loading = false
        })
        builder.addCase(refreshAuth.fulfilled, (state, action) => {
            state.token = action.payload.data.accessToken
        })
    }
})

export default authSlice.reducer

export const { setCredentials, logOut} = authSlice.actions
