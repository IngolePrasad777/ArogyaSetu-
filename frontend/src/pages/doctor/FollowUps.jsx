import { useQuery } from '@tanstack/react-query';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchDoctorQueue } from '../../services/doctorApi.js';
import { formatDateTime, patientName } from '../../utils/doctorWorkspace.js';

export default function FollowUps() {
  const queue = useQuery({ queryKey: ['doctor-queue'], queryFn: fetchDoctorQueue });
  const followUps = (queue.data || []).filter((item) => item.appointment.status === 'COMPLETED');

  return (
    <div>
      <PageHeader title="Follow-ups" eyebrow="Continuity of care">
        Completed consultations that may require today’s follow-up review.
      </PageHeader>
      <div className="space-y-3">
        {!followUps.length && <EmptyState title="No follow-ups due" />}
        {followUps.map((item) => (
          <div className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between" key={item.appointment.appointmentId}>
            <div>
              <p className="font-bold text-slate-950">{patientName(item.patient)}</p>
              <p className="text-sm text-slate-500">Last consultation: {formatDateTime(item.appointment.appointmentDate, item.appointment.appointmentTime)}</p>
            </div>
            <span className="pill">Follow-up review</span>
          </div>
        ))}
      </div>
    </div>
  );
}
