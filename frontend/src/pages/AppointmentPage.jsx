import { Bell, CalendarDays, CircleCheckBig, Clock4, X } from 'lucide-react'
import React from 'react'
import "./styles/Appointments.css"

const AppointmentPage = () => {
  return (
    <div className="container">
        <div className="container-detail">
            <h2>Appointments</h2>
            <Bell />
        </div>
        <div className="kpi">
            <span>Overview</span>
            <div className="kpi-box">   
                <div className="kpi-box-card"> 
                    <div className="kpi-icon"><CalendarDays /></div>
                    <div className="kpi-content">
                        Total 
                        48
                    </div>
                </div>
                <div className="kpi-box-card"> 
                    <div className="kpi-icon"><CircleCheckBig /></div>
                    <div className="kpi-content">
                        Completed
                        18
                    </div>
                </div>
                <div className="kpi-box-card"> 
                    <div className="kpi-icon"><Clock4 /></div>
                    <div className="kpi-content">
                        Upcomming
                        21
                    </div>
                </div>
                <div className="kpi-box-card"> 
                    <div className="kpi-icon"><X /></div>
                    <div className="kpi-content">
                        Cancelled
                        4
                    </div>
                </div>
            </div>
        </div>
        <div className="appointments">

        </div>
    </div>
  )
}

export default AppointmentPage