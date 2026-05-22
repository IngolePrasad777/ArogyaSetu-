import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, FilePlus2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { fetchDoctorQueue } from '../../services/doctorApi.js';
import { formatDateTime, patientName, priorityTone } from '../../utils/doctorWorkspace.js';

export default function DoctorConsultation() {
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: { appointmentId: params.get('appointmentId') || '', mode: 'VIDEO', outcome: 'Completed' }
  });
  const queue = useQuery({ queryKey: ['doctor-queue'], queryFn: fetchDoctorQueue });
  const selectedAppointmentId = watch('appointmentId');
  const selectedItem = queue.data?.find((item) => item.appointment.appointmentId === selectedAppointmentId);
  const appointmentStartsAt = selectedItem ? new Date(`${selectedItem.appointment.appointmentDate}T${selectedItem.appointment.appointmentTime}`) : null;
  const consultationOpen = !appointmentStartsAt || appointmentStartsAt.getTime() <= Date.now();
  const mutation = useMutation({
    mutationFn: (data) => api.post('/doctor/consultation', {
      appointmentId: data.appointmentId,
      mode: data.mode,
      notes: `Notes: ${data.notes || ''}\nFollow-up: ${data.followUpDate || 'Not set'}\nOutcome: ${data.outcome || 'Completed'}`,
      diagnosis: data.diagnosis
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor-appointments'] });
      qc.invalidateQueries({ queryKey: ['doctor-queue'] });
    }
  });

  useEffect(() => {
    if (!selectedAppointmentId && queue.data?.[0]?.appointment.appointmentId) setValue('appointmentId', queue.data[0].appointment.appointmentId);
  }, [queue.data, selectedAppointmentId, setValue]);

  return (
    <div>
      <PageHeader title="Consultation" eyebrow="Doctor workflow">
        Review symptoms and AI triage before saving notes, diagnosis, outcome, and follow-up.
      </PageHeader>
      <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <section className="card space-y-4">
          <label>
            <span className="text-sm font-semibold text-slate-600">Appointment</span>
            <select className="input mt-2" {...register('appointmentId', { required: true })}>
              {queue.data?.map((item) => (
                <option key={item.appointment.appointmentId} value={item.appointment.appointmentId}>
                  {patientName(item.patient)} - {item.appointment.appointmentDate} {item.appointment.appointmentTime} - {item.appointment.status}
                </option>
              ))}
            </select>
          </label>
          {selectedItem && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-500">Patient</p>
                <p className="mt-1 font-bold text-slate-950">{patientName(selectedItem.patient)}</p>
              </div>
              <div className={`rounded-md border p-4 ${priorityTone(selectedItem.latestSymptom?.triageLevel)}`}>
                <p className="text-sm font-semibold">Priority</p>
                <p className="mt-1 font-bold">{selectedItem.latestSymptom?.triageLevel || 'LOW'}</p>
              </div>
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-500">Consultation</p>
                <p className="mt-1 flex items-center gap-2 font-bold text-slate-950"><CalendarClock size={18} /> {selectedItem.appointment.consultationMode}</p>
                {!consultationOpen && <p className="mt-2 text-sm font-semibold text-orange-700">Opens at scheduled time.</p>}
              </div>
            </div>
          )}
        </section>

        {selectedItem && (
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="card">
              <h2 className="section-title">Symptoms Summary</h2>
              <p className="mt-3 text-slate-900">{selectedItem.latestSymptom?.symptoms || 'No symptoms recorded.'}</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold text-slate-500">AI output</dt><dd>{selectedItem.latestSymptom?.recommendedDoctor || '-'}</dd></div>
                <div><dt className="font-semibold text-slate-500">Pain level</dt><dd>{selectedItem.latestSymptom?.painLevel ?? '-'}</dd></div>
                <div><dt className="font-semibold text-slate-500">Duration</dt><dd>{selectedItem.latestSymptom?.duration || '-'}</dd></div>
                <div><dt className="font-semibold text-slate-500">Appointment</dt><dd>{formatDateTime(selectedItem.appointment.appointmentDate, selectedItem.appointment.appointmentTime)}</dd></div>
              </dl>
            </div>
            <div className="card">
              <h2 className="section-title">Consultation Outcome</h2>
              <select className="input mt-3" {...register('outcome')}>
                <option>Completed</option>
                <option>Need Follow-up</option>
                <option>Emergency Referral</option>
                <option>Hospitalization</option>
              </select>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-600">Follow-up date</span>
                <input className="input mt-2" type="date" {...register('followUpDate')} />
              </label>
            </div>
          </section>
        )}

        <section className="card grid gap-4 lg:grid-cols-2">
          <label>
            <span className="text-sm font-semibold text-slate-600">Doctor Notes</span>
            <textarea className="input mt-2 min-h-40" placeholder="Clinical notes, observations, vitals, advice" {...register('notes')} />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-600">Diagnosis</span>
            <textarea className="input mt-2 min-h-40" placeholder="Diagnosis and clinical reasoning" {...register('diagnosis')} />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-600">Mode</span>
            <select className="input mt-2" {...register('mode')}><option>VIDEO</option><option>AUDIO</option><option>CHAT</option><option>ASYNC</option></select>
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <button className="btn-secondary" type="button"><Save size={18} /> Save Notes</button>
            <button className="btn-primary" disabled={mutation.isPending || !selectedAppointmentId || !consultationOpen}><CheckCircle2 size={18} /> Complete Consultation</button>
          </div>
          {!consultationOpen && <p className="lg:col-span-2 text-sm font-semibold text-orange-700">This consultation can be completed only at or after the scheduled appointment time. You can still review EHR and prepare notes before then.</p>}
        </section>

        {mutation.isSuccess && (
          <section className="card bg-clinic-50">
            <p className="font-semibold text-clinic-700">Consultation saved to EHR.</p>
            <p className="mt-1 text-sm text-slate-600">Channel: {mutation.data.data.agoraChannel}</p>
            <Link className="btn-secondary mt-3" to={`/doctor/prescription?consultationId=${mutation.data.data.consultationId}`}>
              <FilePlus2 size={18} /> Generate Prescription
            </Link>
          </section>
        )}
      </form>
    </div>
  );
}
