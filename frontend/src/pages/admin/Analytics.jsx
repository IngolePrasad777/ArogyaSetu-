import { useQuery } from '@tanstack/react-query';
import { Activity, CalendarDays, Siren, Stethoscope, UsersRound } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { api } from '../../services/api.js';
import { countByRole } from '../../utils/adminWorkspace.js';

function ProgressRow({ label, value, total }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-500">{value} ({percent}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-clinic-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const analytics = useQuery({ queryKey: ['admin-analytics'], queryFn: async () => (await api.get('/admin/analytics')).data });
  const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/admin/users')).data });
  const allUsers = users.data || [];
  const totalUsers = analytics.data?.users ?? allUsers.length;
  const patients = analytics.data?.patients ?? countByRole(allUsers, 'PATIENT');
  const doctors = analytics.data?.doctors ?? countByRole(allUsers, 'DOCTOR');
  const admins = countByRole(allUsers, 'ADMIN');
  const appointments = analytics.data?.appointments || 0;
  const emergencyCases = analytics.data?.emergencyCases || 0;
  const emergencyRate = appointments ? Math.round((emergencyCases / appointments) * 100) : 0;

  return (
    <div>
      <PageHeader title="Analytics" eyebrow="System monitoring">
        Track active users, consultations, verified doctors, appointments, and emergency triage activity.
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={UsersRound} label="Users" value={totalUsers} />
        <StatCard icon={Activity} tone="blue" label="Patients" value={patients} />
        <StatCard icon={Stethoscope} label="Doctors" value={doctors} />
        <StatCard icon={CalendarDays} tone="amber" label="Appointments" value={appointments} />
        <StatCard icon={Siren} tone="rose" label="Emergency Cases" value={emergencyCases} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="section-title">Role Distribution</h2>
          <div className="mt-5 space-y-5">
            <ProgressRow label="Patients" value={patients} total={totalUsers} />
            <ProgressRow label="Doctors" value={doctors} total={totalUsers} />
            <ProgressRow label="Admins" value={admins} total={totalUsers} />
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Operational Signals</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Emergency rate</dt>
              <dd className="mt-2 text-2xl font-bold text-rose-700">{emergencyRate}%</dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Appointment load</dt>
              <dd className="mt-2 text-2xl font-bold text-slate-950">{appointments}</dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Doctor coverage</dt>
              <dd className="mt-2 text-2xl font-bold text-clinic-700">{doctors}</dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Users per doctor</dt>
              <dd className="mt-2 text-2xl font-bold text-slate-950">{doctors ? Math.round(patients / doctors) : '-'}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
