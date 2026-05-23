import { useQuery } from '@tanstack/react-query';
import { Activity, CalendarDays, FileText, ShieldAlert, ShieldCheck, Stethoscope, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { api } from '../../services/api.js';
import { actionTone, countByRole, formatDateTime, recentItems } from '../../utils/adminWorkspace.js';

export default function AdminDashboard() {
  const analytics = useQuery({ queryKey: ['admin-analytics'], queryFn: async () => (await api.get('/admin/analytics')).data });
  const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/admin/users')).data });
  const logs = useQuery({ queryKey: ['audit-logs'], queryFn: async () => (await api.get('/admin/audit-logs')).data });
  const allUsers = users.data || [];
  const doctorAccounts = countByRole(allUsers, 'DOCTOR');
  const patientAccounts = countByRole(allUsers, 'PATIENT');
  const adminAccounts = countByRole(allUsers, 'ADMIN');
  const emergencyCases = analytics.data?.emergencyCases || 0;

  return (
    <div>
      <PageHeader title="Admin Command Center" eyebrow="Platform operations">
        Monitor users, doctors, appointments, emergency activity, and sensitive events from one place.
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersRound} label="Total Users" value={analytics.data?.users ?? allUsers.length} />
        <StatCard icon={Stethoscope} tone="blue" label="Doctor Accounts" value={analytics.data?.doctors ?? doctorAccounts} />
        <StatCard icon={CalendarDays} tone="amber" label="Appointments" value={analytics.data?.appointments} />
        <StatCard icon={ShieldAlert} tone="rose" label="Emergency Cases" value={emergencyCases} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-title">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-500">Latest authentication, appointment, EHR, and triage events.</p>
            </div>
            <Link className="btn-secondary" to="/admin/audit-logs"><FileText size={18} /> View logs</Link>
          </div>
          <div className="mt-4 space-y-3">
            {!recentItems(logs.data).length && <EmptyState title="No audit events found" />}
            {recentItems(logs.data).map((log) => (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={log.auditId}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${actionTone(log.action)}`}>{log.action}</span>
                  <span className="text-xs font-semibold text-slate-500">{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{log.actorEmail || 'System'} · {log.resourceType || 'Platform'}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title">System Health</h2>
              <span className="rounded-md bg-emerald-50 p-2 text-emerald-700"><ShieldCheck size={18} /></span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between"><dt className="text-slate-500">API status</dt><dd className="font-bold text-emerald-700">Operational</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Patients</dt><dd className="font-bold text-slate-900">{analytics.data?.patients ?? patientAccounts}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Admins</dt><dd className="font-bold text-slate-900">{adminAccounts}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Emergency load</dt><dd className="font-bold text-rose-700">{emergencyCases}</dd></div>
            </dl>
          </section>

          <section className="card">
            <h2 className="section-title">Quick Actions</h2>
            <div className="mt-4 grid gap-2">
              <Link className="btn-secondary justify-start" to="/admin/users"><UsersRound size={18} /> Manage users</Link>
              <Link className="btn-secondary justify-start" to="/admin/doctor-verification"><Stethoscope size={18} /> Doctor verification</Link>
              <Link className="btn-secondary justify-start" to="/admin/analytics"><Activity size={18} /> Open analytics</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
