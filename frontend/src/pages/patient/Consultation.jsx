import { useQuery } from '@tanstack/react-query';
import { Camera, FileUp, MessageCircle, Mic, PhoneOff, Volume2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import { useAgora } from '../../contexts/AgoraContext.jsx';
import { api } from '../../services/api.js';
import { latestAppointment } from '../../utils/patientWorkspace.js';

export default function PatientConsultation() {
  const { appId } = useAgora();
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: async () => (await api.get('/appointments/history')).data });
  const ehr = useQuery({ queryKey: ['patient-ehr'], queryFn: async () => (await api.get('/patient/ehr')).data, retry: false });
  const appointment = latestAppointment(appointments.data || []);

  return (
    <div>
      <PageHeader title="Consultation" eyebrow="Video-first care">
        Join the consultation, review appointment context, upload reports, and use audio/chat fallback when network quality drops.
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="card">
          <div className="flex min-h-[420px] items-center justify-center rounded-lg bg-slate-900 text-white">
            <div className="text-center">
              <Camera className="mx-auto" size={52} />
              <p className="mt-3 font-semibold">Video consultation room</p>
              <p className="mt-2 text-sm text-slate-300">{appId ? 'Agora configured' : 'Agora credentials not configured'}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <button className="btn-secondary"><FileUp size={18} /> Upload</button>
            <button className="btn-secondary"><MessageCircle size={18} /> Chat</button>
            <button className="btn-secondary"><Mic size={18} /> Mute</button>
            <button className="btn-secondary"><Camera size={18} /> Camera</button>
            <button className="btn-secondary"><Volume2 size={18} /> Audio</button>
            <button className="btn-primary bg-rose-700 hover:bg-rose-600"><PhoneOff size={18} /> Leave</button>
          </div>
        </section>
        <aside className="card space-y-4">
          <h2 className="section-title">Consultation Context</h2>
          <div className="rounded-md bg-clinic-50 p-4">
            <p className="text-sm font-semibold text-clinic-700">Doctor</p>
            <p className="mt-1 font-bold text-slate-950">{appointment?.doctorName || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Symptoms</p>
            <p className="mt-1 text-slate-700">{ehr.data?.consultationHistory || 'No latest symptom summary attached.'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">AI Result</p>
            <p className="mt-1 text-slate-700">Review triage result from Symptoms before consultation.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Appointment Info</p>
            <p className="mt-1 text-slate-700">{appointment ? `${appointment.appointmentDate} at ${appointment.appointmentTime} · ${appointment.consultationMode}` : 'No scheduled appointment.'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
