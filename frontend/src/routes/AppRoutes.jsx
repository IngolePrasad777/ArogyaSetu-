import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Landing from '../pages/Landing.jsx';
import Meeting from '../pages/Meeting.jsx';
import PatientDashboard from '../pages/patient/Dashboard.jsx';
import Symptoms from '../pages/patient/Symptoms.jsx';
import PatientAppointments from '../pages/patient/Appointments.jsx';
import PatientConsultation from '../pages/patient/Consultation.jsx';
import PatientEhr from '../pages/patient/Ehr.jsx';
import PatientNotifications from '../pages/patient/Notifications.jsx';
import PatientFollowUp from '../pages/patient/FollowUp.jsx';
import PatientOfflineQueue from '../pages/patient/OfflineQueue.jsx';
import DoctorDashboard from '../pages/doctor/Dashboard.jsx';
import DoctorAppointments from '../pages/doctor/Appointments.jsx';
import PatientDetails from '../pages/doctor/PatientDetails.jsx';
import DoctorConsultation from '../pages/doctor/Consultation.jsx';
import Prescription from '../pages/doctor/Prescription.jsx';
import DoctorPatients from '../pages/doctor/Patients.jsx';
import DoctorEhr from '../pages/doctor/Ehr.jsx';
import AiAlerts from '../pages/doctor/AiAlerts.jsx';
import DoctorNotifications from '../pages/doctor/Notifications.jsx';
import FollowUps from '../pages/doctor/FollowUps.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import Analytics from '../pages/admin/Analytics.jsx';
import Users from '../pages/admin/Users.jsx';
import AuditLogs from '../pages/admin/AuditLogs.jsx';
import DoctorVerification from '../pages/admin/DoctorVerification.jsx';

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute roles={['PATIENT']} />}>
          <Route path="/patient" element={<AppLayout />}>
            <Route index element={<PatientDashboard />} />
            <Route path="symptoms" element={<Symptoms />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="consultation" element={<PatientConsultation />} />
            <Route path="meeting" element={<Meeting role="patient" />} />
            <Route path="ehr" element={<PatientEhr />} />
            <Route path="notifications" element={<PatientNotifications />} />
            <Route path="follow-up" element={<PatientFollowUp />} />
            <Route path="offline-queue" element={<PatientOfflineQueue />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute roles={['DOCTOR']} />}>
          <Route path="/doctor" element={<AppLayout />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="patients/:id" element={<PatientDetails />} />
            <Route path="ehr" element={<DoctorEhr />} />
            <Route path="consultation" element={<DoctorConsultation />} />
            <Route path="meeting" element={<Meeting role="doctor" />} />
            <Route path="prescription" element={<Prescription />} />
            <Route path="ai-alerts" element={<AiAlerts />} />
            <Route path="notifications" element={<DoctorNotifications />} />
            <Route path="follow-ups" element={<FollowUps />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="doctor-verification" element={<DoctorVerification />} />
          </Route>
        </Route>
    </Routes>
  );
}
