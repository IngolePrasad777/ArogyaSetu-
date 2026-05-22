import { Bell, Brain, CalendarDays, FileClock, FileText, HeartPulse, Home, LogOut, ShieldCheck, Stethoscope, Users, Wifi, WifiOff } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useOfflineSync } from '../hooks/useOfflineSync.js';
import LanguageSwitch from '../components/LanguageSwitch.jsx';

const nav = {
  PATIENT: [
    ['Dashboard', '/patient', Home],
    ['Symptoms', '/patient/symptoms', Stethoscope],
    ['Appointments', '/patient/appointments', CalendarDays],
    ['Consultation', '/patient/consultation', Users],
    ['EHR', '/patient/ehr', FileText],
    ['Notifications', '/patient/notifications', Bell]
  ],
  DOCTOR: [
    ['Dashboard', '/doctor', Home],
    ['Appointments', '/doctor/appointments', CalendarDays],
    ['Patients', '/doctor/patients', Users],
    ['EHR', '/doctor/ehr', FileText],
    ['Consultation', '/doctor/consultation', Stethoscope],
    ['Prescription', '/doctor/prescription', FileText],
    ['AI Alerts', '/doctor/ai-alerts', Brain],
    ['Notifications', '/doctor/notifications', Bell],
    ['Follow-ups', '/doctor/follow-ups', FileClock]
  ],
  ADMIN: [
    ['Dashboard', '/admin', Home],
    ['Analytics', '/admin/analytics', ShieldCheck],
    ['Users', '/admin/users', Users],
    ['Audit Logs', '/admin/audit-logs', FileText],
    ['Doctor Verification', '/admin/doctor-verification', Stethoscope]
  ]
};

export default function AppLayout() {
  const { profile, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const { online, synced } = useOfflineSync();
  const items = nav[profile?.role] || nav.PATIENT;

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-clinic-700 text-white"><HeartPulse size={23} /></span>
            <div>
              <p className="text-xl font-bold text-slate-950">ArogyaSetu+</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">{online ? <Wifi size={13} /> : <WifiOff size={13} />} {online ? 'Online' : 'Offline mode'} {synced ? `- synced ${synced}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <button className="btn-secondary py-2" onClick={() => { clearSession(); navigate('/login'); }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[250px_1fr]">
        <nav className="grid grid-cols-2 gap-2 md:sticky md:top-24 md:block md:h-fit md:space-y-2">
          {items.map(([label, href, Icon]) => (
            <NavLink key={href} to={href} end className={({ isActive }) => `flex min-h-12 items-center gap-2 rounded-md border px-3 py-3 text-sm font-semibold ${isActive ? 'border-clinic-700 bg-clinic-700 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-clinic-50'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
