import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice.js"
import kpiReducer from "../features/appointments/kpiSlice.js"
import appointmentReducer from "../features/appointments/appointmentsSlice.js"
import patientsReducer from "../features/patients/patientSlice.js"
import patientKpiReducer from "../features/patients/patientKpiSlice.js"
import patientDetailsReducer from "../features/patients/patient/patientDetailSlice.js"
import appointmentDetailsReducer from "../features/appointments/appointment/appointmentDetails.js"


export const store = configureStore({
    reducer: {
        auth: authReducer,
        kpi: kpiReducer,
        appointments: appointmentReducer,
        patients: patientsReducer,
        patientKpi: patientKpiReducer,
        patient: patientDetailsReducer,
        appointment: appointmentDetailsReducer
    },
})