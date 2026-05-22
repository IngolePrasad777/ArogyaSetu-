import { useQuery } from '@tanstack/react-query';
import EmptyState from '../../components/EmptyState.jsx';
import { api } from '../../services/api.js';

export default function PatientNotifications() {
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: async () => (await api.get('/patient/notifications')).data });
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold">Notifications</h2>
      {!notifications.data?.length && <EmptyState title="No notifications" />}
      {notifications.data?.map((n) => <div className="card" key={n.notificationId}><p className="font-bold">{n.title}</p><p className="text-slate-600">{n.message}</p></div>)}
    </div>
  );
}
