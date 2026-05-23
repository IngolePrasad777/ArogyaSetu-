import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CalendarClock, CheckCheck, Pill, Siren } from 'lucide-react';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';

function iconFor(type) {
  if (!type) return Bell;
  const t = String(type).toUpperCase();
  if (t.includes('EMERGENCY')) return Siren;
  if (t.includes('PRESCRIPTION') || t.includes('MEDICINE')) return Pill;
  if (t.includes('APPOINTMENT')) return CalendarClock;
  return Bell;
}

export default function DoctorNotifications() {
  const qc = useQueryClient();
  const notifications = useQuery({
    queryKey: ['doctor-notifications'],
    queryFn: async () => (await api.get('/notifications')).data
  });
  const markRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/read?id=${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-notifications'] })
  });

  const items = notifications.data || [];

  return (
    <div>
      <PageHeader title="Notifications" eyebrow="Care reminders">
        Appointment reminders, emergency alerts, and medicine reminders for assigned patients.
      </PageHeader>
      {notifications.isLoading && <p className="text-sm text-slate-500">Loading...</p>}
      {!notifications.isLoading && !items.length && <EmptyState title="No notifications" />}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = iconFor(item.type);
          return (
            <article className={`card flex items-start gap-3 ${item.read ? 'opacity-60' : ''}`} key={item.notificationId}>
              <span className="rounded-md bg-clinic-50 p-3 text-clinic-700"><Icon size={20} /></span>
              <div className="flex-1">
                <h2 className="font-bold text-slate-950">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.message}</p>
              </div>
              {!item.read && (
                <button className="btn-secondary py-1 px-2 text-xs" type="button" onClick={() => markRead.mutate(item.notificationId)}>
                  <CheckCheck size={14} /> Mark read
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
