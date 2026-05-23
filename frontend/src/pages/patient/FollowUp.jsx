import { useQuery } from '@tanstack/react-query';
import { CalendarDays, FileCheck2, Stethoscope } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { formatShortDate, latestAppointment } from '../../utils/patientWorkspace.js';

export default function PatientFollowUp() {
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: async () => (await api.get('/appointments/history')).data });
  const ehr = useQuery({ queryKey: ['patient-ehr'], queryFn: async () => (await api.get('/patient/ehr')).data, retry: false });
  const appointment = latestAppointment(appointments.data || []);
  const followUpDate = appointment?.appointmentDate ? new Date(`${appointment.appointmentDate}T00:00:00`) : null;
  if (followUpDate) followUpDate.setDate(followUpDate.getDate() + 3);

  return (
    <div>
      <PageHeader title="Follow-up" eyebrow="Post-consultation care">
        Track revisit date, active medicines, and doctor advice after consultation.
      </PageHeader>
      <section className="card">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Stethoscope size={16} /> Doctor</p>
            <p className="mt-2 font-bold text-slate-950">{appointment?.doctorName || 'Not assigned'}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarDays size={16} /> Date</p>
            <p className="mt-2 font-bold text-slate-950">{followUpDate ? formatShortDate(followUpDate.toISOString()) : 'Not set'}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500"><FileCheck2 size={16} /> Medicines</p>
            <p className="mt-2 font-bold text-slate-950">{ehr.data?.prescriptionHistory ? 'Active' : 'None'}</p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-700">Status</p>
            <p className="mt-2 font-bold text-amber-900">Pending</p>
          </div>
        </div>
        <div className="mt-4 rounded-md border border-slate-200 p-4">
          <h2 className="section-title">Doctor Advice</h2>
          <p className="mt-3 text-slate-600">Continue medicines as prescribed, upload reports before follow-up, and return immediately if symptoms worsen.</p>
        </div>
      </section>
    </div>
  );
}
