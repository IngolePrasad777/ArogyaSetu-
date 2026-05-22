import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchDoctorQueue } from '../../services/doctorApi.js';
import { patientName } from '../../utils/doctorWorkspace.js';

export default function DoctorEhr() {
  const queue = useQuery({ queryKey: ['doctor-queue'], queryFn: fetchDoctorQueue });
  const patients = Array.from(new Map((queue.data || []).map((item) => [item.patient.patientId, item])).values());

  return (
    <div>
      <PageHeader title="EHR Viewer" eyebrow="Assigned patient records">
        Select an assigned patient to view profile, symptoms, EHR, reports, past consultations, and prescriptions.
      </PageHeader>
      <div className="space-y-3">
        {!patients.length && <EmptyState title="No EHR records available" />}
        {patients.map((item) => (
          <div className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between" key={item.patient.patientId}>
            <div>
              <p className="font-bold text-slate-950">{patientName(item.patient)}</p>
              <p className="text-sm text-slate-500">Reports, consultation history, prescription history, allergies, and current medicines.</p>
            </div>
            <Link className="btn-primary" to={`/doctor/patients/${item.patient.patientId}`}>Open EHR</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
