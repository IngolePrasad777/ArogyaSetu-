import { useQuery } from '@tanstack/react-query';
import { Bell, CalendarDays, FileCheck2, RefreshCw, ShieldAlert, TimerReset } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';

const tabs = ['All', 'Appointments', 'Emergency', 'Prescription', 'Follow-up', 'Sync'];
const examples = [
  { notificationId: 'appointment-demo', title: 'Appointment tomorrow', message: 'Your video consultation is scheduled for tomorrow morning.', category: 'Appointments', icon: CalendarDays },
  { notificationId: 'prescription-demo', title: 'Prescription uploaded', message: 'Doctor has uploaded your prescription to EHR.', category: 'Prescription', icon: FileCheck2 },
  { notificationId: 'sync-demo', title: 'Offline synced', message: 'Pending symptoms and reports are synced.', category: 'Sync', icon: RefreshCw },
  { notificationId: 'followup-demo', title: 'Follow-up due', message: 'Your follow-up visit is pending this week.', category: 'Follow-up', icon: TimerReset }
];

function categoryFor(item) {
  const text = `${item.title} ${item.message}`.toLowerCase();
  if (text.includes('emergency') || text.includes('high risk')) return 'Emergency';
  if (text.includes('prescription') || text.includes('medicine')) return 'Prescription';
  if (text.includes('follow')) return 'Follow-up';
  if (text.includes('sync') || text.includes('offline')) return 'Sync';
  return 'Appointments';
}

export default function PatientNotifications() {
  const [tab, setTab] = useState('All');
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: async () => (await api.get('/patient/notifications')).data });
  const allNotifications = useMemo(() => [
    ...(notifications.data || []).map((item) => ({ ...item, category: categoryFor(item), icon: categoryFor(item) === 'Emergency' ? ShieldAlert : Bell })),
    ...examples
  ], [notifications.data]);
  const filtered = tab === 'All' ? allNotifications : allNotifications.filter((item) => item.category === tab);

  return (
    <div>
      <PageHeader title="Notifications" eyebrow="Patient updates">
        Appointment reminders, prescriptions, emergency alerts, follow-ups, and offline sync status.
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((item) => <button key={item} className={`pill ${tab === item ? 'border-clinic-700 bg-clinic-700 text-white' : ''}`} type="button" onClick={() => setTab(item)}>{item}</button>)}
      </div>
      <div className="space-y-3">
        {!filtered.length && <EmptyState title="No notifications" />}
        {filtered.map((item) => {
          const Icon = item.icon || Bell;
          return (
            <article className="card" key={item.notificationId}>
              <div className="flex items-start gap-3">
                <span className="rounded-md bg-clinic-50 p-2 text-clinic-700"><Icon size={18} /></span>
                <div>
                  <p className="font-bold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-slate-600">{item.message}</p>
                  <span className="pill mt-3">{item.category}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
