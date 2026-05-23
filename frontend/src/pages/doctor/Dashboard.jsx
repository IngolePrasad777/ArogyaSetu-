import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, Clock, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { api } from '../../services/api.js';
import { fetchDoctorQueue } from '../../services/doctorApi.js';
import { formatDateTime, patientName, priorityTone, todayIso, triageCounts } from '../../utils/doctorWorkspace.js';
import { isActiveAppointment, isAppointmentExpired } from '../../utils/patientWorkspace.js';

export default function DoctorDashboard() {
  const appointments = useQuery({ queryKey: ['doctor-appointments'], queryFn: async () => (await api.get('/doctor/appointments')).data });
  const queue = useQuery({ queryKey: ['doctor-queue'], queryFn: fetchDoctorQueue });
  const queueItems = queue.data || [];
  const activeQueue = queueItems.filter((item) => isActiveAppointment(item.appointment));
  const pastQueue = queueItems.filter((item) => isAppointmentExpired(item.appointment) || item.appointment.status === 'COMPLETED');
  const today = todayIso();
  const todaysAppointments = activeQueue.filter((item) => item.appointment.appointmentDate === today);
  const pending = activeQueue.filter((item) => item.appointment.status === 'SCHEDULED');
  const completedToday = pastQueue.filter((item) => item.appointment.status === 'COMPLETED' && item.appointment.appointmentDate === today);
  const emergencyCases = activeQueue.filter((item) => ['HIGH', 'EMERGENCY'].includes(item.latestSymptom?.triageLevel));
  const followUpsDue = queueItems.filter((item) => item.appointment.status === 'COMPLETED').length;
  const counts = triageCounts(activeQueue);

  return (
    <div>
      <PageHeader title="Doctor Dashboard" eyebrow="Assigned care queue">
        Review today's queue, AI triage alerts, EHR context, consultations, prescriptions, and follow-ups.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={CalendarDays} label="Today's Appointments" value={todaysAppointments.length} />
        <StatCard icon={Clock} tone="amber" label="Pending Consultations" value={pending.length || appointments.data?.filter((item) => item.status === 'SCHEDULED' && isActiveAppointment(item)).length || 0} />
        <StatCard icon={AlertTriangle} tone="rose" label="Emergency Cases" value={emergencyCases.length} />
        <StatCard icon={TimerReset} tone="blue" label="Follow-ups Due" value={followUpsDue} />
        <StatCard icon={CheckCircle2} label="Completed Today" value={completedToday.length} />
        <StatCard icon={Activity} tone="blue" label="Avg Consultation Time" value="18 min" />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_340px]">
        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Today's Queue</h2>
            <Link className="btn-secondary py-2" to="/doctor/appointments">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {todaysAppointments.slice(0, 5).map((item) => (
              <div className="rounded-md border border-slate-200 p-4" key={item.appointment.appointmentId}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">{patientName(item.patient)}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDateTime(item.appointment.appointmentDate, item.appointment.appointmentTime)} · {item.appointment.consultationMode}</p>
                  </div>
                  <span className={`pill border ${priorityTone(item.latestSymptom?.triageLevel)}`}>AI Priority: {item.latestSymptom?.triageLevel || 'LOW'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.latestSymptom?.symptoms || 'No symptom summary recorded yet.'}</p>
              </div>
            ))}
            {!todaysAppointments.length && <p className="py-4 text-sm text-slate-500">No active appointments for today.</p>}
            {!!pastQueue.length && (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                {pastQueue.length} expired or completed appointment{pastQueue.length > 1 ? 's' : ''} moved to past appointments.
              </div>
            )}
          </div>
        </section>
        <section className="card">
          <h2 className="section-title">AI Triage Alerts</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 p-3 text-orange-800"><span>HIGH</span><strong>{counts.HIGH + counts.EMERGENCY}</strong></div>
            <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800"><span>MEDIUM</span><strong>{counts.MEDIUM}</strong></div>
            <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800"><span>LOW</span><strong>{counts.LOW}</strong></div>
          </div>
          <Link className="btn-primary mt-4 w-full" to="/doctor/ai-alerts">Open AI Alerts</Link>
        </section>
      </div>
    </div>
  );
}
