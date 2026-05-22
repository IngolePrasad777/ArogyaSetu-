import { useQuery } from '@tanstack/react-query';
import { Activity, CalendarDays, Siren, Stethoscope, UsersRound } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { api } from '../../services/api.js';

export default function Analytics() {
  const analytics = useQuery({ queryKey: ['admin-analytics'], queryFn: async () => (await api.get('/admin/analytics')).data });
  return (
    <div>
      <PageHeader title="Analytics" eyebrow="System monitoring">
        Track active users, consultations, verified doctors, appointments, and emergency triage activity.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={UsersRound} label="Users" value={analytics.data?.users} />
        <StatCard icon={Activity} tone="blue" label="Patients" value={analytics.data?.patients} />
        <StatCard icon={Stethoscope} label="Doctors" value={analytics.data?.doctors} />
        <StatCard icon={CalendarDays} tone="amber" label="Appointments" value={analytics.data?.appointments} />
        <StatCard icon={Siren} tone="rose" label="Emergency Cases" value={analytics.data?.emergencyCases} />
      </div>
    </div>
  );
}
