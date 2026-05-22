import { Bell, CalendarClock, Pill, Siren } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';

const notifications = [
  ['Appointment reminder', 'Upcoming video consultation in the assigned queue.', CalendarClock],
  ['Emergency alert', 'High-priority AI triage case requires review.', Siren],
  ['Medicine reminder', 'Prescription follow-up reminders are ready for patient notification.', Pill]
];

export default function DoctorNotifications() {
  return (
    <div>
      <PageHeader title="Notifications" eyebrow="Care reminders">
        Appointment reminders, emergency alerts, and medicine reminders for assigned patients.
      </PageHeader>
      <div className="space-y-3">
        {notifications.map(([title, message, Icon]) => (
          <article className="card flex items-start gap-3" key={title}>
            <span className="rounded-md bg-clinic-50 p-3 text-clinic-700">{Icon ? <Icon size={20} /> : <Bell size={20} />}</span>
            <div>
              <h2 className="font-bold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{message}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
