import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice.js"
import kpiReducer from "../features/appointments/kpiSlice.js"
import appointmentReducer from "../features/appointments/appointmentsSlice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        kpi: kpiReducer,
        appointment: appointmentReducer
    },
})