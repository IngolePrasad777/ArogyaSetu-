import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchDoctorQueue } from '../../services/doctorApi.js';
import { patientName, priorityTone } from '../../utils/doctorWorkspace.js';

export default function DoctorPatients() {
  const queue = useQuery({ queryKey: ['doctor-queue'], queryFn: fetchDoctorQueue });
  const patients = Array.from(new Map((queue.data || []).map((item) => [item.patient.patientId, item])).values());

  return (
    <div>
      <PageHeader title="Patients" eyebrow="Assigned records">
        Open assigned patients, review symptoms, AI triage, EHR, reports, consultations, and prescriptions.
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        {!patients.length && <EmptyState title="No assigned patients" />}
        {patients.map((item) => (
          <article className="card" key={item.patient.patientId}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{patientName(item.patient)}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.patient.phone || 'No phone'} · {item.patient.bloodGroup || 'Blood group not set'}</p>
              </div>
              <span className={`pill border ${priorityTone(item.latestSymptom?.triageLevel)}`}>{item.latestSymptom?.triageLevel || 'LOW'}</span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{item.latestSymptom?.symptoms || 'No symptoms recorded.'}</p>
            <Link className="btn-primary mt-4" to={`/doctor/patients/${item.patient.patientId}`}>Open record</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
