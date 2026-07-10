import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Search, Plus, Eye, Pencil, Trash2, Users } from "lucide-react";
import { getPatients } from "../features/patients/patientSlice";
import { getPatientKpi } from "../features/patients/patientKpiSlice";
import "./styles/Patients.css";

const PatientsPage = () => {
  const dispatch = useDispatch();
  const { items: patients, loading: patientsLoading } = useSelector((state) => state.patients || {});
  const { items: patientKpi } = useSelector((state) => state.patientKpi || {});

  useEffect(() => {
    dispatch(getPatients({ page: 1, limit: 10 }));
    dispatch(getPatientKpi());
  }, [dispatch]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitial = (name = "") => name.charAt(0)?.toUpperCase() || "P";

  return (
    <div className="patients-page">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>View and manage all your patients.</p>
        </div>

        <div className="notification">
          <Bell size={20} />
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card">
          <div className="icon blue"><Users /></div>
          <div className="card-content">
            <span>Total Patients</span>
            <h2>{patientKpi?.total_patients ?? 0}</h2>
            <small>All time</small>
          </div>
        </div>

        <div className="card">
          <div className="icon green"><Plus /></div>
          <div className="card-content">
            <span>New This Month</span>
            <h2>{patientKpi?.new_this_month ?? 0}</h2>
            <small>This month</small>
          </div>
        </div>
      </div>

      <div className="patients-card">
        <div className="filters-row">
          <div className="search-row">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search by name, mobile or email..." />
            </div>

            <select className="small-select">
              <option>Gender: All</option>
              <option>Female</option>
              <option>Male</option>
            </select>


          </div>

          
        </div>

        <table className="patients-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Age / Gender</th>
              <th>Contact</th>
              <th>Joined</th>
              <th>Total Appointments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patientsLoading ? (
              <tr>
                <td colSpan="7" className="text-center">Loading patients...</td>
              </tr>
            ) : (
              patients.map((patient, idx) => (
                <tr key={patient.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="patient-info">
                      <div className="avatar">{getInitial(patient.name)}</div>
                      <div>
                        <div className="patient-name">{patient.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p>{Math.floor((Date.now() - new Date(patient.date_of_birth)) / (1000 * 60 * 60 * 24 * 365))} Years</p>
                    <p className="muted">{patient.sex}</p>
                    </td>
                  <td>
                    <div>{patient.mobile}</div>
                    <div className="muted">{patient.email}</div>
                  </td>
                  <td>{formatDate(patient.created_at)}</td>
                  <td>{patient.appointment_count}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view"><Eye size={16} /></button>
                      <button className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="table-footer">Showing {patients.length} patients</div>
      </div>
    </div>
  );
};

export default PatientsPage;