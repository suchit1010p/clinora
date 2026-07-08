import React from "react";
import { Bell, Search, Plus, Eye, Pencil, Trash2, DownloadCloud, Users, Heart } from "lucide-react";
import "./styles/Patients.css";

const samplePatients = [
  {
    id: "PT-1001",
    name: "Anjali Verma",
    age: 28,
    gender: "Female",
    phone: "9876543210",
    email: "anjali.verma@gmail.com",
    lastVisit: "May 24, 2025",
    appointments: 5,
    status: "Active",
  },
  {
    id: "PT-1002",
    name: "Rohit Patel",
    age: 34,
    gender: "Male",
    phone: "9123456780",
    email: "rohit.patel@gmail.com",
    lastVisit: "May 22, 2025",
    appointments: 3,
    status: "Active",
  },
  {
    id: "PT-1003",
    name: "Suresh Kumar",
    age: 62,
    gender: "Male",
    phone: "9988776655",
    email: "suresh.kumar@gmail.com",
    lastVisit: "May 18, 2025",
    appointments: 8,
    status: "Active",
  },
  {
    id: "PT-1005",
    name: "Amit Joshi",
    age: 45,
    gender: "Male",
    phone: "9012345678",
    email: "amit.joshi@gmail.com",
    lastVisit: "Apr 30, 2025",
    appointments: 6,
    status: "Inactive",
  },
];

const PatientsPage = () => {
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
            <h2>156</h2>
            <small>All time</small>
          </div>
        </div>

        <div className="card">
          <div className="icon green"><Plus /></div>
          <div className="card-content">
            <span>New This Month</span>
            <h2>12</h2>
            <small>This month</small>
          </div>
        </div>

        <div className="card">
          <div className="icon orange"><Heart /></div>
          <div className="card-content">
            <span>Active Patients</span>
            <h2>142</h2>
            <small>Currently receiving care</small>
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

          <div className="actions-row">
            <button className="add-btn">
              <Plus size={16} /> Add Patient
            </button>
          </div>
        </div>

        <table className="patients-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Age / Gender</th>
              <th>Contact</th>
              <th>Last Visit</th>
              <th>Total Appointments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {samplePatients.map((p, idx) => (
              <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>
                  <div className="patient-info">
                    <div className="avatar">{p.name.split(" ")[0][0]}</div>
                    <div>
                      <div className="patient-name">{p.name}</div>
                      <div className="patient-id">{p.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{p.age} / {p.gender}</div>
                </td>
                <td>
                  <div>{p.phone}</div>
                  <div className="muted">{p.email}</div>
                </td>
                <td>{p.lastVisit}</td>
                <td>{p.appointments}</td>
                <td>
                  <span className={`pill ${p.status === "Active" ? "active" : "inactive"}`}>{p.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">Showing 1 to 7 of 156 patients</div>

      </div>
    </div>
  );
};

export default PatientsPage;