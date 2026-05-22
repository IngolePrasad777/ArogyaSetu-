import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchDoctorQueue } from '../../services/doctorApi.js';
import { patientName, priorityTone } from '../../utils/doctorWorkspace.js';

export default function AiAlerts() {
  const queue = useQuery({ queryKey: ['doctor-queue'], queryFn: fetchDoctorQueue });
  const alerts = (queue.data || []).filter((item) => ['HIGH', 'EMERGENCY'].includes(item.latestSymptom?.triageLevel));

  return (
    <div>
      <PageHeader title="AI Alerts" eyebrow="Priority triage queue">
        High-risk AI triage cases that need faster review.
      </PageHeader>
      <div className="space-y-3">
        {!alerts.length && <EmptyState title="No high-priority AI alerts" />}
        {alerts.map((item) => (
          <article className={`card border-l-4 ${priorityTone(item.latestSymptom?.triageLevel)}`} key={item.appointment.appointmentId}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold text-slate-950">{patientName(item.patient)}</p>
                <p className="mt-1 text-sm text-slate-600">{item.latestSymptom?.symptoms}</p>
                <p className="mt-1 text-sm text-slate-500">Suggested: {item.latestSymptom?.recommendedDoctor || '-'}</p>
              </div>
              <Link className="btn-primary" to={`/doctor/patients/${item.patient.patientId}`}>Review</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
